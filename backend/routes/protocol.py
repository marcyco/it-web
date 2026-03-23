from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.schemas import (
    FaultSimulation, FaultSimulationCreate, ApiResponse
)
from database import db
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

protocol_bp = Blueprint('protocol', __name__, url_prefix='/api/protocol')


@protocol_bp.route('/stack/status', methods=['GET'])
@jwt_required()
def get_stack_status():
    """
    获取协议栈状态
    
    查询参数:
        experiment_id: 实验ID（必需）
    
    返回:
        ApiResponse: 协议栈状态
    """
    try:
        current_user_id = get_jwt_identity()
        experiment_id = request.args.get('experiment_id')
        
        if not experiment_id:
            return jsonify({
                'success': False,
                'message': '缺少实验ID',
                'error': 'missing_experiment_id'
            }), 400
        
        # 验证实验所有权
        experiments_collection = db.get_collection('experiments')
        experiment = experiments_collection.find_one({
            '_id': ObjectId(experiment_id),
            'user_id': current_user_id
        })
        
        if not experiment:
            return jsonify({
                'success': False,
                'message': '实验不存在',
                'error': 'experiment_not_found'
            }), 404
        
        # 获取协议栈状态
        from routes.experiments import running_experiments
        
        if experiment_id in running_experiments:
            simulator = running_experiments[experiment_id]['simulator']
            is_running = simulator.is_running
            packet_count = len(simulator.get_packets())
        else:
            is_running = False
            packets_collection = db.get_collection('packets')
            packet_count = packets_collection.count_documents({'experiment_id': experiment_id})
        
        # 获取各层协议信息
        layers = [
            {
                'name': '应用层',
                'protocols': ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS'],
                'status': 'active' if is_running else 'idle'
            },
            {
                'name': '传输层',
                'protocols': ['TCP', 'UDP'],
                'status': 'active' if is_running else 'idle'
            },
            {
                'name': '网络层',
                'protocols': ['IP', 'ICMP', 'ARP'],
                'status': 'active' if is_running else 'idle'
            },
            {
                'name': '数据链路层',
                'protocols': ['Ethernet', 'WiFi'],
                'status': 'active' if is_running else 'idle'
            },
            {
                'name': '物理层',
                'protocols': ['Physical'],
                'status': 'active' if is_running else 'idle'
            }
        ]
        
        return jsonify({
            'success': True,
            'message': '获取协议栈状态成功',
            'data': {
                'is_running': is_running,
                'packet_count': packet_count,
                'layers': layers
            }
        }), 200
        
    except Exception as e:
        logger.error(f"获取协议栈状态失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取协议栈状态失败',
            'error': str(e)
        }), 500


@protocol_bp.route('/stack/send', methods=['POST'])
@jwt_required()
def send_packet():
    """
    发送数据包
    
    请求体:
        experiment_id: 实验ID
        payload: 数据包载荷（可选）
    
    返回:
        ApiResponse: 发送的数据包信息
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        experiment_id = data.get('experiment_id')
        payload = data.get('payload')
        
        if not experiment_id:
            return jsonify({
                'success': False,
                'message': '缺少实验ID',
                'error': 'missing_experiment_id'
            }), 400
        
        # 验证实验所有权
        experiments_collection = db.get_collection('experiments')
        experiment = experiments_collection.find_one({
            '_id': ObjectId(experiment_id),
            'user_id': current_user_id
        })
        
        if not experiment:
            return jsonify({
                'success': False,
                'message': '实验不存在',
                'error': 'experiment_not_found'
            }), 404
        
        # 获取模拟器
        from routes.experiments import running_experiments
        
        if experiment_id not in running_experiments:
            return jsonify({
                'success': False,
                'message': '实验未运行',
                'error': 'experiment_not_running'
            }), 400
        
        simulator = running_experiments[experiment_id]['simulator']
        fault_simulator = running_experiments[experiment_id]['fault_simulator']
        
        # 创建数据包
        packet = simulator.create_packet(payload)
        
        # 应用故障模拟
        packet = fault_simulator.apply_fault(packet)
        
        # 保存到数据库
        packets_collection = db.get_collection('packets')
        packet_data = {
            'experiment_id': packet.experiment_id,
            'sequence_number': packet.sequence_number,
            'timestamp': packet.timestamp,
            'source_ip': packet.source_ip,
            'destination_ip': packet.destination_ip,
            'source_port': packet.source_port,
            'destination_port': packet.destination_port,
            'protocol': packet.protocol.value,
            'size': packet.size,
            'status': packet.status.value,
            'layers': [layer.model_dump() for layer in packet.layers],
            'raw_data': packet.raw_data
        }
        
        result = packets_collection.insert_one(packet_data)
        
        logger.info(f"发送数据包: {packet.sequence_number}")
        
        return jsonify({
            'success': True,
            'message': '数据包发送成功',
            'data': {
                'id': str(result.inserted_id),
                **packet_data
            }
        }), 201
        
    except Exception as e:
        logger.error(f"发送数据包失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '发送数据包失败',
            'error': str(e)
        }), 500


@protocol_bp.route('/faults', methods=['POST'])
@jwt_required()
def enable_fault():
    """
    启用故障模拟
    
    请求体:
        experiment_id: 实验ID
        fault_type: 故障类型
        enabled: 是否启用
        parameters: 故障参数（可选）
    
    返回:
        ApiResponse: 故障模拟信息
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证输入数据
        fault_create = FaultSimulationCreate(**data)
        
        # 验证实验所有权
        experiments_collection = db.get_collection('experiments')
        experiment = experiments_collection.find_one({
            '_id': ObjectId(fault_create.experiment_id),
            'user_id': current_user_id
        })
        
        if not experiment:
            return jsonify({
                'success': False,
                'message': '实验不存在',
                'error': 'experiment_not_found'
            }), 404
        
        # 获取故障模拟器
        from routes.experiments import running_experiments
        
        if fault_create.experiment_id not in running_experiments:
            return jsonify({
                'success': False,
                'message': '实验未运行',
                'error': 'experiment_not_running'
            }), 400
        
        fault_simulator = running_experiments[fault_create.experiment_id]['fault_simulator']
        
        # 启用故障
        fault = fault_simulator.enable_fault(fault_create)
        
        # 保存到数据库
        faults_collection = db.get_collection('faults')
        fault_data = {
            'experiment_id': fault.experiment_id,
            'fault_type': fault.fault_type.value,
            'enabled': fault.enabled,
            'parameters': fault.parameters,
            'created_at': fault.created_at
        }
        
        # 检查是否已存在
        existing = faults_collection.find_one({
            'experiment_id': fault.experiment_id,
            'fault_type': fault.fault_type.value
        })
        
        if existing:
            faults_collection.update_one(
                {'_id': existing['_id']},
                {'$set': fault_data}
            )
        else:
            faults_collection.insert_one(fault_data)
        
        logger.info(f"启用故障模拟: {fault.fault_type.value}")
        
        return jsonify({
            'success': True,
            'message': '故障模拟启用成功',
            'data': fault_data
        }), 201
        
    except Exception as e:
        logger.error(f"启用故障模拟失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '启用故障模拟失败',
            'error': str(e)
        }), 500


