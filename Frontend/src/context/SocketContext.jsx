import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useToast } from './ToastContext';
import { STATIC_BASE_URL } from '../api/endpoints';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { info, success } = useToast();

  const notificationListeners = useRef(new Set());
  const workflowListeners = useRef(new Set());

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socketUrl = STATIC_BASE_URL || 'http://localhost:5001';
    
    const socketInstance = io(socketUrl, {
      auth: { token: token || '' },
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('notification', (data) => {
      const msg = data.message || data.title || 'New notification received';
      info(msg);

      notificationListeners.current.forEach((cb) => {
        try { cb(data); } catch (e) { /* ignore */ }
      });
    });

    socketInstance.on('workflow:updated', (data) => {
      workflowListeners.current.forEach((cb) => {
        try { cb(data); } catch (e) { /* ignore */ }
      });
    });

    socketInstance.on('workflow:completed', (data) => {
      success('Dispatch task marked as completed');
      workflowListeners.current.forEach((cb) => {
        try { cb(data); } catch (e) { /* ignore */ }
      });
    });

    socketInstance.on('workflow:assigned', (data) => {
      info('You have a new dispatch task assigned');
      workflowListeners.current.forEach((cb) => {
        try { cb(data); } catch (e) { /* ignore */ }
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [info, success]);

  const subscribeToNotifications = useCallback((callback) => {
    notificationListeners.current.add(callback);
    return () => {
      notificationListeners.current.delete(callback);
    };
  }, []);

  const subscribeToWorkflows = useCallback((callback) => {
    workflowListeners.current.add(callback);
    return () => {
      workflowListeners.current.delete(callback);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        subscribeToNotifications,
        subscribeToWorkflows,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
