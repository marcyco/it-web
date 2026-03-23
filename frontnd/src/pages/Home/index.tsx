import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PRESET_EXPERIMENTS, STORAGE_KEYS } from '../../constants';
import './index.css';

const Home: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 检查用户登录状态
        checkUserStatus();

        // 显示注册成功消息
        if (location.state?.message) {
            alert(location.state.message);
        }
    }, [location]);

    const checkUserStatus = async () => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER);

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
            }
        }
        setIsLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setUser(null);
    };

    const handleStartExperiment = (experimentId: string) => {
        if (!user) {
            alert('请先登录');
            navigate('/login');
        } else {
            navigate('/experiment', { state: { experimentId } });
        }
    };

    if (isLoading) {
        return (
            <div className="home">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home">
            <header className="home-header">
                <h1>网络协议栈可视化教学平台</h1>
                <p>通过交互式可视化学习网络协议栈的工作原理</p>
                <div className="auth-buttons">
                    {user ? (
                        <>
                            <span className="user-info">欢迎, {user.username}</span>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                登出
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-primary">登录</Link>
                            <Link to="/register" className="btn btn-secondary">注册</Link>
                        </>
                    )}
                </div>
            </header>

            <section className="features">
                <h2>平台特性</h2>
                <div className="feature-grid">
                    <div className="feature-card">
                        <h3>协议栈可视化</h3>
                        <p>直观展示应用层、传输层、网络层、数据链路层和物理层的工作原理</p>
                    </div>
                    <div className="feature-card">
                        <h3>数据包流动画</h3>
                        <p>实时观察数据包在各层之间的传输过程和协议交互</p>
                    </div>
                    <div className="feature-card">
                        <h3>网络设备模拟</h3>
                        <p>模拟路由器、交换机、防火墙等网络设备的工作过程</p>
                    </div>
                    <div className="feature-card">
                        <h3>实时抓包分析</h3>
                        <p>捕获和分析网络数据包，支持多种过滤和导出格式</p>
                    </div>
                    <div className="feature-card">
                        <h3>故障模拟</h3>
                        <p>模拟网络故障，如数据包丢失、延迟、乱序等</p>
                    </div>
                    <div className="feature-card">
                        <h3>预设实验场景</h3>
                        <p>提供丰富的预设实验场景，快速开始学习</p>
                    </div>
                </div>
            </section>

            <section className="experiments">
                <h2>预设实验场景</h2>
                <div className="experiment-grid">
                    {PRESET_EXPERIMENTS.map((experiment) => (
                        <div key={experiment.id} className="experiment-card">
                            <h3>{experiment.name}</h3>
                            <p>{experiment.description}</p>
                            <button
                                onClick={() => handleStartExperiment(experiment.id)}
                                className="btn btn-experiment"
                            >
                                开始实验
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="home-footer">
                <p>&copy; 2024 网络协议栈可视化教学平台</p>
            </footer>
        </div>
    );
};

export default Home;