@protocol_bp.route('/faults/<fault_type>', methods=['DELETE'])
@jwt_required()
def disable_fault(fault_type):
    """
    禁用故障模拟
    
    路径参数:
        fault_type: 故障类型
    
    查询参数:
        experiment_id: 实验ID（必需）
    
    返回:
        ApiResponse: 禁用结果
    """
    try:
        current_user_id = get_jwt_identity()
        experiment_id = request.args.get('experiment_id')
        
        if not experiment_id:
            return jsonify({
                'success': False,
                'message': '缺少实验ID',
                'error': 'missing_experiment_id'
            }), 400
        
        # 验证实验所有权
        experiments_collection = db.get_collection('experiments')
        experiment = experiments_collection.find_one({
            '_id': ObjectId(experiment_id),
            'user_id': current_user_id
        })
        
        if not experiment:
            return jsonify({
                'success': False,
                'message': '实验不存在',
                'error': 'experiment_not_found'
            }), 404
        
        # 获取故障模拟器
        from routes.experiments import running_experiments
        
        if experiment_id not in running_experiments:
            return jsonify({
                'success': False,
                'message': '实验未运行',
                'error': 'experiment_not_running'
            }), 400
        
        fault_simulator = running_experiments[experiment_id]['fault_simulator']
        
        # 禁用故障
        from models.schemas import FaultType
        fault_type_enum = FaultType(fault_type)
        success = fault_simulator.disable_fault(fault_type_enum)
        
        if not success:
            return jsonify({
                'success': False,
                'message': '故障不存在',
                'error': 'fault_not_found'
            }), 404
        
        # 更新数据库
        faults_collection = db.get_collection('faults')
        faults_collection.update_one(
            {'experiment_id': experiment_id, 'fault_type': fault_type},
            {'$set': {'enabled': False}}
        )
        
        logger.info(f"禁用故障模拟: {fault_type}")
        
        return jsonify({
            'success': True,
            'message': '故障模拟禁用成功'
        }), 200
        
    except Exception as e:
        logger.error(f"禁用故障模拟失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '禁用故障模拟失败',
            'error': str(e)
        }), 500


@protocol_bp.route('/faults', methods=['GET'])
@jwt_required()
def get_faults():
    """
    获取故障模拟列表
    
    查询参数:
        experiment_id: 实验ID（必需）
    
    返回:
        ApiResponse: 故障模拟列表
    """
    try:
        current_user_id = get_jwt_identity()
        experiment_id = request.args.get('experiment_id')
        
        if not experiment_id:
            return jsonify({
                'success': False,
                'message': '缺少实验ID',
                'error': 'missing_experiment_id'
            }), 400
        
        # 验证实验所有权
        experiments_collection = db.get_collection('experiments')
        experiment = experiments_collection.find_one({
            '_id': ObjectId(experiment_id),
            'user_id': current_user_id
        })
        
        if not experiment:
            return jsonify({
                'success': False,
                'message': '实验不存在',
                'error': 'experiment_not_found'
            }), 404
        
        # 获取故障模拟器
        from routes.experiments import running_experiments
        
        if experiment_id in running_experiments:
            fault_simulator = running_experiments[experiment_id]['fault_simulator']
            faults = fault_simulator.get_all_faults()
        else:
            # 从数据库获取
            faults_collection = db.get_collection('faults')
            faults_db = list(faults_collection.find({'experiment_id': experiment_id}))
            faults = []
            for f in faults_db:
                fault = FaultSimulation(
                    experiment_id=f['experiment_id'],
                    fault_type=f['fault_type'],
                    enabled=f['enabled'],
                    parameters=f['parameters'],
                    created_at=f['created_at']
                )
                faults.append(fault)
        
        return jsonify({
            'success': True,
            'message': '获取故障模拟列表成功',
            'data': [f.model_dump() for f in faults]
        }), 200
        
    except Exception as e:
        logger.error(f"获取故障模拟列表失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取故障模拟列表失败',
            'error': str(e)
        }), 500
