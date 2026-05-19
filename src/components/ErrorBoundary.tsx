import { Component, ReactNode } from 'react';

type ErrorType = 'CAMERA' | 'MODEL' | 'NETWORK' | 'UNKNOWN';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorType: ErrorType | null;
  errorMessage: string | null;
}

const errorMessages: Record<ErrorType, { title: string; description: string; action: string }> = {
  CAMERA: {
    title: '摄像头访问失败',
    description: '无法访问摄像头，请确保已授予摄像头权限，或切换到手动模式。',
    action: '切换到手动模式',
  },
  MODEL: {
    title: '模型加载失败',
    description: '表情识别模型加载失败，请检查网络连接后重试。',
    action: '重新加载',
  },
  NETWORK: {
    title: '网络连接失败',
    description: '网络连接不稳定，部分资源可能无法加载。',
    action: '重试',
  },
  UNKNOWN: {
    title: '发生未知错误',
    description: '游戏遇到了意外错误，请尝试刷新页面。',
    action: '刷新页面',
  },
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorType: null, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const message = error.message.toLowerCase();
    
    let errorType: ErrorType = 'UNKNOWN';
    
    if (message.includes('camera') || message.includes('media') || message.includes('permission')) {
      errorType = 'CAMERA';
    } else if (message.includes('model') || message.includes('face-api') || message.includes('load')) {
      errorType = 'MODEL';
    } else if (message.includes('network') || message.includes('fetch') || message.includes('networkerror')) {
      errorType = 'NETWORK';
    }
    
    return { hasError: true, errorType, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game Error:', error, errorInfo);
  }

  handleRetry = () => {
    const { errorType } = this.state;
    
    if (errorType === 'MODEL' || errorType === 'NETWORK') {
      window.location.reload();
    } else {
      this.setState({ hasError: false, errorType: null, errorMessage: null });
    }
  };

  handleManualMode = () => {
    this.setState({ hasError: false, errorType: null, errorMessage: null });
    window.dispatchEvent(new CustomEvent('switchToManualMode'));
  };

  render() {
    if (this.state.hasError && this.state.errorType) {
      const errorInfo = errorMessages[this.state.errorType];
      
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <div 
            className="max-w-md mx-4 p-8 border border-red-400/30 bg-black/90 animate-fade-in"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center border border-red-400/30">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="font-display text-lg tracking-wider text-red-400">
                {errorInfo.title}
              </h2>
            </div>
            
            <p className="font-serif text-sm text-white/60 mb-6 leading-relaxed">
              {errorInfo.description}
            </p>
            
            {this.state.errorMessage && (
              <div className="mb-6 p-3 bg-white/5 border border-white/10">
                <p className="font-mono text-xs text-white/40 break-all">
                  {this.state.errorMessage}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              {this.state.errorType === 'CAMERA' && (
                <button
                  onClick={this.handleManualMode}
                  className="flex-1 px-4 py-3 border border-amber-400/30 bg-amber-400/5 font-display text-sm
                    tracking-wider text-amber-400 transition-all duration-300 hover:bg-amber-400/10 active:scale-95"
                >
                  切换到手动模式
                </button>
              )}
              <button
                onClick={this.handleRetry}
                className="flex-1 px-4 py-3 border border-white/20 font-display text-sm
                  tracking-wider text-white/70 transition-all duration-300 hover:bg-white/5 active:scale-95"
              >
                {errorInfo.action}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
