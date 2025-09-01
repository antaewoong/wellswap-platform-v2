'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 🚀 Mobile-First Optimized Components

// Mobile-optimized Glass Button
export const MobileGlassButton = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  haptic = true,
  className = '',
  onClick,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10); // Subtle haptic feedback
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-neutral-900 to-neutral-800 text-white
      shadow-lg active:shadow-xl
      border border-neutral-700
    `,
    secondary: `
      bg-white/10 backdrop-blur-md text-neutral-800 
      border border-white/20 hover:border-white/40
      shadow-md active:shadow-lg
    `,
    accent: `
      bg-gradient-to-r from-blue-600 to-blue-700 text-white
      shadow-lg active:shadow-xl
      border border-blue-500
    `
  };

  const sizes = {
    sm: 'px-4 py-3 text-sm min-h-[44px]', // Apple's minimum touch target
    md: 'px-6 py-4 text-base min-h-[48px]',
    lg: 'px-8 py-5 text-lg min-h-[52px]'
  };

  return (
    <motion.button
      className={`
        relative inline-flex items-center justify-center gap-3 font-medium 
        rounded-xl backdrop-blur-md transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 overflow-hidden active:scale-95
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      style={{ 
        willChange: 'transform',
        WebkitTapHighlightColor: 'transparent' // Remove iOS highlight
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isPressed ? 0.95 : 1
      }}
      transition={{ duration: 0.1 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      {...props}
    >
      {children}
      
      {/* Mobile-optimized shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                      opacity-0 active:opacity-100 -skew-x-12 pointer-events-none" />
    </motion.button>
  );
};

// Mobile-optimized Input with large touch targets
export const MobileGlassInput = ({ 
  label, 
  error, 
  icon,
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 z-10">
            {icon}
          </div>
        )}
        
        <input
          className={`
            w-full px-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 
            rounded-xl text-neutral-900 placeholder-transparent focus:outline-none 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            transition-all duration-300 ease-out min-h-[52px]
            ${icon ? 'pl-12' : 'pl-4'}
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
          `}
          style={{ 
            fontSize: '16px', // Prevents iOS zoom on focus
            WebkitAppearance: 'none'
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(e.target.value.length > 0);
          }}
          {...props}
        />
        
        <motion.label
          className={`
            absolute left-4 pointer-events-none transition-all duration-300 ease-out
            ${icon ? 'left-12' : 'left-4'}
            ${error ? 'text-red-400' : 'text-neutral-500'}
          `}
          animate={{
            y: isFocused || hasValue ? -32 : 20,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: isFocused ? '#3b82f6' : error ? '#f87171' : '#737373'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {label}
        </motion.label>
      </div>
      
      {error && (
        <motion.p
          className="text-red-400 text-sm mt-2 ml-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Mobile-optimized Card with proper touch interactions
export const MobileGlassCard = ({ 
  children, 
  className = '',
  onTap,
  interactive = false
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      className={`
        relative backdrop-blur-md bg-white/10 border border-white/20 
        rounded-2xl p-6 shadow-sm
        ${interactive ? 'cursor-pointer active:scale-98' : ''}
        ${className}
      `}
      style={{ 
        willChange: 'transform',
        WebkitTapHighlightColor: 'transparent'
      }}
      whileTap={interactive ? { scale: 0.98 } : {}}
      animate={{
        scale: isPressed ? 0.98 : 1
      }}
      transition={{ duration: 0.1 }}
      onTouchStart={() => interactive && setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => interactive && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTap={onTap}
    >
      {children}
    </motion.div>
  );
};

// Mobile Navigation with safe areas
export const MobileNavigation = ({ 
  children, 
  className = '' 
}) => {
  return (
    <nav className={`
      sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20
      px-4 py-3 safe-area-inset-top
      ${className}
    `}>
      {children}
    </nav>
  );
};

// Mobile-optimized bottom action bar
export const MobileActionBar = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-50 
      bg-white/90 backdrop-blur-lg border-t border-white/20
      px-4 py-4 safe-area-inset-bottom
      ${className}
    `}>
      {children}
    </div>
  );
};

// Hook for detecting mobile devices
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};

// Hook for safe area insets
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)')) || 0,
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)')) || 0,
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    
    return () => window.removeEventListener('resize', updateInsets);
  }, []);

  return insets;
};

export default {
  MobileGlassButton,
  MobileGlassInput,
  MobileGlassCard,
  MobileNavigation,
  MobileActionBar,
  useIsMobile,
  useSafeAreaInsets
};