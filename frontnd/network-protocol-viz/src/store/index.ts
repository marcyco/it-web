import { create } from 'zustand';
import { Packet, ExperimentParameters, FaultType } from '../types';

interface AppState {
    packets: Packet[];
    setPackets: (packets: Packet[]) => void;
    isCapturing: boolean;
    setIsCapturing: (capturing: boolean) => void;
    currentFault: FaultType | null;
    setCurrentFault: (fault: FaultType | null) => void;
    experimentParameters: ExperimentParameters;
    setExperimentParameters: (params: ExperimentParameters) => void;
    selectedPacket: Packet | null;
    setSelectedPacket: (packet: Packet | null) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    packets: [],
    setPackets: (packets) => set({ packets }),
    isCapturing: false,
    setIsCapturing: (capturing) => set({ isCapturing: capturing }),
    currentFault: null,
    setCurrentFault: (fault) => set({ currentFault: fault }),
    experimentParameters: {},
    setExperimentParameters: (params) => set({ experimentParameters: params }),
    selectedPacket: null,
    setSelectedPacket: (packet) => set({ selectedPacket: packet }),
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    error: null,
    setError: (error) => set({ error }),
}));
