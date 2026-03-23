import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api';
import { STORAGE_KEYS } from '../../constants';
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validateForm = (): boolean => {
        if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return false;
        }
        if (formData.password.length < 6) {
            setError('密码长度至少为6位');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await userApi.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            // 注册成功，跳转到登录页面
            navigate('/login', { state: { message: '注册成功！请登录' } });
        } catch (err: any) {
            setError(err.message || '注册失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register">
            <div className="register-container">
                <div className="register-header">
                    <h1>注册</h1>
                    <p>创建您的网络协议栈可视化教学平台账号</p>
                </div>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
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
                        <label htmlFor="email">邮箱</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="请输入邮箱"
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
                            placeholder="请输入密码（至少6位）"
                            required
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
                            disabled={isLoading}
                            placeholder="请再次输入密码"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={isLoading}
                    >
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
                    <Link to="/" className="btn btn-back">
                        返回首页
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
