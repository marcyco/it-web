from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.schemas import (
    Packet, PacketCreate, PacketStatus, FilterCondition, CaptureExport,
    ApiResponse, PaginatedResponse
)
from database import db
from bson import ObjectId
from datetime import datetime
import json
import csv
import io
import logging

logger = logging.getLogger(__name__)

packets_bp = Blueprint('packets', __name__, url_prefix='/api/packets')


@packets_bp.route('', methods=['POST'])
@jwt_required()
def create_packet():
    """
    创建数据包
    
    请求体:
        experiment_id: 实验ID
        sequence_number: 序列号
        source_ip: 源IP地址
        destination_ip: 目标IP地址
        source_port: 源端口（可选）
        destination_port: 目标端口（可选）
        protocol: 协议类型
        size: 数据包大小
        layers: 协议栈各层信息（可选）
        raw_data: 原始数据（可选）
    
    返回:
        ApiResponse: 创建的数据包信息
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证输入数据
        packet_create = PacketCreate(**data)
        
        # 验证实验所有权
        experiments_collection = db.get_collection('experiments')
        experiment = experiments_collection.find_one({
            '_id': ObjectId(packet_create.experiment_id),
            'user_id': current_user_id
        })
        
        if not experiment:
            return jsonify({
                'success': False,
                'message': '实验不存在',
                'error': 'experiment_not_found'
            }), 404
        
        # 创建数据包数据
        packet_data = {
            'experiment_id': packet_create.experiment_id,
            'sequence_number': packet_create.sequence_number,
            'timestamp': datetime.utcnow(),
            'source_ip': packet_create.source_ip,
            'destination_ip': packet_create.destination_ip,
            'source_port': packet_create.source_port,
            'destination_port': packet_create.destination_port,
            'protocol': packet_create.protocol.value,
            'size': packet_create.size,
            'status': PacketStatus.SENT.value,
            'layers': [layer.model_dump() for layer in packet_create.layers],
            'raw_data': packet_create.raw_data
        }
        
        # 插入数据库
        packets_collection = db.get_collection('packets')
        result = packets_collection.insert_one(packet_data)
        
        logger.info(f"创建数据包: {packet_create.sequence_number}")
        
        return jsonify({
            'success': True,
            'message': '数据包创建成功',
            'data': {
                'id': str(result.inserted_id),
                **packet_data
            }
        }), 201
        
    except Exception as e:
        logger.error(f"创建数据包失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '创建数据包失败',
            'error': str(e)
        }), 500


@packets_bp.route('', methods=['GET'])
@jwt_required()
def get_packets():
    """
    获取数据包列表
    
    查询参数:
        experiment_id: 实验ID（必需）
        page: 页码（默认1）
        page_size: 每页数量（默认10）
        protocol: 协议过滤（可选）
        status: 状态过滤（可选）
        source_ip: 源IP过滤（可选）
        destination_ip: 目标IP过滤（可选）
    
    返回:
        PaginatedResponse: 数据包列表
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 获取查询参数
        experiment_id = request.args.get('experiment_id')
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 10))
        protocol = request.args.get('protocol')
        status = request.args.get('status')
        source_ip = request.args.get('source_ip')
        destination_ip = request.args.get('destination_ip')
        
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
        
        # 构建查询条件
        query = {'experiment_id': experiment_id}
        if protocol:
            query['protocol'] = protocol
        if status:
            query['status'] = status
        if source_ip:
            query['source_ip'] = source_ip
        if destination_ip:
            query['destination_ip'] = destination_ip
        
        # 查询数据包
        packets_collection = db.get_collection('packets')
        total = packets_collection.count_documents(query)
        
        skip = (page - 1) * page_size
        packets = list(packets_collection
                       .find(query)
                       .sort('timestamp', -1)
                       .skip(skip)
                       .limit(page_size))
        
        # 转换ObjectId为字符串
        for packet in packets:
            packet['id'] = str(packet['_id'])
            packet.pop('_id', None)
        
        total_pages = (total + page_size - 1) // page_size
        
        return jsonify({
            'success': True,
            'message': '获取数据包列表成功',
            'data': packets,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages
        }), 200
        
    except Exception as e:
        logger.error(f"获取数据包列表失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取数据包列表失败',
            'error': str(e)
        }), 500


