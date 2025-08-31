'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

// 🔮 Premium Glassmorphism Components for Luxury UI

// Glass Card Component - Ultra Premium
export const GlassCard = ({ 
  children, 
  className = '',
  variant = 'default',
  hover = true,
  blur = 'md',
  ...props 
}) => {
  const variants = {
    default: `
      bg-white/10 backdrop-blur-${blur} border border-white/20 
      shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
    `,
    premium: `
      bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-${blur}
      border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
      before:absolute before:inset-0 before:rounded-2xl before:p-[1px] 
      before:bg-gradient-to-br before:from-white/40 before:to-white/10
      before:mask-composite before:-z-10
    `,
    dark: `
      bg-black/20 backdrop-blur-${blur} border border-white/10
      shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
    `,
    subtle: `
      bg-white/5 backdrop-blur-sm border border-white/10
      shadow-[0_4px_16px_0_rgba(31,38,135,0.2)]
    `
  };

  return (
    <motion.div
      className={`
        relative rounded-2xl p-6 md:p-8 overflow-hidden
        ${variants[variant]} ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { 
        scale: 1.02, 
        boxShadow: '0 12px 40px 0 rgba(31,38,135,0.5)',
        transition: { duration: 0.2 }
      } : {}}
      {...props}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50 rounded-2xl" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

// Glass Button - Premium Interactive with Magnetic Effects
export const GlassButton = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '',
  magnetic = false,
  magneticStrength = 0.3,
  ...props 
}) => {
  const ref = useRef(null);
  const [magneticPosition, setMagneticPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current || !magnetic) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * magneticStrength;
    const deltaY = (e.clientY - centerY) * magneticStrength;
    
    setMagneticPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    if (magnetic) {
      setMagneticPosition({ x: 0, y: 0 });
    }
  };

  const variants = {
    primary: `
      bg-white/20 hover:bg-white/30 text-neutral-800 
      border border-white/30 hover:border-white/50
      shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
      hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.5)]
    `,
    secondary: `
      bg-black/10 hover:bg-black/20 text-neutral-700 hover:text-neutral-900
      border border-white/20 hover:border-white/40
      shadow-[0_4px_16px_0_rgba(0,0,0,0.1)]
      hover:shadow-[0_8px_24px_0_rgba(0,0,0,0.2)]
    `,
    accent: `
      bg-gradient-to-r from-white/25 to-white/15 hover:from-white/35 hover:to-white/25
      text-neutral-800 border border-white/40 hover:border-white/60
      shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
    `
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      ref={ref}
      className={`
        relative inline-flex items-center justify-center gap-2 font-medium 
        rounded-xl backdrop-blur-md transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2
        disabled:opacity-50 overflow-hidden group cursor-pointer
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      style={{ willChange: 'transform' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      animate={magnetic ? { 
        x: magneticPosition.x, 
        y: magneticPosition.y 
      } : {}}
      transition={magnetic ? {
        type: 'spring',
        stiffness: 400,
        damping: 40
      } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                      opacity-0 group-hover:opacity-100 -skew-x-12 group-hover:animate-shine" />
      
      {/* Glass reflection */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Glass Progress Bar - Ultra Premium
export const GlassProgressBar = ({ 
  progress = 0, 
  className = '',
  color = 'neutral',
  showGlow = true,
  animated = true
}) => {
  const colorVariants = {
    neutral: 'from-neutral-600 to-neutral-800',
    accent: 'from-slate-600 to-slate-800',
    success: 'from-emerald-600 to-emerald-800'
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Glass container */}
      <div className="relative h-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20 
                      shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] overflow-hidden">
        
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full" />
        
        {/* Progress fill with glass effect */}
        <motion.div
          className={`
            relative h-full bg-gradient-to-r ${colorVariants[color]} rounded-full
            shadow-[0_2px_8px_0_rgba(0,0,0,0.3)] overflow-hidden
          `}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: animated ? 1.2 : 0, 
            ease: [0.22, 1, 0.36, 1] 
          }}
        >
          {/* Glass highlight on progress */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
          
          {/* Moving shine effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
                            w-1/4 animate-pulse opacity-60" />
          )}
        </motion.div>

        {/* Glass reflection on container */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full" />
      </div>

      {/* Outer glow effect */}
      {showGlow && (
        <div className="absolute inset-0 bg-white/20 rounded-full blur-sm -z-10 opacity-50" />
      )}
    </div>
  );
};

// Glass Info Panel - Premium Display
export const GlassInfoPanel = ({ 
  title, 
  value, 
  icon, 
  description,
  className = '',
  variant = 'default'
}) => {
  return (
    <GlassCard variant="premium" className={`group ${className}`}>
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 
                          backdrop-blur-sm rounded-xl flex items-center justify-center
                          border border-white/20 group-hover:border-white/40 transition-all duration-300">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-neutral-900 transition-colors">
          {title}
        </h3>
        
        {value && (
          <div className="text-2xl font-bold text-neutral-900">
            {value}
          </div>
        )}
        
        {description && (
          <p className="text-sm text-neutral-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl border border-white/40 opacity-0 group-hover:opacity-100"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(255,255,255,0.4)',
            '0 0 20px 2px rgba(255,255,255,0.2)',
            '0 0 0 0 rgba(255,255,255,0.4)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </GlassCard>
  );
};

// Glass Container - Background Element
export const GlassContainer = ({ 
  children, 
  className = '',
  background = 'default'
}) => {
  const backgrounds = {
    default: 'bg-gradient-to-br from-neutral-100/50 via-white/30 to-neutral-200/50',
    dark: 'bg-gradient-to-br from-neutral-800/20 via-neutral-900/10 to-neutral-800/20',
    subtle: 'bg-white/5'
  };

  return (
    <div className={`
      relative ${backgrounds[background]} backdrop-blur-2xl 
      border border-white/10 rounded-3xl overflow-hidden
      ${className}
    `}>
      {/* Ambient lighting effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 p-6 md:p-8">
        {children}
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" />
      </div>
    </div>
  );
};

export default {
  GlassCard,
  GlassButton,
  GlassProgressBar,
  GlassInfoPanel,
  GlassContainer
};