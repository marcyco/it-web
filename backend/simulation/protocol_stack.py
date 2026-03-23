from typing import List, Dict, Any, Optional
from datetime import datetime
import random
import logging
from models.schemas import (
    ProtocolLayer, ProtocolType, Packet, PacketLayer, PacketStatus,
    ExperimentParameters, ExperimentConfig
)

logger = logging.getLogger(__name__)


class ProtocolStackSimulator:
    """协议栈模拟器"""
    
    def __init__(self, experiment_id: str, parameters: ExperimentParameters):
        """
        初始化协议栈模拟器
        
        Args:
            experiment_id: 实验ID
            parameters: 实验参数
        """
        self.experiment_id = experiment_id
        self.parameters = parameters
        self.config = parameters.config
        self.packets: List[Packet] = []
        self.sequence_number = 0
        self.is_running = False
        
        # 协议栈层定义
        self.layers = [
            ProtocolLayer.APPLICATION,
            ProtocolLayer.TRANSPORT,
            ProtocolLayer.NETWORK,
            ProtocolLayer.DATALINK,
            ProtocolLayer.PHYSICAL
        ]
        
        # 协议映射
        self.protocol_mapping = {
            ProtocolLayer.APPLICATION: [ProtocolType.HTTP, ProtocolType.HTTPS, ProtocolType.FTP, ProtocolType.SMTP, ProtocolType.DNS],
            ProtocolLayer.TRANSPORT: [ProtocolType.TCP, ProtocolType.UDP],
            ProtocolLayer.NETWORK: [ProtocolType.IP, ProtocolType.ICMP],
            ProtocolLayer.DATALINK: [ProtocolType.ETHERNET, ProtocolType.ARP],
            ProtocolLayer.PHYSICAL: [ProtocolType.WIFI]
        }
    
    def start(self):
        """启动模拟"""
        self.is_running = True
        logger.info(f"协议栈模拟器已启动: {self.experiment_id}")
    
    def stop(self):
        """停止模拟"""
        self.is_running = False
        logger.info(f"协议栈模拟器已停止: {self.experiment_id}")
    
    def reset(self):
        """重置模拟"""
        self.packets = []
        self.sequence_number = 0
        self.is_running = False
        logger.info(f"协议栈模拟器已重置: {self.experiment_id}")
    
    def create_packet(self, payload: str = None) -> Packet:
        """
        创建数据包
        
        Args:
            payload: 数据包载荷
            
        Returns:
            Packet: 创建的数据包
        """
        self.sequence_number += 1
        
        # 确定协议类型
        protocol = self.parameters.protocol
        
        # 创建数据包
        packet = Packet(
            experiment_id=self.experiment_id,
            sequence_number=self.sequence_number,
            timestamp=datetime.utcnow(),
            source_ip=self.parameters.source_ip,
            destination_ip=self.parameters.destination_ip,
            source_port=self.parameters.source_port,
            destination_port=self.parameters.destination_port,
            protocol=protocol,
            size=random.randint(64, 1500),
            status=PacketStatus.SENT,
            layers=[],
            raw_data=payload
        )
        
        # 生成协议栈各层信息
        packet.layers = self._generate_packet_layers(packet, payload)
        
        # 更新数据包大小
        packet.size = self._calculate_packet_size(packet.layers)
        
        self.packets.append(packet)
        return packet
    
    def _generate_packet_layers(self, packet: Packet, payload: str = None) -> List[PacketLayer]:
        """
        生成数据包各层信息
        
        Args:
            packet: 数据包对象
            payload: 数据包载荷
            
        Returns:
            List[PacketLayer]: 协议栈各层信息
        """
        layers = []
        
        # 应用层
        app_layer = self._create_application_layer(packet, payload)
        layers.append(app_layer)
        
        # 传输层
        transport_layer = self._create_transport_layer(packet)
        layers.append(transport_layer)
        
        # 网络层
        network_layer = self._create_network_layer(packet)
        layers.append(network_layer)
        
        # 数据链路层
        datalink_layer = self._create_datalink_layer(packet)
        layers.append(datalink_layer)
        
        # 物理层
        physical_layer = self._create_physical_layer(packet)
        layers.append(physical_layer)
        
        return layers
    
    def _create_application_layer(self, packet: Packet, payload: str = None) -> PacketLayer:
        """创建应用层信息"""
        protocol = self.parameters.protocol
        
        headers = {
            'method': 'GET',
            'path': '/',
            'version': 'HTTP/1.1',
            'host': f"{packet.destination_ip}:{packet.destination_port}",
            'user_agent': 'NetworkProtocolViz/1.0'
        }
        
        if protocol == ProtocolType.DNS:
            headers = {
                'query_type': 'A',
                'query_name': 'example.com',
                'query_class': 'IN'
            }
        elif protocol == ProtocolType.FTP:
            headers = {
                'command': 'RETR',
                'argument': 'file.txt'
            }
        elif protocol == ProtocolType.SMTP:
            headers = {
                'from': 'sender@example.com',
                'to': 'recipient@example.com',
                'subject': 'Test Email'
            }
        
        return PacketLayer(
            layer=ProtocolLayer.APPLICATION,
            protocol=protocol,
            headers=headers,
            payload=payload or "Application layer data"
        )
    
    def _create_transport_layer(self, packet: Packet) -> PacketLayer:
        """创建传输层信息"""
        protocol = ProtocolType.TCP if self.parameters.protocol in [
            ProtocolType.HTTP, ProtocolType.HTTPS, ProtocolType.FTP, ProtocolType.SMTP
        ] else ProtocolType.UDP
        
        headers = {
            'source_port': packet.source_port,
            'destination_port': packet.destination_port,
            'sequence_number': random.randint(0, 4294967295),
            'acknowledgment_number': random.randint(0, 4294967295),
            'window_size': self.config.window_size,
            'checksum': hex(random.randint(0, 65535))
        }
        
        if protocol == ProtocolType.TCP:
            headers.update({
                'flags': {
                    'syn': True,
                    'ack': False,
                    'fin': False,
                    'rst': False,
                    'psh': False,
                    'urg': False
                }
            })
        else:  # UDP
            headers.update({
                'length': random.randint(8, 65535)
            })
        
        return PacketLayer(
            layer=ProtocolLayer.TRANSPORT,
            protocol=protocol,
            headers=headers
        )
    
    def _create_network_layer(self, packet: Packet) -> PacketLayer:
        """创建网络层信息"""
        headers = {
            'version': 4,
            'header_length': 20,
            'tos': 0,
            'total_length': random.randint(20, 65535),
            'identification': random.randint(0, 65535),
            'flags': {
                'df': False,
                'mf': False
            },
            'fragment_offset': 0,
            'ttl': 64,
            'protocol': 6 if self.parameters.protocol in [
                ProtocolType.HTTP, ProtocolType.HTTPS, ProtocolType.FTP, ProtocolType.SMTP
            ] else 17,
            'checksum': hex(random.randint(0, 65535)),
            'source_ip': packet.source_ip,
            'destination_ip': packet.destination_ip
        }
        
        return PacketLayer(
            layer=ProtocolLayer.NETWORK,
            protocol=ProtocolType.IP,
            headers=headers
        )
    
    def _create_datalink_layer(self, packet: Packet) -> PacketLayer:
        """创建数据链路层信息"""
        headers = {
            'source_mac': self._generate_mac_address(),
            'destination_mac': self._generate_mac_address(),
            'ethertype': 0x0800,  # IPv4
            'frame_size': random.randint(64, 1518)
        }
        
        return PacketLayer(
            layer=ProtocolLayer.DATALINK,
            protocol=ProtocolType.ETHERNET,
            headers=headers
        )
    
    def _create_physical_layer(self, packet: Packet) -> PacketLayer:
        """创建物理层信息"""
        headers = {
            'signal_strength': random.randint(0, 100),
            'noise_level': random.randint(0, 10),
            'bit_rate': random.choice([10, 100, 1000, 10000]),  # Mbps
            'encoding': 'NRZ'
        }
        
        return PacketLayer(
            layer=ProtocolLayer.PHYSICAL,
            protocol=ProtocolType.WIFI,
            headers=headers
        )
    
    def _calculate_packet_size(self, layers: List[PacketLayer]) -> int:
        """
        计算数据包大小
        
        Args:
            layers: 协议栈各层信息
            
        Returns:
            int: 数据包大小（字节）
        """
        size = 0
        
        # 物理层
        size += 8  # 前导码
        
        # 数据链路层
        size += 14  # 以太网头
        
        # 网络层
        size += 20  # IP头
        
        # 传输层
        for layer in layers:
            if layer.layer == ProtocolLayer.TRANSPORT:
                if layer.protocol == ProtocolType.TCP:
                    size += 20  # TCP头
                else:
                    size += 8  # UDP头
                break
        
        # 应用层
        for layer in layers:
            if layer.layer == ProtocolLayer.APPLICATION:
                if layer.payload:
                    size += len(layer.payload.encode('utf-8'))
                break
        
        # FCS
        size += 4
        
        return size
    
    def _generate_mac_address(self) -> str:
        """生成MAC地址"""
        return ':'.join([f'{random.randint(0, 255):02x}' for _ in range(6)])
    
    def get_packets(self) -> List[Packet]:
        """获取所有数据包"""
        return self.packets
    
    def get_packet_by_sequence(self, sequence_number: int) -> Optional[Packet]:
        """
        根据序列号获取数据包
        
        Args:
            sequence_number: 序列号
            
        Returns:
            Optional[Packet]: 数据包对象，如果不存在返回None
        """
        for packet in self.packets:
            if packet.sequence_number == sequence_number:
                return packet
        return None
    
    def get_packets_by_status(self, status: PacketStatus) -> List[Packet]:
        """
        根据状态获取数据包
        
        Args:
            status: 数据包状态
            
        Returns:
            List[Packet]: 符合条件的数据包列表
        """
        return [p for p in self.packets if p.status == status]
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        获取统计信息
        
        Returns:
            Dict[str, Any]: 统计信息
        """
        total = len(self.packets)
        sent = len(self.get_packets_by_status(PacketStatus.SENT))
        received = len(self.get_packets_by_status(PacketStatus.RECEIVED))
        dropped = len(self.get_packets_by_status(PacketStatus.DROPPED))
        delayed = len(self.get_packets_by_status(PacketStatus.DELAYED))
        corrupted = len(self.get_packets_by_status(PacketStatus.CORRUPTED))
        
        # 计算平均延迟
        delays = []
        for packet in self.packets:
            if packet.status == PacketStatus.DELAYED:
                # 模拟延迟时间
                delay = random.randint(10, 1000)
                delays.append(delay)
        
        avg_delay = sum(delays) / len(delays) if delays else 0
        
        # 计算吞吐量
        total_size = sum(p.size for p in self.packets)
        duration = 1  # 假设1秒
        throughput = total_size / duration if duration > 0 else 0
        
        return {
            'total_packets': total,
            'sent_packets': sent,
            'received_packets': received,
            'dropped_packets': dropped,
            'delayed_packets': delayed,
            'corrupted_packets': corrupted,
            'average_delay': avg_delay,
            'throughput': throughput
        }
