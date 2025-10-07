import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toaster = ({ 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  isVisible, 
  onClose, 
  duration = 5000,
  position = 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600';
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-lg" />;
      case 'error':
        return <FaTimes className="text-lg" />;
      case 'warning':
        return <FaExclamationTriangle className="text-lg" />;
      default:
        return <FaInfoCircle className="text-lg" />;
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!show) return null;

  return (
    <div className={`fixed z-50 ${getPositionStyles()}`}>
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        ${getTypeStyles()}
        transform transition-all duration-300 ease-in-out
        ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        min-w-[300px] max-w-[400px]
      `}>
        {getIcon()}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setShow(false);
            onClose && onClose();
          }}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default Toaster;