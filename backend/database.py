from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class Database:
    """数据库连接管理类"""
    
    _instance: Optional['Database'] = None
    _client: Optional[MongoClient] = None
    _db = None
    
    def __new__(cls):
        """单例模式"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def connect(self, mongo_uri: str) -> bool:
        """
        连接到MongoDB数据库
        
        Args:
            mongo_uri: MongoDB连接字符串
            
        Returns:
            bool: 连接是否成功
        """
        try:
            self._client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000
            )
            
            # 测试连接
            self._client.server_info()
            
            # 获取数据库名称
            db_name = mongo_uri.split('/')[-1] or 'network_protocol_viz'
            self._db = self._client[db_name]
            
            logger.info(f"成功连接到MongoDB数据库: {db_name}")
            return True
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"MongoDB连接失败: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"数据库连接错误: {str(e)}")
            return False
    
    def disconnect(self):
        """断开数据库连接"""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("已断开MongoDB连接")
    
    def get_db(self):
        """获取数据库实例"""
        return self._db
    
    def get_collection(self, collection_name: str):
        """
        获取集合
        
        Args:
            collection_name: 集合名称
            
        Returns:
            Collection: MongoDB集合对象
        """
        if self._db is None:
            raise RuntimeError("数据库未连接")
        return self._db[collection_name]
    
    def is_connected(self) -> bool:
        """检查数据库是否已连接"""
        if self._client is None:
            return False
        
        try:
            self._client.server_info()
            return True
        except:
            return False
    
    def create_indexes(self):
        """创建数据库索引"""
        try:
            # 用户集合索引
            users = self.get_collection('users')
            users.create_index('username', unique=True)
            users.create_index('email', unique=True)
            
            # 实验集合索引
            experiments = self.get_collection('experiments')
            experiments.create_index('user_id')
            experiments.create_index('status')
            experiments.create_index('created_at')
            
            # 数据包集合索引
            packets = self.get_collection('packets')
            packets.create_index('experiment_id')
            packets.create_index('timestamp')
            packets.create_index([('experiment_id', 1), ('sequence_number', 1)], unique=True)
            
            # 设备集合索引
            devices = self.get_collection('devices')
            devices.create_index('experiment_id')
            
            # 故障模拟集合索引
            faults = self.get_collection('faults')
            faults.create_index('experiment_id')
            faults.create_index('fault_type')
            
            # 学习记录集合索引
            records = self.get_collection('records')
            records.create_index('user_id')
            records.create_index('experiment_id')
            records.create_index('started_at')
            
            # 抓包数据集合索引
            captures = self.get_collection('captures')
            captures.create_index('experiment_id')
            captures.create_index('timestamp')
            
            logger.info("数据库索引创建成功")
            
        except Exception as e:
            logger.error(f"创建索引失败: {str(e)}")
            raise


# 全局数据库实例
db = Database()
