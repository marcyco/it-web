from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.schemas import (
    Experiment, ExperimentCreate, ExperimentUpdate, ExperimentParameters,
    ExperimentMetrics, ApiResponse, PaginatedResponse
)
from database import db
from simulation.protocol_stack import ProtocolStackSimulator
from simulation.fault_simulator import FaultSimulator
from datetime import datetime
import logging
from bson import ObjectId

logger = logging.getLogger(__name__)

experiments_bp = Blueprint('experiments', __name__, url_prefix='/api/experiments')

# 存储运行中的实验模拟器
running_experiments = {}


@experiments_bp.route('', methods=['POST'])
@jwt_required()
def create_experiment():
    """
    创建实验
    
    请求体:
        name: 实验名称
        description: 实验描述（可选）
        parameters: 实验参数
    
    返回:
        ApiResponse: 创建的实验信息
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证输入数据
        experiment_create = ExperimentCreate(**data)
        
        # 创建实验数据
        experiment_data = {
            'user_id': current_user_id,
            'name': experiment_create.name,
            'description': experiment_create.description,
            'parameters': experiment_create.parameters.model_dump(),
            'status': 'created',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # 插入数据库
        experiments_collection = db.get_collection('experiments')
        result = experiments_collection.insert_one(experiment_data)
        
        logger.info(f"创建实验: {experiment_create.name}")
        
        return jsonify({
            'success': True,
            'message': '实验创建成功',
            'data': {
                'id': str(result.inserted_id),
                **experiment_data
            }
        }), 201
        
    except Exception as e:
        logger.error(f"创建实验失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '创建实验失败',
            'error': str(e)
        }), 500


@experiments_bp.route('', methods=['GET'])
@jwt_required()
def get_experiments():
    """
    获取实验列表
    
    查询参数:
        page: 页码（默认1）
        page_size: 每页数量（默认10）
        status: 状态过滤（可选）
    
    返回:
        PaginatedResponse: 实验列表
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 获取查询参数
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
        status = request.args.get('status')
        
        # 构建查询条件
        query = {'user_id': current_user_id}
        if status:
            query['status'] = status
        
        # 查询实验
        experiments_collection = db.get_collection('experiments')
        total = experiments_collection.count_documents(query)
        
        skip = (page - 1) * page_size
        experiments = list(experiments_collection
                          .find(query)
                          .sort('created_at', -1)
                          .skip(skip)
                          .limit(page_size))
        
        # 转换ObjectId为字符串
        for exp in experiments:
            exp['id'] = str(exp['_id'])
            exp.pop('_id', None)
        
        total_pages = (total + page_size - 1) // page_size
        
        return jsonify({
            'success': True,
            'message': '获取实验列表成功',
            'data': experiments,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages
        }), 200
        
    except Exception as e:
        logger.error(f"获取实验列表失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取实验列表失败',
            'error': str(e)
        }), 500


@experiments_bp.route('/<experiment_id>', methods=['GET'])
@jwt_required()
def get_experiment(experiment_id):
    """
    获取实验详情
    
    路径参数:
        experiment_id: 实验ID
    
    返回:
        ApiResponse: 实验详情
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 查询实验
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
        
        # 转换ObjectId为字符串
        experiment['id'] = str(experiment['_id'])
        experiment.pop('_id', None)
        
        return jsonify({
            'success': True,
            'message': '获取实验详情成功',
            'data': experiment
        }), 200
        
    except Exception as e:
        logger.error(f"获取实验详情失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取实验详情失败',
            'error': str(e)
        }), 500


@experiments_bp.route('/<experiment_id>', methods=['PUT'])
@jwt_required()
def update_experiment(experiment_id):
    """
    更新实验
    
    路径参数:
        experiment_id: 实验ID
    
    请求体:
        name: 实验名称（可选）
        description: 实验描述（可选）
        parameters: 实验参数（可选）
        status: 状态（可选）
    
    返回:
        ApiResponse: 更新后的实验信息
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证输入数据
        experiment_update = ExperimentUpdate(**data)
        
        # 构建更新数据
        update_data = {'updated_at': datetime.utcnow()}
        if experiment_update.name:
            update_data['name'] = experiment_update.name
        if experiment_update.description is not None:
            update_data['description'] = experiment_update.description
        if experiment_update.parameters:
            update_data['parameters'] = experiment_update.parameters.model_dump()
        if experiment_update.status:
            update_data['status'] = experiment_update.status
        
        # 更新实验
        experiments_collection = db.get_collection('experiments')
        result = experiments_collection.update_one(
            {'_id': ObjectId(experiment_id), 'user_id': current_user_id},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({
                'success': False,
                'message': '实验不存在',
                'error': 'experiment_not_found'
            }), 404
        
        logger.info(f"更新实验: {experiment_id}")
        
        return jsonify({
            'success': True,
            'message': '实验更新成功'
        }), 200
        
    except Exception as e:
        logger.error(f"更新实验失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '更新实验失败',
            'error': str(e)
        }), 500


