import { create } from 'zustand';
import { Packet, ExperimentConfig, ExperimentParameters, FaultType, FilterCondition } from '../types';

interface AppState {
    // 用户状态
    user: { id: string; username: string; email: string } | null;
    setUser: (user: { id: string; username: string; email: string } | null) => void;

    // 实验状态
    currentExperiment: ExperimentConfig | null;
    setCurrentExperiment: (experiment: ExperimentConfig | null) => void;

    // 数据包状态
    packets: Packet[];
    setPackets: (packets: Packet[]) => void;
    addPacket: (packet: Packet) => void;
    updatePacket: (id: string, updates: Partial<Packet>) => void;
    removePacket: (id: string) => void;
    clearPackets: () => void;

    // 抓包状态
    isCapturing: boolean;
    setIsCapturing: (capturing: boolean) => void;

    // 过滤状态
    filter: FilterCondition;
    setFilter: (filter: FilterCondition) => void;

    // 故障模拟状态
    currentFault: FaultType | null;
    setCurrentFault: (fault: FaultType | null) => void;

    // 实验参数状态
    experimentParameters: ExperimentParameters;
    setExperimentParameters: (params: ExperimentParameters) => void;

    // UI状态
    selectedPacket: Packet | null;
    setSelectedPacket: (packet: Packet | null) => void;

    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    error: string | null;
    setError: (error: string | null) => void;
}

const useAppStore = create<AppState>((set) => ({
    // 用户状态
    user: null,
    setUser: (user) => set({ user }),

    // 实验状态
    currentExperiment: null,
    setCurrentExperiment: (experiment) => set({ currentExperiment: experiment }),

    // 数据包状态
    packets: [],
    setPackets: (packets) => set({ packets }),
    addPacket: (packet) => set((state) => ({ packets: [...state.packets, packet] })),
    updatePacket: (id, updates) => set((state) => ({
        packets: state.packets.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    removePacket: (id) => set((state) => ({
        packets: state.packets.filter(p => p.id !== id)
    })),
    clearPackets: () => set({ packets: [] }),

    // 抓包状态
    isCapturing: false,
    setIsCapturing: (capturing) => set({ isCapturing: capturing }),

    // 过滤状态
    filter: {},
    setFilter: (filter) => set({ filter }),

    // 故障模拟状态
    currentFault: null,
    setCurrentFault: (fault) => set({ currentFault: fault }),

    // 实验参数状态
    experimentParameters: {
        port: 80,
        mtu: 1500,
        windowSize: 65535,
        timeout: 3000,
        delay: 0,
        packetLoss: 0,
        reordering: false
    },
    setExperimentParameters: (params) => set({ experimentParameters: params }),

    // UI状态
    selectedPacket: null,
    setSelectedPacket: (packet) => set({ selectedPacket: packet }),

    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),

    error: null,
    setError: (error) => set({ error }),
}));

export default useAppStore;
