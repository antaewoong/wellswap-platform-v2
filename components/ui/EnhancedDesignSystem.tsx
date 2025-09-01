'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 🎨 Enhanced Design System Components

// Modern Button with enhanced states
export const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  disabled = false,
  icon,
  onClick,
  className = '',
  ...props 
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2 font-medium rounded-xl
    transition-all duration-200 ease-in-out transform-gpu
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600
      hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-purple-500
    `,
    secondary: `
      bg-white border-2 border-gray-200 hover:border-gray-300
      text-gray-700 hover:text-gray-900
      hover:bg-gray-50 shadow-sm hover:shadow-md
      focus:ring-gray-500
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-600
      hover:from-green-600 hover:to-emerald-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-green-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-600
      hover:from-red-600 hover:to-pink-700
      text-white shadow-lg hover:shadow-xl
      focus:ring-red-500
    `,
    outline: `
      border-2 border-purple-300 hover:border-purple-500
      text-purple-600 hover:text-purple-700
      hover:bg-purple-50
      focus:ring-purple-500
    `
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
        </svg>
      )}
      {icon && !isLoading && <span className="w-5 h-5">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};

// Enhanced Card Component
export const ModernCard = ({ 
  children, 
  className = '', 
  hover = true, 
  glow = false,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={`
        bg-white rounded-2xl border border-gray-100 shadow-sm
        ${hover ? 'hover:shadow-xl hover:border-gray-200' : ''}
        ${glow ? 'hover:shadow-2xl hover:shadow-purple-500/10' : ''}
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Modern Input Component
export const ModernInput = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  required = false,
  ...props 
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 w-5 h-5">{icon}</span>
          </div>
        )}
        <input
          className={`
            w-full rounded-xl border-2 px-4 py-3 text-gray-900 placeholder-gray-400
            transition-all duration-200 ease-in-out
            ${icon ? 'pl-12' : ''}
            ${focused ? 'border-purple-500 ring-4 ring-purple-500/10' : 'border-gray-200'}
            ${error ? 'border-red-500 ring-4 ring-red-500/10' : ''}
            hover:border-gray-300
            focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10
          `}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Progress Indicator
export const ModernProgress = ({ 
  steps, 
  currentStep, 
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: index <= currentStep ? 1 : 0.8,
                backgroundColor: index <= currentStep ? '#8b5cf6' : '#e5e7eb'
              }}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStep ? 'text-white' : 'text-gray-500'}
                transition-all duration-300
              `}
            >
              {index < currentStep ? '✓' : index + 1}
            </motion.div>
            <span className={`
              mt-2 text-xs font-medium text-center
              ${index <= currentStep ? 'text-purple-600' : 'text-gray-400'}
            `}>
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full"
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

// Modern Modal
export const ModernModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnOverlay = true 
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-screen-xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={closeOnOverlay ? onClose : undefined}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`
                bg-white rounded-2xl shadow-2xl w-full ${sizes[size]}
                max-h-[90vh] overflow-y-auto
              `}
            >
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Status Badge
export const StatusBadge = ({ 
  status, 
  variant = 'default',
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
      ${variants[variant]} ${className}
    `}>
      {status}
    </span>
  );
};

// Loading Skeleton
export const LoadingSkeleton = ({ 
  height = '20px', 
  width = '100%', 
  className = '' 
}) => {
  return (
    <div
      className={`
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
        animate-pulse rounded-lg ${className}
      `}
      style={{ height, width }}
    />
  );
};

// Toast Notification
export const ToastNotification = ({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose 
}) => {
  const types = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white', 
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`
            fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg
            ${types[type]} max-w-sm
          `}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{message}</span>
            <button 
              onClick={onClose}
              className="ml-4 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Wallet Connection Card
export const WalletConnectionCard = ({ 
  onConnect, 
  isConnected, 
  walletAddress, 
  balance,
  isLoading 
}) => {
  return (
    <ModernCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Polygon Wallet
          </h3>
          {isConnected ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </p>
              <p className="text-sm font-medium text-green-600">
                {balance} MATIC
              </p>
              <StatusBadge status="Connected" variant="success" />
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Connect your MetaMask to start trading
              </p>
              <ModernButton 
                onClick={onConnect}
                isLoading={isLoading}
                size="sm"
                icon={null}
              >
                Connect Wallet
              </ModernButton>
            </div>
          )}
        </div>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>
    </ModernCard>
  );
};

export default {
  ModernButton,
  ModernCard,
  ModernInput,
  ModernProgress,
  ModernModal,
  StatusBadge,
  LoadingSkeleton,
  ToastNotification,
  WalletConnectionCard
};