// 存储键
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    EXPERIMENT: 'experiment'
};

// API基础URL
export const API_BASE_URL = 'http://localhost:5000/api';

// 预设实验
export const PRESET_EXPERIMENTS = [
    {
        id: 'http-basic',
        name: 'HTTP基础通信',
        description: '学习HTTP协议的基本工作原理，包括请求和响应流程',
        protocol: 'HTTP',
        parameters: {
            port: 80,
            mtu: 1500,
            windowSize: 1,
            timeout: 30
        }
    },
    {
        id: 'tcp-connection',
        name: 'TCP连接建立',
        description: '观察TCP三次握手过程，理解连接建立的机制',
        protocol: 'TCP',
        parameters: {
            port: 443,
            mtu: 1500,
            windowSize: 65535,
            timeout: 60
        }
    },
    {
        id: 'udp-communication',
        name: 'UDP数据传输',
        description: '学习UDP协议的无连接数据传输特性',
        protocol: 'UDP',
        parameters: {
            port: 53,
            mtu: 1500,
            timeout: 10
        }
    },
    {
        id: 'ip-routing',
        name: 'IP路由转发',
        description: '理解IP数据包的路由和转发过程',
        protocol: 'IP',
        parameters: {
            mtu: 1500,
            timeout: 30
        }
    },
    {
        id: 'dns-resolution',
        name: 'DNS域名解析',
        description: '观察DNS查询和响应过程',
        protocol: 'DNS',
        parameters: {
            port: 53,
            timeout: 5
        }
    },
    {
        id: 'network-fault',
        name: '网络故障模拟',
        description: '模拟各种网络故障，学习故障处理机制',
        protocol: 'TCP',
        parameters: {
            port: 80,
            mtu: 1500,
            packetLoss: 10,
            delay: 100,
            reordering: true
        }
    }
];

// 协议类型
export const PROTOCOL_TYPES = {
    HTTP: 'HTTP',
    HTTPS: 'HTTPS',
    TCP: 'TCP',
    UDP: 'UDP',
    IP: 'IP',
    ARP: 'ARP',
    DNS: 'DNS',
    ICMP: 'ICMP'
};

// 设备类型
export const DEVICE_TYPES = {
    ROUTER: 'router',
    SWITCH: 'switch',
    FIREWALL: 'firewall',
    HOST: 'host',
    GATEWAY: 'gateway'
};

// 故障类型
export const FAULT_TYPES = {
    PACKET_LOSS: 'packet_loss',
    DELAY: 'delay',
    REORDERING: 'reordering',
    CORRUPTION: 'corruption',
    DISCONNECTION: 'disconnection'
};
