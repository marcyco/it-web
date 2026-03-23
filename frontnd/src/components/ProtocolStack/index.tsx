import React from 'react';
import { ProtocolLayer } from '../../types';
import { PROTOCOL_LAYERS } from '../../constants';
import './index.css';

interface ProtocolStackProps {
    activeLayer?: ProtocolLayer;
    onLayerClick?: (layer: ProtocolLayer) => void;
    showDetails?: boolean;
}

const ProtocolStack: React.FC<ProtocolStackProps> = ({
    activeLayer,
    onLayerClick,
    showDetails = true
}) => {
    const layers = [
        ProtocolLayer.APPLICATION,
        ProtocolLayer.TRANSPORT,
        ProtocolLayer.NETWORK,
        ProtocolLayer.DATALINK,
        ProtocolLayer.PHYSICAL
    ];

    return (
        <div className="protocol-stack">
            <div className="stack-header">
                <h2>协议栈</h2>
                {showDetails && (
                    <div className="stack-legend">
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: PROTOCOL_LAYERS.APPLICATION.color }}></span>
                            <span>应用层</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: PROTOCOL_LAYERS.TRANSPORT.color }}></span>
                            <span>传输层</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: PROTOCOL_LAYERS.NETWORK.color }}></span>
                            <span>网络层</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: PROTOCOL_LAYERS.DATALINK.color }}></span>
                            <span>数据链路层</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: PROTOCOL_LAYERS.PHYSICAL.color }}></span>
                            <span>物理层</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="stack-container">
                {layers.map((layer) => {
                    const layerConfig = PROTOCOL_LAYERS[layer as unknown as keyof typeof PROTOCOL_LAYERS];
                    const isActive = activeLayer === layer;

                    return (
                        <div
                            key={layer}
                            className={`stack-layer ${isActive ? 'active' : ''}`}
                            style={{
                                borderColor: layerConfig?.color,
                                backgroundColor: isActive ? `${layerConfig?.color}20` : 'transparent'
                            }}
                            onClick={() => onLayerClick?.(layer)}
                        >
                            <div className="layer-header">
                                <div className="layer-indicator" style={{ backgroundColor: layerConfig?.color }}></div>
                                <h3 className="layer-name">{layerConfig?.name}</h3>
                                {isActive && <span className="layer-badge">活跃</span>}
                            </div>

                            {showDetails && (
                                <div className="layer-content">
                                    <div className="layer-protocols">
                                        {layerConfig?.protocols.map((protocol) => (
                                            <span key={protocol} className="protocol-tag">
                                                {protocol.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="layer-description">
                                        {getLayerDescription(layer)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="stack-arrows">
                <div className="arrow-down">↓</div>
                <div className="arrow-up">↑</div>
            </div>
        </div>
    );
};

function getLayerDescription(layer: ProtocolLayer): string {
    const descriptions: Record<ProtocolLayer, string> = {
        [ProtocolLayer.APPLICATION]: '提供应用程序间通信，如HTTP、DNS等协议',
        [ProtocolLayer.TRANSPORT]: '提供端到端的数据传输，如TCP、UDP协议',
        [ProtocolLayer.NETWORK]: '负责数据包的路由和转发，如IP协议',
        [ProtocolLayer.DATALINK]: '负责节点到节点的数据传输，如ARP、MAC地址',
        [ProtocolLayer.PHYSICAL]: '负责比特流的物理传输，如以太网、光纤'
    };

    return descriptions[layer];
}

export default ProtocolStack;
