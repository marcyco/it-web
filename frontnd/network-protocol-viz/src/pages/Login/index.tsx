import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '../../services/api';
import { STORAGE_KEYS } from '../../constants';
import type { LoginResponse } from '../../types';
import './index.css';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response: LoginResponse = await userApi.login(formData);

            // 保存token和用户信息
            if (response && response.access_token && response.user) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

                // 跳转到首页
                navigate('/', { state: { message: '登录成功！' } });
            } else {
                setError('登录响应格式错误');
            }
        } catch (err: any) {
            setError(err.message || '登录失败，请检查用户名和密码');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="login-container">
                <div className="login-header">
                    <h1>登录</h1>
                    <p>欢迎回到网络协议栈可视化教学平台</p>
                </div>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">用户名</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="请输入用户名"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">密码</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="请输入密码"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={isLoading}
                    >
                        {isLoading ? '登录中...' : '登录'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>还没有账号？</p>
                    <Link to="/register" className="btn btn-link">
                        立即注册
                    </Link>
                </div>

                <div className="login-back">
                    <Link to="/" className="btn btn-back">
                        返回首页
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
