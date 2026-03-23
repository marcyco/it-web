from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


class ProtocolLayer(str, Enum):
    """协议层枚举"""
    APPLICATION = "application"
    TRANSPORT = "transport"
    NETWORK = "network"
    DATALINK = "datalink"
    PHYSICAL = "physical"


class ProtocolType(str, Enum):
    """协议类型枚举"""
    HTTP = "http"
    HTTPS = "https"
    FTP = "ftp"
    SMTP = "smtp"
    DNS = "dns"
    TCP = "tcp"
    UDP = "udp"
    IP = "ip"
    ARP = "arp"
    ICMP = "icmp"
    ETHERNET = "ethernet"
    WIFI = "wifi"


class DeviceType(str, Enum):
    """设备类型枚举"""
    ROUTER = "router"
    SWITCH = "switch"
    FIREWALL = "firewall"
    HOST = "host"
    GATEWAY = "gateway"


class DeviceStatus(str, Enum):
    """设备状态枚举"""
    NORMAL = "normal"
    WARNING = "warning"
    ERROR = "error"
    OFFLINE = "offline"


class PacketStatus(str, Enum):
    """数据包状态枚举"""
    SENT = "sent"
    RECEIVED = "received"
    DROPPED = "dropped"
    DELAYED = "delayed"
    CORRUPTED = "corrupted"


class FaultType(str, Enum):
    """故障类型枚举"""
    PACKET_LOSS = "packet_loss"
    DELAY = "delay"
    REORDERING = "reordering"
    CORRUPTION = "corruption"
    CONNECTION_FAILURE = "connection_failure"


# ==================== 用户模型 ====================

class User(BaseModel):
    """用户模型"""
    id: Optional[str] = Field(None, alias="_id")
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "username": "student1",
                "email": "student@example.com",
                "password_hash": "hashed_password_here"
            }
        }


class UserCreate(BaseModel):
    """用户创建模型"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """用户登录模型"""
    username: str
    password: str


class UserResponse(BaseModel):
    """用户响应模型"""
    id: str
    username: str
    email: str
    created_at: datetime
    is_active: bool


# ==================== 实验模型 ====================

class ExperimentConfig(BaseModel):
    """实验配置模型"""
    port: int = 8080
    mtu: int = 1500
    window_size: int = 65535
    timeout: int = 30
    delay: int = 0
    packet_loss: float = 0.0
    reordering: float = 0.0


class ExperimentParameters(BaseModel):
    """实验参数模型"""
    source_ip: str = "192.168.1.1"
    destination_ip: str = "192.168.1.2"
    source_port: int = 12345
    destination_port: int = 80
    protocol: ProtocolType = ProtocolType.TCP
    config: ExperimentConfig = Field(default_factory=ExperimentConfig)


class Experiment(BaseModel):
    """实验模型"""
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    name: str
    description: Optional[str] = None
    parameters: ExperimentParameters
    status: str = "created"  # created, running, paused, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class ExperimentCreate(BaseModel):
    """实验创建模型"""
    name: str
    description: Optional[str] = None
    parameters: ExperimentParameters


class ExperimentUpdate(BaseModel):
    """实验更新模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    parameters: Optional[ExperimentParameters] = None
    status: Optional[str] = None


# ==================== 数据包模型 ====================

class PacketLayer(BaseModel):
    """数据包层模型"""
    layer: ProtocolLayer
    protocol: ProtocolType
    headers: Dict[str, Any] = Field(default_factory=dict)
    payload: Optional[str] = None


class Packet(BaseModel):
    """数据包模型"""
    id: Optional[str] = Field(None, alias="_id")
    experiment_id: str
    sequence_number: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source_ip: str
    destination_ip: str
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    protocol: ProtocolType
    size: int
    status: PacketStatus = PacketStatus.SENT
    layers: List[PacketLayer] = Field(default_factory=list)
    raw_data: Optional[str] = None
    
    class Config:
        populate_by_name = True


class PacketCreate(BaseModel):
    """数据包创建模型"""
    experiment_id: str
    sequence_number: int
    source_ip: str
    destination_ip: str
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    protocol: ProtocolType
    size: int
    layers: List[PacketLayer] = Field(default_factory=list)
    raw_data: Optional[str] = None


# ==================== 设备模型 ====================

class DeviceConfig(BaseModel):
    """设备配置模型"""
    ip_address: str
    subnet_mask: str = "255.255.255.0"
    gateway: Optional[str] = None
    mac_address: Optional[str] = None


class Device(BaseModel):
    """设备模型"""
    id: Optional[str] = Field(None, alias="_id")
    experiment_id: str
    name: str
    type: DeviceType
    status: DeviceStatus = DeviceStatus.NORMAL
    config: DeviceConfig
    position: Dict[str, float] = Field(default_factory=lambda: {"x": 0, "y": 0})
    
    class Config:
        populate_by_name = True


class DeviceCreate(BaseModel):
    """设备创建模型"""
    experiment_id: str
    name: str
    type: DeviceType
    config: DeviceConfig
    position: Optional[Dict[str, float]] = None


# ==================== 故障模拟模型 ====================

class FaultSimulation(BaseModel):
    """故障模拟模型"""
    id: Optional[str] = Field(None, alias="_id")
    experiment_id: str
    fault_type: FaultType
    enabled: bool = False
    parameters: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class FaultSimulationCreate(BaseModel):
    """故障模拟创建模型"""
    experiment_id: str
    fault_type: FaultType
    enabled: bool = False
    parameters: Optional[Dict[str, Any]] = None


# ==================== 学习记录模型 ====================

class ExperimentRecord(BaseModel):
    """实验记录模型"""
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    experiment_id: str
    experiment_name: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration: Optional[int] = None  # 秒
    status: str = "completed"
    notes: Optional[str] = None
    
    class Config:
        populate_by_name = True


class ExperimentMetrics(BaseModel):
    """实验指标模型"""
    total_packets: int = 0
    sent_packets: int = 0
    received_packets: int = 0
    dropped_packets: int = 0
    delayed_packets: int = 0
    corrupted_packets: int = 0
    average_delay: float = 0.0
    throughput: float = 0.0  # bytes/second


# ==================== 抓包模型 ====================

class CaptureData(BaseModel):
    """抓包数据模型"""
    id: Optional[str] = Field(None, alias="_id")
    experiment_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    packet: Packet
    raw_capture: Optional[str] = None
    
    class Config:
        populate_by_name = True


class FilterCondition(BaseModel):
    """过滤条件模型"""
    protocol: Optional[ProtocolType] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    keyword: Optional[str] = None


class CaptureExport(BaseModel):
    """抓包导出模型"""
    format: str = "json"  # json, csv, pcap
    filters: Optional[FilterCondition] = None


# ==================== 响应模型 ====================

class ApiResponse(BaseModel):
    """API响应模型"""
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None


class PaginatedResponse(BaseModel):
    """分页响应模型"""
    success: bool
    message: str
    data: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
