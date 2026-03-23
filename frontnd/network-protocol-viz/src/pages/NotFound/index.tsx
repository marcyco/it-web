import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="not-found">
            <div className="not-found-container">
                <div className="not-found-content">
                    <h1 className="error-code">404</h1>
                    <h2 className="error-title">页面未找到</h2>
                    <p className="error-message">
                        抱歉，您访问的页面不存在或已被移除。
                    </p>
                    <div className="not-found-actions">
                        <button onClick={handleGoBack} className="btn btn-secondary">
                            返回上一页
                        </button>
                        <Link to="/" className="btn btn-primary">
                            返回首页
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