@experiments_bp.route('/<experiment_id>', methods=['DELETE'])
@jwt_required()
def delete_experiment(experiment_id):
    """
    删除实验
    
    路径参数:
        experiment_id: 实验ID
    
    返回:
        ApiResponse: 删除结果
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 删除实验
        experiments_collection = db.get_collection('experiments')
        result = experiments_collection.delete_one({
            '_id': ObjectId(experiment_id),
            'user_id': current_user_id
        })
        
        if result.deleted_count == 0:
            return jsonify({
                'success': False,
                'message': '实验不存在',
                'error': 'experiment_not_found'
            }), 404
        
        # 删除相关数据
        db.get_collection('packets').delete_many({'experiment_id': experiment_id})
        db.get_collection('devices').delete_many({'experiment_id': experiment_id})
        db.get_collection('faults').delete_many({'experiment_id': experiment_id})
        
        # 清理运行中的实验
        if experiment_id in running_experiments:
            del running_experiments[experiment_id]
        
        logger.info(f"删除实验: {experiment_id}")
        
        return jsonify({
            'success': True,
            'message': '实验删除成功'
        }), 200
        
    except Exception as e:
        logger.error(f"删除实验失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '删除实验失败',
            'error': str(e)
        }), 500


@experiments_bp.route('/<experiment_id>/start', methods=['POST'])
@jwt_required()
def start_experiment(experiment_id):
    """
    启动实验
    
    路径参数:
        experiment_id: 实验ID
    
    返回:
        ApiResponse: 启动结果
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 查询实验
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
        
        # 创建协议栈模拟器
        parameters = ExperimentParameters(**experiment['parameters'])
        simulator = ProtocolStackSimulator(experiment_id, parameters)
        
        # 创建故障模拟器
        fault_simulator = FaultSimulator(experiment_id)
        
        # 启动模拟器
        simulator.start()
        
        # 存储运行中的实验
        running_experiments[experiment_id] = {
            'simulator': simulator,
            'fault_simulator': fault_simulator
        }
        
        # 更新实验状态
        experiments_collection.update_one(
            {'_id': ObjectId(experiment_id)},
            {
                '$set': {
                    'status': 'running',
                    'started_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        logger.info(f"启动实验: {experiment_id}")
        
        return jsonify({
            'success': True,
            'message': '实验启动成功'
        }), 200
        
    except Exception as e:
        logger.error(f"启动实验失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '启动实验失败',
            'error': str(e)
        }), 500


@experiments_bp.route('/<experiment_id>/stop', methods=['POST'])
@jwt_required()
def stop_experiment(experiment_id):
    """
    停止实验
    
    路径参数:
        experiment_id: 实验ID
    
    返回:
        ApiResponse: 停止结果
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 停止模拟器
        if experiment_id in running_experiments:
            running_experiments[experiment_id]['simulator'].stop()
            del running_experiments[experiment_id]
        
        # 更新实验状态
        experiments_collection = db.get_collection('experiments')
        experiments_collection.update_one(
            {'_id': ObjectId(experiment_id), 'user_id': current_user_id},
            {
                '$set': {
                    'status': 'completed',
                    'completed_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        logger.info(f"停止实验: {experiment_id}")
        
        return jsonify({
            'success': True,
            'message': '实验停止成功'
        }), 200
        
    except Exception as e:
        logger.error(f"停止实验失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '停止实验失败',
            'error': str(e)
        }), 500


@experiments_bp.route('/<experiment_id>/reset', methods=['POST'])
@jwt_required()
def reset_experiment(experiment_id):
    """
    重置实验
    
    路径参数:
        experiment_id: 实验ID
    
    返回:
        ApiResponse: 重置结果
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 重置模拟器
        if experiment_id in running_experiments:
            running_experiments[experiment_id]['simulator'].reset()
            running_experiments[experiment_id]['fault_simulator'].reset()
        
        # 删除相关数据
        db.get_collection('packets').delete_many({'experiment_id': experiment_id})
        
        # 更新实验状态
        experiments_collection = db.get_collection('experiments')
        experiments_collection.update_one(
            {'_id': ObjectId(experiment_id), 'user_id': current_user_id},
            {
                '$set': {
                    'status': 'created',
                    'started_at': None,
                    'completed_at': None,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        logger.info(f"重置实验: {experiment_id}")
        
        return jsonify({
            'success': True,
            'message': '实验重置成功'
        }), 200
        
    except Exception as e:
        logger.error(f"重置实验失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '重置实验失败',
            'error': str(e)
        }), 500


@experiments_bp.route('/<experiment_id>/metrics', methods=['GET'])
@jwt_required()
def get_experiment_metrics(experiment_id):
    """
    获取实验指标
    
    路径参数:
        experiment_id: 实验ID
    
    返回:
        ApiResponse: 实验指标
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 查询实验
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
        
        # 获取模拟器统计信息
        if experiment_id in running_experiments:
            simulator = running_experiments[experiment_id]['simulator']
            metrics = simulator.get_statistics()
        else:
            # 从数据库获取统计信息
            packets_collection = db.get_collection('packets')
            total_packets = packets_collection.count_documents({'experiment_id': experiment_id})
            sent_packets = packets_collection.count_documents({
                'experiment_id': experiment_id,
                'status': 'sent'
            })
            received_packets = packets_collection.count_documents({
                'experiment_id': experiment_id,
                'status': 'received'
            })
            dropped_packets = packets_collection.count_documents({
                'experiment_id': experiment_id,
                'status': 'dropped'
            })
            delayed_packets = packets_collection.count_documents({
                'experiment_id': experiment_id,
                'status': 'delayed'
            })
            corrupted_packets = packets_collection.count_documents({
                'experiment_id': experiment_id,
                'status': 'corrupted'
            })
            
            metrics = {
                'total_packets': total_packets,
                'sent_packets': sent_packets,
                'received_packets': received_packets,
                'dropped_packets': dropped_packets,
                'delayed_packets': delayed_packets,
                'corrupted_packets': corrupted_packets,
                'average_delay': 0.0,
                'throughput': 0.0
            }
        
        return jsonify({
            'success': True,
            'message': '获取实验指标成功',
            'data': metrics
        }), 200
        
    except Exception as e:
        logger.error(f"获取实验指标失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取实验指标失败',
            'error': str(e)
        }), 500
