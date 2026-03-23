import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ProtocolStack from '../../components/ProtocolStack';
import PacketFlow from '../../components/PacketFlow';
import DeviceIcon from '../../components/DeviceIcons';
import ConfigPanel from '../../components/ConfigPanel';
import PacketCapture from '../../components/PacketCapture';
import { ProtocolLayer, DeviceType, DeviceStatus, Packet, ExperimentParameters, FaultType } from '../../types';
import useAppStore from '../../store';
import { PRESET_EXPERIMENTS } from '../../constants';
import './index.css';

const Experiment: React.FC = () => {
    const location = useLocation();
    const experimentId = location.state?.experimentId || 'custom';

    // 使用store
    const {
        packets,
        setPackets,
        isCapturing,
        setIsCapturing,
        currentFault,
        setCurrentFault,
        experimentParameters,
        setExperimentParameters,
        selectedPacket,
        setSelectedPacket,
        isLoading,
        setIsLoading,
        error,
        setError
    } = useAppStore();

    const [activeLayer, setActiveLayer] = useState<ProtocolLayer | undefined>();
    const [isPlaying, setIsPlaying] = useState(false);

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

    // 处理过滤变更
    const handleFilterChange = (_filter: any) => {
        // 过滤逻辑在PacketCapture组件中处理
    };

    // 处理导出
    const handleExport = (format: 'pcap' | 'json' | 'csv') => {
        console.log(`Exporting packets as ${format}`);
        // 这里可以调用实际的导出API
        alert(`导出功能已触发，格式：${format}`);
    };

    // 获取预设实验
    const getPresetExperiment = () => {
        return PRESET_EXPERIMENTS.find(exp => exp.id === experimentId);
    };

    const presetExperiment = getPresetExperiment();

    useEffect(() => {
        if (presetExperiment) {
            setExperimentParameters(presetExperiment.parameters);
        }
    }, [experimentId]);

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
                    <ConfigPanel
                        onConfigChange={handleConfigChange}
                        onFaultChange={handleFaultChange}
                        initialConfig={experimentParameters}
                    />
                </aside>

                <main className="experiment-main">
                    <div className="protocol-stack-section">
                        <ProtocolStack
                            activeLayer={activeLayer}
                            onLayerClick={setActiveLayer}
                            showDetails={true}
                        />
                    </div>

                    <div className="packet-flow-section">
                        <PacketFlow
                            packets={packets}
                            isPlaying={isPlaying}
                            onPacketClick={handlePacketSelect}
                        />
                    </div>

                    <div className="network-devices">
                        <h3>网络设备</h3>
                        <div className="devices-grid">
                            <DeviceIcon
                                type={DeviceType.HOST}
                                status={DeviceStatus.NORMAL}
                                name="客户端"
                                position={{ x: 50, y: 50 }}
                                size="medium"
                            />
                            <DeviceIcon
                                type={DeviceType.ROUTER}
                                status={currentFault ? DeviceStatus.WARNING : DeviceStatus.NORMAL}
                                name="路由器"
                                position={{ x: 200, y: 50 }}
                                size="large"
                            />
                            <DeviceIcon
                                type={DeviceType.SWITCH}
                                status={DeviceStatus.NORMAL}
                                name="交换机"
                                position={{ x: 350, y: 50 }}
                                size="medium"
                            />
                            <DeviceIcon
                                type={DeviceType.FIREWALL}
                                status={currentFault ? DeviceStatus.ERROR : DeviceStatus.NORMAL}
                                name="防火墙"
                                position={{ x: 500, y: 50 }}
                                size="medium"
                            />
                            <DeviceIcon
                                type={DeviceType.HOST}
                                status={DeviceStatus.NORMAL}
                                name="服务器"
                                position={{ x: 650, y: 50 }}
                                size="medium"
                            />
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
                    <PacketCapture
                        packets={packets}
                        onPacketSelect={handlePacketSelect}
                        onFilterChange={handleFilterChange}
                        isCapturing={isCapturing}
                        onCaptureToggle={() => setIsCapturing(!isCapturing)}
                        onExport={handleExport}
                    />

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
                            <div className="metric-item">
                                <span className="metric-label">丢包率</span>
                                <span className="metric-value">
                                    {experimentParameters.packetLoss || 0}%
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
