import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ProtocolLayer, DeviceType, DeviceStatus, Packet, ExperimentParameters, FaultType } from '../../types';
import './index.css';

const Experiment: React.FC = () => {
    const location = useLocation();
    const experimentId = location.state?.experimentId || 'custom';

    const [packets, setPackets] = useState<Packet[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [currentFault, setCurrentFault] = useState<FaultType | null>(null);
    const [experimentParameters, setExperimentParameters] = useState<ExperimentParameters>({});
    const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeLayer, setActiveLayer] = useState<ProtocolLayer | undefined>();

    // 模拟数据包生成
    const generatePackets = () => {
        const mockPackets: Packet[] = [];
        const protocols = ['HTTP', 'TCP', 'UDP', 'IP', 'ARP', 'DNS', 'ICMP'];

        for (let i = 0; i < 10; i++) {
            mockPackets.push({
                id: `pkt-${Date.now()}-${i}`,
                timestamp: Date.now() + i * 1000,
                source: '192.168.1.1',
                destination: '192.168.1.2',
                protocol: protocols[i % protocols.length] as any,
                size: Math.floor(Math.random() * 1500) + 64,
                data: `Mock data packet ${i + 1}`,
                layers: [
                    {
                        layer: ProtocolLayer.APPLICATION,
                        protocol: protocols[i % protocols.length] as any,
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'NetworkProtocolViz/1.0'
                        }
                    },
                    {
                        layer: ProtocolLayer.TRANSPORT,
                        protocol: 'TCP' as any,
                        headers: {
                            'Source Port': experimentParameters.port || 80,
                            'Destination Port': experimentParameters.port || 80,
                            'Sequence Number': Math.floor(Math.random() * 65535),
                            'Acknowledgment Number': Math.floor(Math.random() * 65535)
                        }
                    },
                    {
                        layer: ProtocolLayer.NETWORK,
                        protocol: 'IP' as any,
                        headers: {
                            'Source IP': '192.168.1.1',
                            'Destination IP': '192.168.1.2',
                            'TTL': 64,
                            'Protocol': 6
                        }
                    },
                    {
                        layer: ProtocolLayer.DATALINK,
                        protocol: 'Ethernet' as any,
                        headers: {
                            'Source MAC': '00:11:22:33:44:55:66',
                            'Destination MAC': '00:AA:BB:CC:DD:EE:FF',
                            'EtherType': 0x0800
                        }
                    }
                ],
                status: 'sent' as any
            });
        }

        setPackets(mockPackets);
    };

    // 开始实验
    const handleStartExperiment = () => {
        setIsLoading(true);
        setError(null);

        // 模拟开始实验
        setTimeout(() => {
            generatePackets();
            setIsPlaying(true);
            setIsCapturing(true);
            setIsLoading(false);
        }, 1000);
    };

    // 停止实验
    const handleStopExperiment = () => {
        setIsPlaying(false);
        setIsCapturing(false);
    };

    // 重置实验
    const handleResetExperiment = () => {
        setPackets([]);
        setIsPlaying(false);
        setIsCapturing(false);
        setActiveLayer(undefined);
        setCurrentFault(null);
        setSelectedPacket(null);
    };

    // 处理配置变更
    const handleConfigChange = (config: ExperimentParameters) => {
        setExperimentParameters(config);
    };

    // 处理故障变更
    const handleFaultChange = (fault: FaultType | null) => {
        setCurrentFault(fault);
    };

    // 处理数据包选择
    const handlePacketSelect = (packet: Packet) => {
        setSelectedPacket(packet);
    };

    // 处理导出
    const handleExport = (format: 'pcap' | 'json' | 'csv') => {
        console.log(`Exporting packets as ${format}`);
        alert(`导出功能已触发，格式：${format}`);
    };

    return (
        <div className="experiment">
            <header className="experiment-header">
                <h1>网络协议实验</h1>
                <div className="header-actions">
                    <Link to="/" className="btn btn-back">返回首页</Link>
                    <button className="btn btn-secondary" onClick={handleResetExperiment}>
                        重置
                    </button>
                </div>
            </header>

            <div className="experiment-layout">
                <aside className="experiment-sidebar">
                    <div className="config-panel">
                        <h3>实验配置</h3>
                        <div className="config-item">
                            <label>端口</label>
                            <input
                                type="number"
                                value={experimentParameters.port || 80}
                                onChange={(e) => handleConfigChange({ ...experimentParameters, port: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="config-item">
                            <label>MTU</label>
                            <input
                                type="number"
                                value={experimentParameters.mtu || 1500}
                                onChange={(e) => handleConfigChange({ ...experimentParameters, mtu: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="config-item">
                            <label>延迟 (ms)</label>
                            <input
                                type="number"
                                value={experimentParameters.delay || 0}
                                onChange={(e) => handleConfigChange({ ...experimentParameters, delay: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="fault-panel">
                        <h3>故障模拟</h3>
                        <div className="fault-options">
                            <button
                                className={`fault-btn ${currentFault === FaultType.PACKET_LOSS ? 'active' : ''}`}
                                onClick={() => handleFaultChange(currentFault === FaultType.PACKET_LOSS ? null : FaultType.PACKET_LOSS)}
                            >
                                丢包
                            </button>
                            <button
                                className={`fault-btn ${currentFault === FaultType.DELAY ? 'active' : ''}`}
                                onClick={() => handleFaultChange(currentFault === FaultType.DELAY ? null : FaultType.DELAY)}
                            >
                                延迟
                            </button>
                            <button
                                className={`fault-btn ${currentFault === FaultType.CORRUPTION ? 'active' : ''}`}
                                onClick={() => handleFaultChange(currentFault === FaultType.CORRUPTION ? null : FaultType.CORRUPTION)}
                            >
                                损坏
                            </button>
                        </div>
                    </div>
                </aside>

                <main className="experiment-main">
                    <div className="protocol-stack-section">
                        <h3>协议栈</h3>
                        <div className="protocol-stack">
                            <div className={`layer ${activeLayer === ProtocolLayer.APPLICATION ? 'active' : ''}`} onClick={() => setActiveLayer(ProtocolLayer.APPLICATION)}>
                                <span className="layer-name">应用层</span>
                            </div>
                            <div className={`layer ${activeLayer === ProtocolLayer.TRANSPORT ? 'active' : ''}`} onClick={() => setActiveLayer(ProtocolLayer.TRANSPORT)}>
                                <span className="layer-name">传输层</span>
                            </div>
                            <div className={`layer ${activeLayer === ProtocolLayer.NETWORK ? 'active' : ''}`} onClick={() => setActiveLayer(ProtocolLayer.NETWORK)}>
                                <span className="layer-name">网络层</span>
                            </div>
                            <div className={`layer ${activeLayer === ProtocolLayer.DATALINK ? 'active' : ''}`} onClick={() => setActiveLayer(ProtocolLayer.DATALINK)}>
                                <span className="layer-name">数据链路层</span>
                            </div>
                            <div className={`layer ${activeLayer === ProtocolLayer.PHYSICAL ? 'active' : ''}`} onClick={() => setActiveLayer(ProtocolLayer.PHYSICAL)}>
                                <span className="layer-name">物理层</span>
                            </div>
                        </div>
                    </div>

                    <div className="packet-flow-section">
                        <h3>数据包流</h3>
                        <div className="packet-flow">
                            {packets.length === 0 ? (
                                <p className="empty-state">暂无数据包，请开始实验</p>
                            ) : (
                                <div className="packet-list">
                                    {packets.map((packet) => (
                                        <div
                                            key={packet.id}
                                            className={`packet-item ${selectedPacket?.id === packet.id ? 'selected' : ''}`}
                                            onClick={() => handlePacketSelect(packet)}
                                        >
                                            <span className="packet-id">{packet.id}</span>
                                            <span className="packet-protocol">{packet.protocol}</span>
                                            <span className="packet-status">{packet.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="network-devices">
                        <h3>网络设备</h3>
                        <div className="devices-grid">
                            <div className="device" style={{ borderColor: currentFault ? 'orange' : 'green' }}>
                                <div className="device-icon">💻</div>
                                <div className="device-name">客户端</div>
                            </div>
                            <div className="device" style={{ borderColor: currentFault ? 'orange' : 'green' }}>
                                <div className="device-icon">🔄</div>
                                <div className="device-name">路由器</div>
                            </div>
                            <div className="device" style={{ borderColor: currentFault ? 'orange' : 'green' }}>
                                <div className="device-icon">🔀</div>
                                <div className="device-name">交换机</div>
                            </div>
                            <div className="device" style={{ borderColor: currentFault ? 'red' : 'green' }}>
                                <div className="device-icon">🛡️</div>
                                <div className="device-name">防火墙</div>
                            </div>
                            <div className="device" style={{ borderColor: 'green' }}>
                                <div className="device-icon">🖥️</div>
                                <div className="device-name">服务器</div>
                            </div>
                        </div>
                    </div>

                    <div className="experiment-controls">
                        <button
                            className={`btn btn-start ${isPlaying ? 'active' : ''}`}
                            onClick={handleStartExperiment}
                            disabled={isPlaying}
                        >
                            {isLoading ? '启动中...' : '开始实验'}
                        </button>
                        <button
                            className="btn btn-stop"
                            onClick={handleStopExperiment}
                            disabled={!isPlaying}
                        >
                            停止实验
                        </button>
                        <button
                            className="btn btn-reset"
                            onClick={handleResetExperiment}
                        >
                            重置
                        </button>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}
                </main>

                <aside className="experiment-right">
                    <div className="packet-capture">
                        <h3>数据包捕获</h3>
                        <div className="capture-status">
                            <span className={`status-indicator ${isCapturing ? 'active' : ''}`}>
                                {isCapturing ? '● 捕获中' : '○ 已停止'}
                            </span>
                        </div>
                        <div className="capture-actions">
                            <button
                                className="btn btn-capture"
                                onClick={() => setIsCapturing(!isCapturing)}
                            >
                                {isCapturing ? '停止捕获' : '开始捕获'}
                            </button>
                            <button
                                className="btn btn-export"
                                onClick={() => handleExport('json')}
                            >
                                导出JSON
                            </button>
                            <button
                                className="btn btn-export"
                                onClick={() => handleExport('csv')}
                            >
                                导出CSV
                            </button>
                        </div>
                    </div>

                    {selectedPacket && (
                        <div className="packet-details-panel">
                            <h3>数据包详情</h3>
                            <div className="details-content">
                                <div className="detail-item">
                                    <span className="detail-label">ID:</span>
                                    <span className="detail-value">{selectedPacket.id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">时间戳:</span>
                                    <span className="detail-value">
                                        {new Date(selectedPacket.timestamp).toLocaleString('zh-CN')}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">协议:</span>
                                    <span className="detail-value">{selectedPacket.protocol}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">源地址:</span>
                                    <span className="detail-value">{selectedPacket.source}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">目标地址:</span>
                                    <span className="detail-value">{selectedPacket.destination}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">大小:</span>
                                    <span className="detail-value">{selectedPacket.size} bytes</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">状态:</span>
                                    <span className="detail-value">{selectedPacket.status}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">数据:</span>
                                    <span className="detail-value">{selectedPacket.data}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="experiment-metrics">
                        <h3>实验指标</h3>
                        <div className="metrics-grid">
                            <div className="metric-item">
                                <span className="metric-label">总数据包</span>
                                <span className="metric-value">{packets.length}</span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">发送</span>
                                <span className="metric-value">
                                    {packets.filter(p => p.status === 'sent' as any).length}
                                </span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">接收</span>
                                <span className="metric-value">
                                    {packets.filter(p => p.status === 'received' as any).length}
                                </span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">丢失</span>
                                <span className="metric-value">
                                    {packets.filter(p => p.status === 'dropped' as any).length}
                                </span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">平均延迟</span>
                                <span className="metric-value">
                                    {experimentParameters.delay || 0}ms
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Experiment;
