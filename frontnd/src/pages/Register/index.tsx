import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api';
import './index.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('密码不匹配');
            return;
        }

        if (formData.password.length < 6) {
            setError('密码长度至少为6位');
            return;
        }

        setIsLoading(true);

        try {
            const response = await userApi.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                // 注册成功，跳转到登录页面
                navigate('/login', {
                    state: { message: '注册成功，请登录' }
                });
            } else {
                setError(response.data.message || '注册失败');
            }
        } catch (err: any) {
            console.error('Register error:', err);
            setError(err.response?.data?.message || '注册失败，请检查网络连接');
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
        <div className="register">
            <div className="register-container">
                <header className="register-header">
                    <h1>注册</h1>
                    <p>网络协议栈可视化教学平台</p>
                </header>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{error}</span>
                    </div>
                )}

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">用户名</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="请输入用户名（至少3个字符）"
                            disabled={isLoading}
                            minLength={3}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">邮箱</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="请输入邮箱"
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
                            placeholder="请输入密码（至少6个字符）"
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">确认密码</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="请再次输入密码"
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                        {isLoading ? '注册中...' : '注册'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>已有账号？</p>
                    <Link to="/login" className="btn btn-link">
                        立即登录
                    </Link>
                </div>

                <div className="register-back">
                    <Link to="/" className="btn btn-secondary">
                        返回首页
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