@packets_bp.route('/<packet_id>', methods=['GET'])
@jwt_required()
def get_packet(packet_id):
    """
    获取数据包详情
    
    路径参数:
        packet_id: 数据包ID
    
    返回:
        ApiResponse: 数据包详情
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 查询数据包
        packets_collection = db.get_collection('packets')
        packet = packets_collection.find_one({'_id': ObjectId(packet_id)})
        
        if not packet:
            return jsonify({
                'success': False,
                'message': '数据包不存在',
                'error': 'packet_not_found'
            }), 404
        
        # 验证实验所有权
        experiments_collection = db.get_collection('experiments')
        experiment = experiments_collection.find_one({
            '_id': ObjectId(packet['experiment_id']),
            'user_id': current_user_id
        })
        
        if not experiment:
            return jsonify({
                'success': False,
                'message': '无权访问此数据包',
                'error': 'access_denied'
            }), 403
        
        # 转换ObjectId为字符串
        packet['id'] = str(packet['_id'])
        packet.pop('_id', None)
        
        return jsonify({
            'success': True,
            'message': '获取数据包详情成功',
            'data': packet
        }), 200
        
    except Exception as e:
        logger.error(f"获取数据包详情失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取数据包详情失败',
            'error': str(e)
        }), 500


@packets_bp.route('/<packet_id>', methods=['PUT'])
@jwt_required()
def update_packet(packet_id):
    """
    更新数据包
    
    路径参数:
        packet_id: 数据包ID
    
    请求体:
        status: 数据包状态（可选）
        layers: 协议栈各层信息（可选）
        raw_data: 原始数据（可选）
    
    返回:
        ApiResponse: 更新结果
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # 查询数据包
        packets_collection = db.get_collection('packets')
        packet = packets_collection.find_one({'_id': ObjectId(packet_id)})
        
        if not packet:
            return jsonify({
                'success': False,
                'message': '数据包不存在',
                'error': 'packet_not_found'
            }), 404
        
        # 验证实验所有权
        experiments_collection = db.get_collection('experiments')
        experiment = experiments_collection.find_one({
            '_id': ObjectId(packet['experiment_id']),
            'user_id': current_user_id
        })
        
        if not experiment:
            return jsonify({
                'success': False,
                'message': '无权访问此数据包',
                'error': 'access_denied'
            }), 403
        
        # 构建更新数据
        update_data = {}
        if 'status' in data:
            update_data['status'] = data['status']
        if 'layers' in data:
            update_data['layers'] = data['layers']
        if 'raw_data' in data:
            update_data['raw_data'] = data['raw_data']
        
        # 更新数据包
        result = packets_collection.update_one(
            {'_id': ObjectId(packet_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({
                'success': False,
                'message': '数据包不存在',
                'error': 'packet_not_found'
            }), 404
        
        logger.info(f"更新数据包: {packet_id}")
        
        return jsonify({
            'success': True,
            'message': '数据包更新成功'
        }), 200
        
    except Exception as e:
        logger.error(f"更新数据包失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '更新数据包失败',
            'error': str(e)
        }), 500


@packets_bp.route('/export', methods=['POST'])
@jwt_required()
def export_packets():
    """
    导出数据包
    
    请求体:
        experiment_id: 实验ID
        format: 导出格式（json, csv, pcap）
        filters: 过滤条件（可选）
    
    返回:
        File: 导出的文件
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # 验证输入数据
        export_data = CaptureExport(**data)
        
        # 验证实验所有权
        experiments_collection = db.get_collection('experiments')
        experiment = experiments_collection.find_one({
            '_id': ObjectId(export_data.experiment_id),
            'user_id': current_user_id
        })
        
        if not experiment:
            return jsonify({
                'success': False,
                'message': '实验不存在',
                'error': 'experiment_not_found'
            }), 404
        
        # 构建查询条件
        query = {'experiment_id': export_data.experiment_id}
        if export_data.filters:
            filters = export_data.filters
            if filters.protocol:
                query['protocol'] = filters.protocol.value
            if filters.source_ip:
                query['source_ip'] = filters.source_ip
            if filters.destination_ip:
                query['destination_ip'] = filters.destination_ip
            if filters.source_port:
                query['source_port'] = filters.source_port
            if filters.destination_port:
                query['destination_port'] = filters.destination_port
            if filters.keyword:
                query['$or'] = [
                    {'raw_data': {'$regex': filters.keyword, '$options': 'i'}},
                    {'layers': {'$regex': filters.keyword, '$options': 'i'}}
                ]
        
        # 查询数据包
        packets_collection = db.get_collection('packets')
        packets = list(packets_collection.find(query).sort('timestamp', 1))
        
        # 根据格式导出
        if export_data.format == 'json':
            return _export_json(packets)
        elif export_data.format == 'csv':
            return _export_csv(packets)
        elif export_data.format == 'pcap':
            return _export_pcap(packets)
        else:
            return jsonify({
                'success': False,
                'message': '不支持的导出格式',
                'error': 'unsupported_format'
            }), 400
        
    except Exception as e:
        logger.error(f"导出数据包失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '导出数据包失败',
            'error': str(e)
        }), 500


def _export_json(packets):
    """导出为JSON格式"""
    output = io.StringIO()
    
    # 转换ObjectId为字符串
    export_data = []
    for packet in packets:
        packet_copy = packet.copy()
        packet_copy['id'] = str(packet_copy['_id'])
        packet_copy.pop('_id', None)
        export_data.append(packet_copy)
    
    json.dump(export_data, output, indent=2, default=str)
    output.seek(0)
    
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='application/json',
        as_attachment=True,
        download_name=f'packets_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.json'
    )


def _export_csv(packets):
    """导出为CSV格式"""
    output = io.StringIO()
    
    if not packets:
        return send_file(
            io.BytesIO(b''),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'packets_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.csv'
        )
    
    # 获取所有字段
    fieldnames = ['id', 'sequence_number', 'timestamp', 'source_ip', 'destination_ip',
                  'source_port', 'destination_port', 'protocol', 'size', 'status']
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for packet in packets:
        row = {
            'id': str(packet['_id']),
            'sequence_number': packet.get('sequence_number', ''),
            'timestamp': packet.get('timestamp', ''),
            'source_ip': packet.get('source_ip', ''),
            'destination_ip': packet.get('destination_ip', ''),
            'source_port': packet.get('source_port', ''),
            'destination_port': packet.get('destination_port', ''),
            'protocol': packet.get('protocol', ''),
            'size': packet.get('size', ''),
            'status': packet.get('status', '')
        }
        writer.writerow(row)
    
    output.seek(0)
    
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'packets_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.csv'
    )


def _export_pcap(packets):
    """导出为PCAP格式（简化版本）"""
    # 注意：这是一个简化的PCAP导出实现
    # 实际应用中应该使用scapy或其他库生成真正的PCAP文件
    
    output = io.BytesIO()
    
    # PCAP文件头（简化）
    pcap_header = b'\xd4\xc3\xb2\xa1\x02\x00\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00'
    output.write(pcap_header)
    
    # 为每个数据包写入简化的PCAP记录
    for packet in packets:
        # 简化的数据包记录
        packet_data = f"Packet {packet.get('sequence_number', 0)}: {packet.get('protocol', '')}\n"
        output.write(packet_data.encode('utf-8'))
    
    output.seek(0)
    
    return send_file(
        output,
        mimetype='application/vnd.tcpdump.pcap',
        as_attachment=True,
        download_name=f'packets_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.pcap'
    )
