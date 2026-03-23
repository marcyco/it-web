from typing import List, Dict, Any, Optional
from datetime import datetime
import random
import logging
from models.schemas import (
    Packet, PacketStatus, FaultType, FaultSimulation, FaultSimulationCreate
)

logger = logging.getLogger(__name__)


class FaultSimulator:
    """网络故障模拟器"""
    
    def __init__(self, experiment_id: str):
        """
        初始化故障模拟器
        
        Args:
            experiment_id: 实验ID
        """
        self.experiment_id = experiment_id
        self.faults: Dict[FaultType, FaultSimulation] = {}
        self.is_enabled = False
    
    def enable_fault(self, fault_create: FaultSimulationCreate) -> FaultSimulation:
        """
        启用故障模拟
        
        Args:
            fault_create: 故障模拟创建对象
            
        Returns:
            FaultSimulation: 创建的故障模拟对象
        """
        fault = FaultSimulation(
            experiment_id=fault_create.experiment_id,
            fault_type=fault_create.fault_type,
            enabled=fault_create.enabled,
            parameters=fault_create.parameters or {},
            created_at=datetime.utcnow()
        )
        
        self.faults[fault.fault_type] = fault
        self.is_enabled = True
        
        logger.info(f"已启用故障模拟: {fault.fault_type.value}")
        return fault
    
    def disable_fault(self, fault_type: FaultType) -> bool:
        """
        禁用故障模拟
        
        Args:
            fault_type: 故障类型
            
        Returns:
            bool: 是否成功禁用
        """
        if fault_type in self.faults:
            self.faults[fault_type].enabled = False
            
            # 检查是否还有启用的故障
            self.is_enabled = any(f.enabled for f in self.faults.values())
            
            logger.info(f"已禁用故障模拟: {fault_type.value}")
            return True
        
        return False
    
    def disable_all_faults(self):
        """禁用所有故障模拟"""
        for fault in self.faults.values():
            fault.enabled = False
        
        self.is_enabled = False
        logger.info("已禁用所有故障模拟")
    
    def apply_fault(self, packet: Packet) -> Packet:
        """
        对数据包应用故障模拟
        
        Args:
            packet: 原始数据包
            
        Returns:
            Packet: 应用故障后的数据包
        """
        if not self.is_enabled:
            return packet
        
        # 遍历所有启用的故障
        for fault_type, fault in self.faults.items():
            if fault.enabled:
                packet = self._apply_single_fault(packet, fault_type, fault.parameters)
        
        return packet
    
    def _apply_single_fault(self, packet: Packet, fault_type: FaultType, parameters: Dict[str, Any]) -> Packet:
        """
        应用单个故障
        
        Args:
            packet: 数据包
            fault_type: 故障类型
            parameters: 故障参数
            
        Returns:
            Packet: 应用故障后的数据包
        """
        if fault_type == FaultType.PACKET_LOSS:
            return self._apply_packet_loss(packet, parameters)
        elif fault_type == FaultType.DELAY:
            return self._apply_delay(packet, parameters)
        elif fault_type == FaultType.REORDERING:
            return self._apply_reordering(packet, parameters)
        elif fault_type == FaultType.CORRUPTION:
            return self._apply_corruption(packet, parameters)
        elif fault_type == FaultType.CONNECTION_FAILURE:
            return self._apply_connection_failure(packet, parameters)
        
        return packet
    
    def _apply_packet_loss(self, packet: Packet, parameters: Dict[str, Any]) -> Packet:
        """
        应用数据包丢失故障
        
        Args:
            packet: 数据包
            parameters: 故障参数
            
        Returns:
            Packet: 应用故障后的数据包
        """
        loss_rate = parameters.get('loss_rate', 0.1)  # 默认10%丢包率
        
        if random.random() < loss_rate:
            packet.status = PacketStatus.DROPPED
            logger.debug(f"数据包丢失: {packet.sequence_number}")
        
        return packet
    
    def _apply_delay(self, packet: Packet, parameters: Dict[str, Any]) -> Packet:
        """
        应用延迟故障
        
        Args:
            packet: 数据包
            parameters: 故障参数
            
        Returns:
            Packet: 应用故障后的数据包
        """
        delay_rate = parameters.get('delay_rate', 0.2)  # 默认20%延迟率
        min_delay = parameters.get('min_delay', 100)  # 最小延迟（毫秒）
        max_delay = parameters.get('max_delay', 1000)  # 最大延迟（毫秒）
        
        if random.random() < delay_rate:
            packet.status = PacketStatus.DELAYED
            # 在实际应用中，这里应该记录延迟时间
            logger.debug(f"数据包延迟: {packet.sequence_number}")
        
        return packet
    
    def _apply_reordering(self, packet: Packet, parameters: Dict[str, Any]) -> Packet:
        """
        应用乱序故障
        
        Args:
            packet: 数据包
            parameters: 故障参数
            
        Returns:
            Packet: 应用故障后的数据包
        """
        reorder_rate = parameters.get('reorder_rate', 0.1)  # 默认10%乱序率
        
        if random.random() < reorder_rate:
            # 在实际应用中，这里应该调整数据包的顺序
            # 这里只是标记为延迟，实际乱序需要在发送时处理
            packet.status = PacketStatus.DELAYED
            logger.debug(f"数据包乱序: {packet.sequence_number}")
        
        return packet
    
    def _apply_corruption(self, packet: Packet, parameters: Dict[str, Any]) -> Packet:
        """
        应用数据损坏故障
        
        Args:
            packet: 数据包
            parameters: 故障参数
            
        Returns:
            Packet: 应用故障后的数据包
        """
        corruption_rate = parameters.get('corruption_rate', 0.05)  # 默认5%损坏率
        
        if random.random() < corruption_rate:
            packet.status = PacketStatus.CORRUPTED
            
            # 模拟数据损坏
            if packet.raw_data:
                # 随机修改一些字节
                data = list(packet.raw_data)
                for i in range(min(3, len(data))):
                    pos = random.randint(0, len(data) - 1)
                    data[pos] = chr(random.randint(32, 126))
                packet.raw_data = ''.join(data)
            
            logger.debug(f"数据包损坏: {packet.sequence_number}")
        
        return packet
    
    def _apply_connection_failure(self, packet: Packet, parameters: Dict[str, Any]) -> Packet:
        """
        应用连接中断故障
        
        Args:
            packet: 数据包
            parameters: 故障参数
            
        Returns:
            Packet: 应用故障后的数据包
        """
        failure_rate = parameters.get('failure_rate', 0.3)  # 默认30%失败率
        
        if random.random() < failure_rate:
            packet.status = PacketStatus.DROPPED
            logger.debug(f"连接中断: {packet.sequence_number}")
        
        return packet
    
    def get_enabled_faults(self) -> List[FaultSimulation]:
        """
        获取所有启用的故障
        
        Returns:
            List[FaultSimulation]: 启用的故障列表
        """
        return [f for f in self.faults.values() if f.enabled]
    
    def get_fault(self, fault_type: FaultType) -> Optional[FaultSimulation]:
        """
        获取指定类型的故障
        
        Args:
            fault_type: 故障类型
            
        Returns:
            Optional[FaultSimulation]: 故障对象，如果不存在返回None
        """
        return self.faults.get(fault_type)
    
    def get_all_faults(self) -> List[FaultSimulation]:
        """
        获取所有故障
        
        Returns:
            List[FaultSimulation]: 所有故障列表
        """
        return list(self.faults.values())
    
    def reset(self):
        """重置故障模拟器"""
        self.faults.clear()
        self.is_enabled = False
        logger.info("故障模拟器已重置")
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        获取故障统计信息
        
        Returns:
            Dict[str, Any]: 统计信息
        """
        return {
            'total_faults': len(self.faults),
            'enabled_faults': len(self.get_enabled_faults()),
            'fault_types': [f.fault_type.value for f in self.faults.values()]
        }
