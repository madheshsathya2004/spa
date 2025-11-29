import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let idCounter = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, { type = 'info', ttl = 4000 } = {}) => {
    const id = idCounter++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter(x => x.id !== id));
    }, ttl);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show, remove }}>
      {children}
      <div style={containerStyle}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...toastBase, ...toastTypeStyles[t.type] }}>
            <div style={{ fontSize: 14 }}>{t.message}</div>
            <button onClick={() => remove(t.id)} style={closeBtn}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};

const containerStyle = {
  position: 'fixed',
  right: 20,
  top: 20,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  maxWidth: 320,
};

const toastBase = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',
  borderRadius: 8,
  boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
  color: '#fff',
  fontWeight: 600,
};

const toastTypeStyles = {
  success: { background: 'linear-gradient(90deg,#16a34a,#059669)' },
  error: { background: 'linear-gradient(90deg,#ef4444,#dc2626)' },
  info: { background: 'linear-gradient(90deg,#2563eb,#4f46e5)' },
  warn: { background: 'linear-gradient(90deg,#f59e0b,#f97316)' },
};

const closeBtn = {
  background: 'transparent',
  border: 'none',
  color: 'rgba(255,255,255,0.9)',
  marginLeft: 10,
  cursor: 'pointer',
  fontSize: 14
};
