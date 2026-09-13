import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SocketProvider>
          <CartProvider>
            <Router>
              <AppRoutes />
            </Router>
          </CartProvider>
        </SocketProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;



