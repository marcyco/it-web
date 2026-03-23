import React, { useEffect, useRef, useState } from 'react';
import { Packet, ProtocolLayer } from '../../types';
import './index.css';

interface PacketFlowProps {
    packets: Packet[];
    isPlaying: boolean;
    onPacketClick?: (packet: Packet) => void;
}

interface AnimatedPacket {
    id: string;
    x: number;
    y: number;
    targetY: number;
    layer: ProtocolLayer;
    color: string;
    progress: number;
    packet: Packet;
}

const PacketFlow: React.FC<PacketFlowProps> = ({
    packets,
    isPlaying,
    onPacketClick
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [animatedPackets, setAnimatedPackets] = useState<AnimatedPacket[]>([]);
    const animationRef = useRef<number | null>(null);

    const getLayerY = (layer: ProtocolLayer): number => {
        const layerHeights: Record<ProtocolLayer, number> = {
            [ProtocolLayer.APPLICATION]: 50,
            [ProtocolLayer.TRANSPORT]: 150,
            [ProtocolLayer.NETWORK]: 250,
            [ProtocolLayer.DATALINK]: 350,
            [ProtocolLayer.PHYSICAL]: 450
        };
        return layerHeights[layer];
    };

    const getLayerColor = (layer: ProtocolLayer): string => {
        const colors: Record<ProtocolLayer, string> = {
            [ProtocolLayer.APPLICATION]: '#FF6B6B',
            [ProtocolLayer.TRANSPORT]: '#4ECDC4',
            [ProtocolLayer.NETWORK]: '#45B7D1',
            [ProtocolLayer.DATALINK]: '#96CEB4',
            [ProtocolLayer.PHYSICAL]: '#FFEAA7'
        };
        return colors[layer];
    };

    useEffect(() => {
        if (!isPlaying) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制协议栈背景
            drawProtocolStack(ctx, canvas.width);

            // 更新和绘制数据包
            setAnimatedPackets(prev => {
                const newPackets = [...prev];

                // 添加新数据包
                packets.forEach((packet, index) => {
                    if (!newPackets.find(p => p.id === packet.id)) {
                        const startLayer = packet.layers[0]?.layer || ProtocolLayer.APPLICATION;
                        newPackets.push({
                            id: packet.id,
                            x: 100 + index * 80,
                            y: getLayerY(startLayer),
                            targetY: getLayerY(ProtocolLayer.PHYSICAL),
                            layer: startLayer,
                            color: getLayerColor(startLayer),
                            progress: 0,
                            packet
                        });
                    }
                });

                // 更新数据包位置
                newPackets.forEach(p => {
                    p.progress += 0.02;
                    if (p.progress >= 1) {
                        p.progress = 0;
                        // 切换到下一层
                        const layers = [ProtocolLayer.APPLICATION, ProtocolLayer.TRANSPORT, ProtocolLayer.NETWORK, ProtocolLayer.DATALINK, ProtocolLayer.PHYSICAL];
                        const currentIndex = layers.indexOf(p.layer);
                        if (currentIndex < layers.length - 1) {
                            p.layer = layers[currentIndex + 1];
                            p.y = getLayerY(p.layer);
                            p.targetY = getLayerY(ProtocolLayer.PHYSICAL);
                            p.color = getLayerColor(p.layer);
                        }
                    }
                });

                // 绘制数据包
                newPackets.forEach(p => {
                    const currentY = p.y + (p.targetY - p.y) * p.progress;
                    drawPacket(ctx, p.x, currentY, p.color, p.packet);
                });

                return newPackets;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, packets]);

    const drawProtocolStack = (ctx: CanvasRenderingContext2D, width: number) => {
        const layers = [
            { name: '应用层', y: 50, color: '#FF6B6B' },
            { name: '传输层', y: 150, color: '#4ECDC4' },
            { name: '网络层', y: 250, color: '#45B7D1' },
            { name: '数据链路层', y: 350, color: '#96CEB4' },
            { name: '物理层', y: 450, color: '#FFEAA7' }
        ];

        layers.forEach(layer => {
            // 绘制层背景
            ctx.fillStyle = `${layer.color}20`;
            ctx.fillRect(0, layer.y - 30, width, 60);

            // 绘制层标签
            ctx.fillStyle = layer.color;
            ctx.font = 'bold 14px Arial';
            ctx.fillText(layer.name, 10, layer.y + 5);

            // 绘制层分隔线
            ctx.strokeStyle = layer.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, layer.y + 30);
            ctx.lineTo(width, layer.y + 30);
            ctx.stroke();
        });
    };

    const drawPacket = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        color: string,
        packet: Packet
    ) => {
        // 绘制数据包圆形
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制数据包ID
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(packet.id.substring(0, 4), x, y + 4);

        // 绘制数据包信息
        ctx.fillStyle = '#2c3e50';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${packet.protocol.toUpperCase()}`, x + 20, y - 5);
        ctx.fillText(`${packet.size} bytes`, x + 20, y + 8);
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 检查是否点击了数据包
        animatedPackets.forEach(p => {
            const currentY = p.y + (p.targetY - p.y) * p.progress;
            const distance = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - currentY, 2));

            if (distance < 20) {
                onPacketClick?.(p.packet);
            }
        });
    };

    return (
        <div className="packet-flow">
            <div className="flow-header">
                <h2>数据包流动</h2>
                <div className="flow-controls">
                    <button className="btn btn-sm" onClick={() => { }}>
                        暂停
                    </button>
                    <button className="btn btn-sm" onClick={() => { }}>
                        重置
                    </button>
                </div>
            </div>
            <div className="flow-canvas-container">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    onClick={handleCanvasClick}
                    className="flow-canvas"
                />
            </div>
            <div className="flow-legend">
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FF6B6B' }}></span>
                    <span>应用层</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#4ECDC4' }}></span>
                    <span>传输层</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#45B7D1' }}></span>
                    <span>网络层</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#96CEB4' }}></span>
                    <span>数据链路层</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FFEAA7' }}></span>
                    <span>物理层</span>
                </div>
            </div>
        </div>
    );
};

export default PacketFlow;
