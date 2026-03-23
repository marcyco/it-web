import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api';
import { STORAGE_KEYS } from '../../constants';
import './index.css';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await userApi.login(formData);

            if (response.data.success) {
                // 保存令牌和用户信息
                localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.data.access_token);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));

                // 跳转到首页
                navigate('/');
            } else {
                setError(response.data.message || '登录失败');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || '登录失败，请检查网络连接');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="login">
            <div className="login-container">
                <header className="login-header">
                    <h1>登录</h1>
                    <p>网络协议栈可视化教学平台</p>
                </header>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{error}</span>
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">用户名</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="请输入用户名"
                            disabled={isLoading}
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
                            required
                            placeholder="请输入密码"
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
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
                    <Link to="/" className="btn btn-secondary">
                        返回首页
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
