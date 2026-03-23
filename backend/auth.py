from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    verify_jwt_in_request
)
from datetime import datetime
import bcrypt
import logging

logger = logging.getLogger(__name__)


# JWT管理器实例
jwt = JWTManager()


def init_jwt(app):
    """初始化JWT管理器"""
    jwt.init_app(app)
    
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        """用户身份加载器"""
        return str(user['_id'])
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        """用户查找回调"""
        from database import db
        identity = jwt_data["sub"]
        user = db.get_collection('users').find_one({'_id': identity})
        return user
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """过期令牌回调"""
        return jsonify({
            'success': False,
            'message': '令牌已过期',
            'error': 'token_expired'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        """无效令牌回调"""
        return jsonify({
            'success': False,
            'message': '无效的令牌',
            'error': 'invalid_token'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        """缺少令牌回调"""
        return jsonify({
            'success': False,
            'message': '缺少认证令牌',
            'error': 'authorization_required'
        }), 401


def hash_password(password: str) -> str:
    """
    密码哈希
    
    Args:
        password: 明文密码
        
    Returns:
        str: 哈希后的密码
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed_password: str) -> bool:
    """
    验证密码
    
    Args:
        password: 明文密码
        hashed_password: 哈希密码
        
    Returns:
        bool: 密码是否匹配
    """
    try:
        return bcrypt.checkpw(
            password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        logger.error(f"密码验证错误: {str(e)}")
        return False


def create_tokens(user_id: str) -> dict:
    """
    创建访问令牌和刷新令牌
    
    Args:
        user_id: 用户ID
        
    Returns:
        dict: 包含访问令牌和刷新令牌的字典
    """
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)
    
    return {
        'access_token': access_token,
        'refresh_token': refresh_token
    }


def token_required(f):
    """
    令牌认证装饰器
    
    用于保护需要认证的路由
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"令牌验证失败: {str(e)}")
            return jsonify({
                'success': False,
                'message': '认证失败',
                'error': 'authentication_failed'
            }), 401
    
    return decorated_function


def admin_required(f):
    """
    管理员权限装饰器
    
    用于保护需要管理员权限的路由
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            
            # 查询用户信息
            from database import db
            user = db.get_collection('users').find_one({'_id': current_user_id})
            
            if not user or not user.get('is_admin', False):
                return jsonify({
                    'success': False,
                    'message': '需要管理员权限',
                    'error': 'admin_required'
                }), 403
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"权限验证失败: {str(e)}")
            return jsonify({
                'success': False,
                'message': '权限验证失败',
                'error': 'permission_denied'
            }), 403
    
    return decorated_function


def get_current_user():
    """
    获取当前登录用户
    
    Returns:
        dict: 用户信息，如果未登录返回None
    """
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        
        from database import db
        user = db.get_collection('users').find_one({'_id': current_user_id})
        
        if user:
            # 移除敏感信息
            user.pop('password_hash', None)
            return user
        
        return None
    except:
        return None
