import { ProtocolType, DeviceType, FaultType } from '../types';

// 协议层配置
export const PROTOCOL_LAYERS = {
    APPLICATION: {
        name: '应用层',
        color: '#FF6B6B',
        protocols: [ProtocolType.HTTP, ProtocolType.DNS]
    },
    TRANSPORT: {
        name: '传输层',
        color: '#4ECDC4',
        protocols: [ProtocolType.TCP, ProtocolType.UDP]
    },
    NETWORK: {
        name: '网络层',
        color: '#45B7D1',
        protocols: [ProtocolType.IP, ProtocolType.ICMP]
    },
    DATALINK: {
        name: '数据链路层',
        color: '#96CEB4',
        protocols: [ProtocolType.ARP]
    },
    PHYSICAL: {
        name: '物理层',
        color: '#FFEAA7',
        protocols: []
    }
} as const;

// 设备图标配置
export const DEVICE_ICONS = {
    [DeviceType.ROUTER]: {
        name: '路由器',
        icon: 'router',
        color: '#3498db'
    },
    [DeviceType.SWITCH]: {
        name: '交换机',
        icon: 'switch',
        color: '#2ecc71'
    },
    [DeviceType.FIREWALL]: {
        name: '防火墙',
        icon: 'firewall',
        color: '#e74c3c'
    },
    [DeviceType.HOST]: {
        name: '主机',
        icon: 'computer',
        color: '#9b59b6'
    },
    [DeviceType.GATEWAY]: {
        name: '网关',
        icon: 'gateway',
        color: '#f39c12'
    }
} as const;

// 预设实验场景
export const PRESET_EXPERIMENTS = [
    {
        id: 'tcp-handshake',
        name: 'TCP三次握手',
        description: '演示TCP连接建立的三次握手过程',
        protocol: ProtocolType.TCP,
        parameters: {
            port: 80,
            mtu: 1500,
            windowSize: 65535,
            timeout: 3000
        }
    },
    {
        id: 'http-request',
        name: 'HTTP请求响应',
        description: '演示HTTP请求和响应的完整流程',
        protocol: ProtocolType.HTTP,
        parameters: {
            port: 80,
            mtu: 1500,
            timeout: 5000
        }
    },
    {
        id: 'dns-resolution',
        name: 'DNS解析',
        description: '演示DNS域名解析过程',
        protocol: ProtocolType.DNS,
        parameters: {
            port: 53,
            timeout: 2000
        }
    },
    {
        id: 'arp-resolution',
        name: 'ARP地址解析',
        description: '演示ARP地址解析过程',
        protocol: ProtocolType.ARP,
        parameters: {
            timeout: 1000
        }
    },
    {
        id: 'udp-transmission',
        name: 'UDP数据传输',
        description: '演示UDP无连接数据传输',
        protocol: ProtocolType.UDP,
        parameters: {
            port: 53,
            mtu: 1500
        }
    }
] as const;

// 故障模拟类型
export const FAULT_TYPES = {
    [FaultType.PACKET_LOSS]: {
        name: '数据包丢失',
        description: '随机丢弃数据包',
        color: '#e74c3c'
    },
    [FaultType.DELAY]: {
        name: '网络延迟',
        description: '增加数据包传输延迟',
        color: '#f39c12'
    },
    [FaultType.REORDERING]: {
        name: '数据包乱序',
        description: '打乱数据包顺序',
        color: '#9b59b6'
    },
    [FaultType.CORRUPTION]: {
        name: '数据包损坏',
        description: '损坏数据包内容',
        color: '#e67e22'
    },
    [FaultType.DISCONNECTION]: {
        name: '连接中断',
        description: '模拟网络连接中断',
        color: '#c0392b'
    }
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
    MTU: 1500,
    WINDOW_SIZE: 65535,
    TIMEOUT: 3000,
    BUFFER_SIZE: 65536,
    MAX_PACKETS: 1000
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
    PACKET_SPEED: 1000, // 数据包传输时间(ms)
    ANIMATION_DURATION: 500, // 动画持续时间(ms)
    FRAME_RATE: 60 // 帧率
} as const;

// API配置
export const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 10000,
    RETRY_COUNT: 3
} as const;

// 存储键
export const STORAGE_KEYS = {
    USER: 'network_protocol_user',
    TOKEN: 'network_protocol_token',
    EXPERIMENT_CONFIG: 'network_protocol_experiment_config',
    THEME: 'network_protocol_theme'
} as const;
