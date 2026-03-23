import axios from 'axios';
import { STORAGE_KEYS } from '../constants';
import type { LoginResponse, RegisterResponse } from '../types';

// 创建axios实例
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
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
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

// 用户API
export const userApi = {
    // 用户注册
    register: (data: { username: string; email: string; password: string }): Promise<RegisterResponse> => {
        return api.post('/auth/register', data);
    },

    // 用户登录
    login: (data: { username: string; password: string }): Promise<LoginResponse> => {
        return api.post('/auth/login', data);
    },

    // 获取当前用户信息
    getCurrentUser: () => {
        return api.get('/auth/me');
    },

    // 刷新token
    refreshToken: () => {
        return api.post('/auth/refresh');
    },

    // 用户登出
    logout: () => {
        return api.post('/auth/logout');
    },
};

// 实验API
export const experimentApi = {
    // 获取所有实验
    getAll: () => {
        return api.get('/experiments');
    },

    // 获取单个实验
    getById: (id: string) => {
        return api.get(`/experiments/${id}`);
    },

    // 创建实验
    create: (data: any) => {
        return api.post('/experiments', data);
    },

    // 更新实验
    update: (id: string, data: any) => {
        return api.put(`/experiments/${id}`, data);
    },

    // 删除实验
    delete: (id: string) => {
        return api.delete(`/experiments/${id}`);
    },

    // 开始实验
    start: (id: string) => {
        return api.post(`/experiments/${id}/start`);
    },

    // 停止实验
    stop: (id: string) => {
        return api.post(`/experiments/${id}/stop`);
    },

    // 重置实验
    reset: (id: string) => {
        return api.post(`/experiments/${id}/reset`);
    },

    // 获取实验指标
    getMetrics: (id: string) => {
        return api.get(`/experiments/${id}/metrics`);
    },
};

// 数据包API
export const packetApi = {
    // 获取所有数据包
    getAll: (params?: any) => {
        return api.get('/packets', { params });
    },

    // 获取单个数据包
    getById: (id: string) => {
        return api.get(`/packets/${id}`);
    },

    // 创建数据包
    create: (data: any) => {
        return api.post('/packets', data);
    },

    // 更新数据包
    update: (id: string, data: any) => {
        return api.put(`/packets/${id}`, data);
    },

    // 删除数据包
    delete: (id: string) => {
        return api.delete(`/packets/${id}`);
    },

    // 导出数据包
    export: (data: { format: 'json' | 'csv' | 'pcap'; filters?: any }) => {
        return api.post('/packets/export', data);
    },
};

// 协议API
export const protocolApi = {
    // 获取协议栈状态
    getStackStatus: () => {
        return api.get('/protocol/stack/status');
    },

    // 发送数据包
    sendPacket: (data: any) => {
        return api.post('/protocol/stack/send', data);
    },

    // 启用故障模拟
    enableFault: (data: { type: string; parameters?: any }) => {
        return api.post('/protocol/faults', data);
    },

    // 禁用故障模拟
    disableFault: (type: string) => {
        return api.delete(`/protocol/faults/${type}`);
    },

    // 获取故障列表
    getFaults: () => {
        return api.get('/protocol/faults');
    },
};

export default api;
