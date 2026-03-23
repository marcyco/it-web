import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const NotFound: React.FC = () => {
    return (
        <div className="not-found">
            <div className="not-found-container">
                <div className="not-found-icon">🔍</div>
                <h1>404</h1>
                <h2>页面未找到</h2>
                <p>抱歉，您访问的页面不存在或已被移动。</p>
                <div className="not-found-actions">
                    <Link to="/" className="btn btn-primary">
                        返回首页
                    </Link>
                    <button onClick={() => window.history.back()} className="btn btn-secondary">
                        返回上一页
                    </button>
                </div>
                <div className="not-found-links">
                    <h3>您可能在寻找：</h3>
                    <ul>
                        <li>
                            <Link to="/">首页</Link>
                        </li>
                        <li>
                            <Link to="/experiment">实验页面</Link>
                        </li>
                        <li>
                            <Link to="/login">登录</Link>
                        </li>
                        <li>
                            <Link to="/register">注册</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
