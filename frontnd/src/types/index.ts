// 协议层类型
export enum ProtocolLayer {
    APPLICATION = 'application',
    TRANSPORT = 'transport',
    NETWORK = 'network',
    DATALINK = 'datalink',
    PHYSICAL = 'physical'
}

// 协议类型
export enum ProtocolType {
    HTTP = 'http',
    TCP = 'tcp',
    UDP = 'udp',
    IP = 'ip',
    ARP = 'arp',
    DNS = 'dns',
    ICMP = 'icmp'
}

// 设备类型
export enum DeviceType {
    ROUTER = 'router',
    SWITCH = 'switch',
    FIREWALL = 'firewall',
    HOST = 'host',
    GATEWAY = 'gateway'
}

// 设备状态
export enum DeviceStatus {
    NORMAL = 'normal',
    WARNING = 'warning',
    ERROR = 'error',
    OFFLINE = 'offline'
}

// 数据包接口
export interface Packet {
    id: string;
    timestamp: number;
    source: string;
    destination: string;
    protocol: ProtocolType;
    size: number;
    data: string;
    layers: PacketLayer[];
    status: PacketStatus;
}

// 数据包层信息
export interface PacketLayer {
    layer: ProtocolLayer;
    protocol: ProtocolType;
    headers: Record<string, any>;
    payload?: string;
}

// 数据包状态
export enum PacketStatus {
    SENT = 'sent',
    RECEIVED = 'received',
    DROPPED = 'dropped',
    DELAYED = 'delayed',
    CORRUPTED = 'corrupted'
}

// 设备接口
export interface Device {
    id: string;
    name: string;
    type: DeviceType;
    status: DeviceStatus;
    position: { x: number; y: number };
    connections: string[];
    config: DeviceConfig;
}

// 设备配置
export interface DeviceConfig {
    ip?: string;
    mac?: string;
    port?: number;
    mtu?: number;
    bufferSize?: number;
}

// 实验配置
export interface ExperimentConfig {
    id: string;
    name: string;
    description: string;
    protocol: ProtocolType;
    source: string;
    destination: string;
    parameters: ExperimentParameters;
    faultSimulation?: FaultSimulation;
}

// 实验参数
export interface ExperimentParameters {
    port?: number;
    mtu?: number;
    windowSize?: number;
    timeout?: number;
    delay?: number;
    packetLoss?: number;
    reordering?: boolean;
}

// 故障模拟
export interface FaultSimulation {
    type: FaultType;
    probability: number;
    parameters?: Record<string, any>;
}

// 故障类型
export enum FaultType {
    PACKET_LOSS = 'packet_loss',
    DELAY = 'delay',
    REORDERING = 'reordering',
    CORRUPTION = 'corruption',
    DISCONNECTION = 'disconnection'
}

// 用户接口
export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

// 实验记录
export interface ExperimentRecord {
    id: string;
    userId: string;
    experimentId: string;
    timestamp: Date;
    packets: Packet[];
    metrics: ExperimentMetrics;
}

// 实验指标
export interface ExperimentMetrics {
    totalPackets: number;
    sentPackets: number;
    receivedPackets: number;
    droppedPackets: number;
    averageDelay: number;
    throughput: number;
    packetLossRate: number;
}

// 抓包数据
export interface CaptureData {
    id: string;
    timestamp: number;
    packet: Packet;
    filtered: boolean;
}

// 过滤条件
export interface FilterCondition {
    protocol?: ProtocolType;
    source?: string;
    destination?: string;
    port?: number;
    keyword?: string;
    startTime?: number;
    endTime?: number;
}
