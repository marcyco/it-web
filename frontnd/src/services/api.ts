import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../constants';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        // 从localStorage获取token
        const token = localStorage.getItem('network_protocol_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 未授权，清除token并跳转到登录页
                    localStorage.removeItem('network_protocol_token');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('没有权限访问此资源');
                    break;
                case 404:
                    console.error('请求的资源不存在');
                    break;
                case 500:
                    console.error('服务器内部错误');
                    break;
                default:
                    console.error('请求失败:', error.response.data);
            }
        } else if (error.request) {
            console.error('网络错误，请检查网络连接');
        } else {
            console.error('请求配置错误:', error.message);
        }
        return Promise.reject(error);
    }
);

// 用户相关API
export const userApi = {
    // 用户注册
    register: (data: { username: string; email: string; password: string }) => {
        return apiClient.post('/auth/register', data);
    },

    // 用户登录
    login: (data: { username: string; password: string }) => {
        return apiClient.post('/auth/login', data);
    },

    // 获取用户信息
    getUserInfo: () => {
        return apiClient.get('/auth/me');
    },

    // 刷新令牌
    refreshToken: () => {
        return apiClient.post('/auth/refresh');
    },

    // 用户登出
    logout: () => {
        return apiClient.post('/auth/logout');
    },
};

// 实验相关API
export const experimentApi = {
    // 获取所有实验配置
    getAllExperiments: (params?: { page?: number; page_size?: number; status?: string }) => {
        return apiClient.get('/experiments', { params });
    },

    // 获取单个实验配置
    getExperiment: (id: string) => {
        return apiClient.get(`/experiments/${id}`);
    },

    // 创建实验配置
    createExperiment: (data: any) => {
        return apiClient.post('/experiments', data);
    },

    // 更新实验配置
    updateExperiment: (id: string, data: any) => {
        return apiClient.put(`/experiments/${id}`, data);
    },

    // 删除实验配置
    deleteExperiment: (id: string) => {
        return apiClient.delete(`/experiments/${id}`);
    },

    // 开始实验
    startExperiment: (id: string) => {
        return apiClient.post(`/experiments/${id}/start`);
    },

    // 停止实验
    stopExperiment: (id: string) => {
        return apiClient.post(`/experiments/${id}/stop`);
    },

    // 重置实验
    resetExperiment: (id: string) => {
        return apiClient.post(`/experiments/${id}/reset`);
    },

    // 获取实验指标
    getExperimentMetrics: (id: string) => {
        return apiClient.get(`/experiments/${id}/metrics`);
    },
};

// 数据包相关API
export const packetApi = {
    // 创建数据包
    createPacket: (data: any) => {
        return apiClient.post('/packets', data);
    },

    // 获取抓包数据
    getPackets: (params?: {
        experiment_id?: string;
        page?: number;
        page_size?: number;
        protocol?: string;
        status?: string;
        source_ip?: string;
        destination_ip?: string;
    }) => {
        return apiClient.get('/packets', { params });
    },

    // 导出数据包
    exportPackets: (data: {
        experiment_id: string;
        format: 'pcap' | 'json' | 'csv';
        filters?: any;
    }) => {
        return apiClient.post('/packets/export', data, { responseType: 'blob' });
    },

    // 获取数据包详情
    getPacketDetails: (id: string) => {
        return apiClient.get(`/packets/${id}`);
    },

    // 更新数据包
    updatePacket: (id: string, data: any) => {
        return apiClient.put(`/packets/${id}`, data);
    },
};

// 协议栈相关API
export const protocolApi = {
    // 获取协议栈状态
    getProtocolStackStatus: (experimentId: string) => {
        return apiClient.get('/protocol/stack/status', { params: { experiment_id: experimentId } });
    },

    // 发送数据包
    sendPacket: (data: { experiment_id: string; payload?: string }) => {
        return apiClient.post('/protocol/stack/send', data);
    },

    // 启用故障模拟
    enableFault: (data: {
        experiment_id: string;
        fault_type: string;
        enabled: boolean;
        parameters?: any;
    }) => {
        return apiClient.post('/protocol/faults', data);
    },

    // 禁用故障模拟
    disableFault: (faultType: string, experimentId: string) => {
        return apiClient.delete(`/protocol/faults/${faultType}`, {
            params: { experiment_id: experimentId }
        });
    },

    // 获取故障模拟列表
    getFaults: (experimentId: string) => {
        return apiClient.get('/protocol/faults', {
            params: { experiment_id: experimentId }
        });
    },
};

// 导出所有API
export default {
    user: userApi,
    experiment: experimentApi,
    packet: packetApi,
    protocol: protocolApi,
};
