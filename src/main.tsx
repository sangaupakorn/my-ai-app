import {Component, StrictMode} from 'react';
import type {ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {CartProvider} from './context/CartContext.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** กันจอขาว: ถ้ามีข้อผิดพลาดตอนแสดงผล จะโชว์ข้อความแทนหน้าว่าง */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  state: ErrorBoundaryState = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif', textAlign: 'center'}}>
        <div>
          <h1 style={{fontSize: 22, marginBottom: 8}}>ขออภัย เว็บไซต์ขัดข้องชั่วคราว</h1>
          <p style={{color: '#555', marginBottom: 16}}>กรุณาลองโหลดหน้าใหม่ หรือติดต่อร้านทาง LINE / โทร 055-616437</p>
          <button
            onClick={() => window.location.reload()}
            style={{padding: '10px 20px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', fontSize: 16, cursor: 'pointer'}}
          >
            โหลดหน้าใหม่
          </button>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <CartProvider>
        <App />
      </CartProvider>
    </ErrorBoundary>
  </StrictMode>,
);
