from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config, Config
from database import db
from auth import init_jwt
import logging
import os
from datetime import datetime


def create_app(config_name='default'):
    """
    创建Flask应用工厂函数
    
    Args:
        config_name: 配置名称（development, production, testing, default）
        
    Returns:
        Flask: Flask应用实例
    """
    app = Flask(__name__)
    
    # 加载配置
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # 配置CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # 初始化JWT
    init_jwt(app)
    
    # 配置日志
    setup_logging(app, config_name)
    
    # 连接数据库
    if not connect_database(app):
        app.logger.error("数据库连接失败")
    
    # 注册蓝图
    register_blueprints(app)
    
    # 注册错误处理器
    register_error_handlers(app)
    
    # 注册路由
    register_routes(app)
    
    return app


def setup_logging(app, config_name='development'):
    """配置日志"""
    log_level = getattr(logging, app.config['LOG_LEVEL'].upper())
    
    # 创建日志格式
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )
    
    # 文件处理器
    file_handler = logging.FileHandler(app.config['LOG_FILE'])
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)
    
    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    
    # 配置应用日志
    app.logger.setLevel(log_level)
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    
    app.logger.info(f"应用启动 - 配置: {config_name}")


def connect_database(app):
    """连接数据库"""
    try:
        if db.connect(app.config['MONGO_URI']):
            # 创建索引
            db.create_indexes()
            return True
        return False
    except Exception as e:
        logging.error(f"数据库连接错误: {str(e)}")
        return False


def register_blueprints(app):
    """注册蓝图"""
    from routes.auth import auth_bp
    from routes.experiments import experiments_bp
    from routes.packets import packets_bp
    from routes.protocol import protocol_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(experiments_bp)
    app.register_blueprint(packets_bp)
    app.register_blueprint(protocol_bp)
    
    app.logger.info("蓝图注册完成")


def register_error_handlers(app):
    """注册错误处理器"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'message': '请求错误',
            'error': str(error)
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'message': '未授权',
            'error': str(error)
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'message': '禁止访问',
            'error': str(error)
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': '资源不存在',
            'error': str(error)
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'message': '方法不允许',
            'error': str(error)
        }), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"内部错误: {str(error)}")
        return jsonify({
            'success': False,
            'message': '服务器内部错误',
            'error': str(error)
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        app.logger.error(f"未处理的异常: {str(error)}", exc_info=True)
        return jsonify({
            'success': False,
            'message': '服务器错误',
            'error': str(error)
        }), 500


def register_routes(app):
    """注册路由"""
    
    @app.route('/')
    def index():
        """根路由"""
        return jsonify({
            'success': True,
            'message': '网络协议栈可视化教学平台 API',
            'version': '1.0.0',
            'timestamp': datetime.utcnow().isoformat()
        })
    
    @app.route('/health')
    def health():
        """健康检查"""
        health_status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'connected' if db.is_connected() else 'disconnected'
        }
        return jsonify(health_status)
    
    @app.route('/api')
    def api_info():
        """API信息"""
        return jsonify({
            'success': True,
            'message': '网络协议栈可视化教学平台 API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'experiments': '/api/experiments',
                'packets': '/api/packets',
                'protocol': '/api/protocol'
            }
        })


# 创建应用实例
app = create_app(os.getenv('FLASK_ENV', 'development'))


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=app.config['DEBUG']
    )
