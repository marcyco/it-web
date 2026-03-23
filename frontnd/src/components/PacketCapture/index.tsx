import React, { useState } from 'react';
import { Packet, FilterCondition, ProtocolType } from '../../types';
import './index.css';

interface PacketCaptureProps {
    packets: Packet[];
    onPacketSelect?: (packet: Packet) => void;
    onFilterChange?: (filter: FilterCondition) => void;
    isCapturing?: boolean;
    onCaptureToggle?: () => void;
    onExport?: (format: 'pcap' | 'json' | 'csv') => void;
}

const PacketCapture: React.FC<PacketCaptureProps> = ({
    packets,
    onPacketSelect,
    onFilterChange,
    isCapturing = false,
    onCaptureToggle,
    onExport
}) => {
    const [filter, setFilter] = useState<FilterCondition>({});
    const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
    const [expandedPackets, setExpandedPackets] = useState<Set<string>>(new Set());

    const handleFilterChange = (field: keyof FilterCondition, value: any) => {
        const newFilter = { ...filter, [field]: value };
        setFilter(newFilter);
        onFilterChange?.(newFilter);
    };

    const handlePacketClick = (packet: Packet) => {
        setSelectedPacket(packet);
        onPacketSelect?.(packet);
    };

    const togglePacketExpand = (packetId: string) => {
        const newExpanded = new Set(expandedPackets);
        if (newExpanded.has(packetId)) {
            newExpanded.delete(packetId);
        } else {
            newExpanded.add(packetId);
        }
        setExpandedPackets(newExpanded);
    };

    const getFilteredPackets = (): Packet[] => {
        return packets.filter(packet => {
            if (filter.protocol && packet.protocol !== filter.protocol) return false;
            if (filter.source && !packet.source.includes(filter.source)) return false;
            if (filter.destination && !packet.destination.includes(filter.destination)) return false;
            if (filter.keyword && !JSON.stringify(packet).toLowerCase().includes(filter.keyword.toLowerCase())) return false;
            return true;
        });
    };

    const filteredPackets = getFilteredPackets();

    const formatTimestamp = (timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
    };

    const getProtocolColor = (protocol: ProtocolType): string => {
        const colors: Record<ProtocolType, string> = {
            [ProtocolType.HTTP]: '#3498db',
            [ProtocolType.TCP]: '#2ecc71',
            [ProtocolType.UDP]: '#f39c12',
            [ProtocolType.IP]: '#9b59b6',
            [ProtocolType.ARP]: '#e74c3c',
            [ProtocolType.DNS]: '#1abc9c',
            [ProtocolType.ICMP]: '#34495e'
        };
        return colors[protocol];
    };

    const getStatusBadge = (status: string): { text: string; color: string } => {
        const badges: Record<string, { text: string; color: string }> = {
            sent: { text: '已发送', color: '#27ae60' },
            received: { text: '已接收', color: '#3498db' },
            dropped: { text: '已丢失', color: '#e74c3c' },
            delayed: { text: '已延迟', color: '#f39c12' },
            corrupted: { text: '已损坏', color: '#e67e22' }
        };
        return badges[status] || { text: status, color: '#95a5a6' };
    };

    return (
        <div className="packet-capture">
            <div className="capture-header">
                <h2>实时抓包</h2>
                <div className="capture-controls">
                    <button
                        className={`btn ${isCapturing ? 'btn-danger' : 'btn-success'}`}
                        onClick={onCaptureToggle}
                    >
                        {isCapturing ? '停止抓包' : '开始抓包'}
                    </button>
                    <div className="export-buttons">
                        <button className="btn btn-sm" onClick={() => onExport?.('json')}>
                            导出JSON
                        </button>
                        <button className="btn btn-sm" onClick={() => onExport?.('csv')}>
                            导出CSV
                        </button>
                        <button className="btn btn-sm" onClick={() => onExport?.('pcap')}>
                            导出PCAP
                        </button>
                    </div>
                </div>
            </div>

            <div className="capture-filters">
                <div className="filter-row">
                    <label>协议</label>
                    <select
                        value={filter.protocol || ''}
                        onChange={(e) => handleFilterChange('protocol', e.target.value as ProtocolType)}
                    >
                        <option value="">全部</option>
                        <option value={ProtocolType.HTTP}>HTTP</option>
                        <option value={ProtocolType.TCP}>TCP</option>
                        <option value={ProtocolType.UDP}>UDP</option>
                        <option value={ProtocolType.IP}>IP</option>
                        <option value={ProtocolType.ARP}>ARP</option>
                        <option value={ProtocolType.DNS}>DNS</option>
                        <option value={ProtocolType.ICMP}>ICMP</option>
                    </select>
                </div>

                <div className="filter-row">
                    <label>源地址</label>
                    <input
                        type="text"
                        value={filter.source || ''}
                        onChange={(e) => handleFilterChange('source', e.target.value)}
                        placeholder="192.168.1.1"
                    />
                </div>

                <div className="filter-row">
                    <label>目标地址</label>
                    <input
                        type="text"
                        value={filter.destination || ''}
                        onChange={(e) => handleFilterChange('destination', e.target.value)}
                        placeholder="192.168.1.2"
                    />
                </div>

                <div className="filter-row">
                    <label>关键字</label>
                    <input
                        type="text"
                        value={filter.keyword || ''}
                        onChange={(e) => handleFilterChange('keyword', e.target.value)}
                        placeholder="搜索数据包内容"
                    />
                </div>

                <button className="btn btn-secondary btn-sm" onClick={() => setFilter({})}>
                    清除过滤
                </button>
            </div>

            <div className="capture-stats">
                <div className="stat-item">
                    <span className="stat-label">总数据包</span>
                    <span className="stat-value">{packets.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">已过滤</span>
                    <span className="stat-value">{filteredPackets.length}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">抓包状态</span>
                    <span className={`stat-value ${isCapturing ? 'capturing' : ''}`}>
                        {isCapturing ? '🔴 抓包中' : '⚪ 已停止'}
                    </span>
                </div>
            </div>

            <div className="capture-list">
                <div className="list-header">
                    <div className="header-cell">时间</div>
                    <div className="header-cell">协议</div>
                    <div className="header-cell">源地址</div>
                    <div className="header-cell">目标地址</div>
                    <div className="header-cell">大小</div>
                    <div className="header-cell">状态</div>
                    <div className="header-cell">操作</div>
                </div>

                <div className="list-body">
                    {filteredPackets.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <div className="empty-text">暂无数据包</div>
                            <div className="empty-hint">开始抓包或调整过滤条件</div>
                        </div>
                    ) : (
                        filteredPackets.map((packet) => (
                            <div
                                key={packet.id}
                                className={`packet-row ${selectedPacket?.id === packet.id ? 'selected' : ''}`}
                                onClick={() => handlePacketClick(packet)}
                            >
                                <div className="row-cell timestamp">
                                    {formatTimestamp(packet.timestamp)}
                                </div>
                                <div className="row-cell protocol">
                                    <span
                                        className="protocol-badge"
                                        style={{ backgroundColor: getProtocolColor(packet.protocol) }}
                                    >
                                        {packet.protocol.toUpperCase()}
                                    </span>
                                </div>
                                <div className="row-cell source">{packet.source}</div>
                                <div className="row-cell destination">{packet.destination}</div>
                                <div className="row-cell size">{packet.size} bytes</div>
                                <div className="row-cell status">
                                    <span
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusBadge(packet.status).color }}
                                    >
                                        {getStatusBadge(packet.status).text}
                                    </span>
                                </div>
                                <div className="row-cell actions">
                                    <button
                                        className="btn-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            togglePacketExpand(packet.id);
                                        }}
                                    >
                                        {expandedPackets.has(packet.id) ? '▼' : '▶'}
                                    </button>
                                </div>

                                {expandedPackets.has(packet.id) && (
                                    <div className="packet-details">
                                        <div className="detail-section">
                                            <h4>数据包详情</h4>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <span className="detail-label">ID</span>
                                                    <span className="detail-value">{packet.id}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">数据</span>
                                                    <span className="detail-value">{packet.data}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {packet.layers.map((layer, index) => (
                                            <div key={index} className="detail-section">
                                                <h4>{layer.layer}层</h4>
                                                <div className="layer-headers">
                                                    {Object.entries(layer.headers).map(([key, value]) => (
                                                        <div key={key} className="header-item">
                                                            <span className="header-key">{key}:</span>
                                                            <span className="header-value">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {layer.payload && (
                                                    <div className="layer-payload">
                                                        <span className="payload-label">载荷:</span>
                                                        <span className="payload-value">{layer.payload}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PacketCapture;
