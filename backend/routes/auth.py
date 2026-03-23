from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.schemas import UserCreate, UserLogin, UserResponse, ApiResponse
from auth import hash_password, verify_password, create_tokens
from database import db
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    用户注册
    
    请求体:
        username: 用户名
        email: 邮箱
        password: 密码
    
    返回:
        ApiResponse: 注册结果
    """
    try:
        data = request.get_json()
        
        # 验证输入数据
        user_create = UserCreate(**data)
        
        # 检查用户名是否已存在
        users_collection = db.get_collection('users')
        if users_collection.find_one({'username': user_create.username}):
            return jsonify({
                'success': False,
                'message': '用户名已存在',
                'error': 'username_exists'
            }), 400
        
        # 检查邮箱是否已存在
        if users_collection.find_one({'email': user_create.email}):
            return jsonify({
                'success': False,
                'message': '邮箱已被注册',
                'error': 'email_exists'
            }), 400
        
        # 创建用户
        user_data = {
            'username': user_create.username,
            'email': user_create.email,
            'password_hash': hash_password(user_create.password),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True,
            'is_admin': False
        }
        
        result = users_collection.insert_one(user_data)
        
        logger.info(f"新用户注册: {user_create.username}")
        
        return jsonify({
            'success': True,
            'message': '注册成功',
            'data': {
                'user_id': str(result.inserted_id)
            }
        }), 201
        
    except Exception as e:
        logger.error(f"注册失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '注册失败',
            'error': str(e)
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    用户登录
    
    请求体:
        username: 用户名
        password: 密码
    
    返回:
        ApiResponse: 登录结果，包含访问令牌和刷新令牌
    """
    try:
        data = request.get_json()
        
        # 验证输入数据
        user_login = UserLogin(**data)
        
        # 查找用户
        users_collection = db.get_collection('users')
        user = users_collection.find_one({'username': user_login.username})
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户名或密码错误',
                'error': 'invalid_credentials'
            }), 401
        
        # 验证密码
        if not verify_password(user_login.password, user['password_hash']):
            return jsonify({
                'success': False,
                'message': '用户名或密码错误',
                'error': 'invalid_credentials'
            }), 401
        
        # 检查用户是否激活
        if not user.get('is_active', True):
            return jsonify({
                'success': False,
                'message': '账户已被禁用',
                'error': 'account_disabled'
            }), 403
        
        # 创建令牌
        tokens = create_tokens(str(user['_id']))
        
        # 更新最后登录时间
        users_collection.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        logger.info(f"用户登录: {user_login.username}")
        
        return jsonify({
            'success': True,
            'message': '登录成功',
            'data': {
                'access_token': tokens['access_token'],
                'refresh_token': tokens['refresh_token'],
                'user': {
                    'id': str(user['_id']),
                    'username': user['username'],
                    'email': user['email']
                }
            }
        }), 200
        
    except Exception as e:
        logger.error(f"登录失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '登录失败',
            'error': str(e)
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    刷新访问令牌
    
    请求头:
        Authorization: Bearer <refresh_token>
    
    返回:
        ApiResponse: 新的访问令牌
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 创建新的访问令牌
        tokens = create_tokens(current_user_id)
        
        return jsonify({
            'success': True,
            'message': '令牌刷新成功',
            'data': {
                'access_token': tokens['access_token']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"令牌刷新失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '令牌刷新失败',
            'error': str(e)
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    获取当前用户信息
    
    请求头:
        Authorization: Bearer <access_token>
    
    返回:
        ApiResponse: 用户信息
    """
    try:
        current_user_id = get_jwt_identity()
        
        # 查询用户信息
        users_collection = db.get_collection('users')
        user = users_collection.find_one({'_id': current_user_id})
        
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在',
                'error': 'user_not_found'
            }), 404
        
        # 移除敏感信息
        user.pop('password_hash', None)
        user['id'] = str(user['_id'])
        user.pop('_id', None)
        
        return jsonify({
            'success': True,
            'message': '获取用户信息成功',
            'data': user
        }), 200
        
    except Exception as e:
        logger.error(f"获取用户信息失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取用户信息失败',
            'error': str(e)
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    用户登出
    
    请求头:
        Authorization: Bearer <access_token>
    
    返回:
        ApiResponse: 登出结果
    """
    try:
        current_user_id = get_jwt_identity()
        
        logger.info(f"用户登出: {current_user_id}")
        
        # 在实际应用中，这里应该将令牌加入黑名单
        # 由于使用JWT无状态认证，这里只返回成功
        
        return jsonify({
            'success': True,
            'message': '登出成功'
        }), 200
        
    except Exception as e:
        logger.error(f"登出失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': '登出失败',
            'error': str(e)
        }), 500
