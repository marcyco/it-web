import { Component, ErrorInfo, ReactNode } from 'react';
import './index.css';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);

        // 可以在这里记录错误到错误跟踪服务
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-container">
                        <div className="error-icon">⚠️</div>
                        <h1>出错了</h1>
                        <p className="error-message">
                            {this.state.error?.message || '应用程序遇到了意外错误'}
                        </p>
                        <div className="error-actions">
                            <button onClick={this.handleReset} className="btn btn-primary">
                                重试
                            </button>
                            <button onClick={() => window.location.href = '/'} className="btn btn-secondary">
                                返回首页
                            </button>
                        </div>
                        <details className="error-details">
                            <summary>错误详情</summary>
                            <pre>{this.state.error?.stack}</pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
