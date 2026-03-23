import React, { useState } from 'react';
import { ExperimentParameters, FaultType } from '../../types';
import { FAULT_TYPES, DEFAULT_CONFIG } from '../../constants';
import './index.css';

interface ConfigPanelProps {
    onConfigChange?: (config: ExperimentParameters) => void;
    onFaultChange?: (fault: FaultType | null) => void;
    initialConfig?: ExperimentParameters;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
    onConfigChange,
    onFaultChange,
    initialConfig
}) => {
    const [config, setConfig] = useState<ExperimentParameters>(
        initialConfig || {
            port: DEFAULT_CONFIG.MTU,
            mtu: DEFAULT_CONFIG.MTU,
            windowSize: DEFAULT_CONFIG.WINDOW_SIZE,
            timeout: DEFAULT_CONFIG.TIMEOUT,
            delay: 0,
            packetLoss: 0,
            reordering: false
        }
    );

    const [selectedFault, setSelectedFault] = useState<FaultType | null>(null);

    const handleConfigChange = (field: keyof ExperimentParameters, value: any) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        onConfigChange?.(newConfig);
    };

    const handleFaultToggle = (faultType: FaultType) => {
        const newFault = selectedFault === faultType ? null : faultType;
        setSelectedFault(newFault);
        onFaultChange?.(newFault);
    };

    return (
        <div className="config-panel">
            <div className="panel-header">
                <h2>实验配置</h2>
                <button className="btn btn-sm btn-secondary" onClick={() => { }}>
                    重置
                </button>
            </div>

            <div className="panel-content">
                <div className="config-section">
                    <h3>网络参数</h3>
                    <div className="config-grid">
                        <div className="config-item">
                            <label htmlFor="port">端口</label>
                            <input
                                id="port"
                                type="number"
                                value={config.port || ''}
                                onChange={(e) => handleConfigChange('port', parseInt(e.target.value) || 0)}
                                min={1}
                                max={65535}
                                placeholder="80"
                            />
                        </div>

                        <div className="config-item">
                            <label htmlFor="mtu">MTU (字节)</label>
                            <input
                                id="mtu"
                                type="number"
                                value={config.mtu || ''}
                                onChange={(e) => handleConfigChange('mtu', parseInt(e.target.value) || 0)}
                                min={68}
                                max={9000}
                                placeholder="1500"
                            />
                        </div>

                        <div className="config-item">
                            <label htmlFor="windowSize">窗口大小</label>
                            <input
                                id="windowSize"
                                type="number"
                                value={config.windowSize || ''}
                                onChange={(e) => handleConfigChange('windowSize', parseInt(e.target.value) || 0)}
                                min={1}
                                max={65535}
                                placeholder="65535"
                            />
                        </div>

                        <div className="config-item">
                            <label htmlFor="timeout">超时 (ms)</label>
                            <input
                                id="timeout"
                                type="number"
                                value={config.timeout || ''}
                                onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value) || 0)}
                                min={100}
                                max={60000}
                                placeholder="3000"
                            />
                        </div>
                    </div>
                </div>

                <div className="config-section">
                    <h3>网络模拟</h3>
                    <div className="config-grid">
                        <div className="config-item">
                            <label htmlFor="delay">延迟 (ms)</label>
                            <input
                                id="delay"
                                type="number"
                                value={config.delay || ''}
                                onChange={(e) => handleConfigChange('delay', parseInt(e.target.value) || 0)}
                                min={0}
                                max={10000}
                                placeholder="0"
                            />
                        </div>

                        <div className="config-item">
                            <label htmlFor="packetLoss">丢包率 (%)</label>
                            <input
                                id="packetLoss"
                                type="number"
                                value={config.packetLoss || ''}
                                onChange={(e) => handleConfigChange('packetLoss', parseFloat(e.target.value) || 0)}
                                min={0}
                                max={100}
                                step={0.1}
                                placeholder="0"
                            />
                        </div>

                        <div className="config-item">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={config.reordering || false}
                                    onChange={(e) => handleConfigChange('reordering', e.target.checked)}
                                />
                                <span>数据包乱序</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="config-section">
                    <h3>故障模拟</h3>
                    <div className="fault-grid">
                        {Object.entries(FAULT_TYPES).map(([key, fault]) => (
                            <button
                                key={key}
                                className={`fault-button ${selectedFault === key ? 'active' : ''}`}
                                style={{
                                    borderColor: selectedFault === key ? fault.color : 'transparent',
                                    backgroundColor: selectedFault === key ? `${fault.color}20` : 'transparent'
                                }}
                                onClick={() => handleFaultToggle(key as FaultType)}
                            >
                                <div className="fault-icon" style={{ color: fault.color }}>
                                    {getFaultIcon(key as FaultType)}
                                </div>
                                <div className="fault-info">
                                    <div className="fault-name">{fault.name}</div>
                                    <div className="fault-desc">{fault.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="panel-footer">
                <button className="btn btn-primary btn-full" onClick={() => { }}>
                    应用配置
                </button>
            </div>
        </div>
    );
};

function getFaultIcon(faultType: FaultType): string {
    const icons: Record<FaultType, string> = {
        [FaultType.PACKET_LOSS]: '📦',
        [FaultType.DELAY]: '⏱️',
        [FaultType.REORDERING]: '🔀',
        [FaultType.CORRUPTION]: '💥',
        [FaultType.DISCONNECTION]: '🔌'
    };
    return icons[faultType];
}

export default ConfigPanel;
