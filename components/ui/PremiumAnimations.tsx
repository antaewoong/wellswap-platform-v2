'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';

// 🎯 60fps.design inspired premium animation system

// Premium easing curves (60fps.design style)
export const easings = {
  smooth: "easeInOut",
  gentle: "easeOut", 
  bounce: "backOut",
  sharp: "easeInOut",
  elastic: "circOut"
};

// Smooth Button with 60fps-style interactions
export const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: {
      idle: { 
        background: 'linear-gradient(135deg, #171717 0%, #262626 100%)',
        scale: 1,
        y: 0,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      },
      hover: { 
        background: 'linear-gradient(135deg, #262626 0%, #171717 100%)',
        scale: 1.02,
        y: -2,
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
      },
      press: { 
        scale: 0.98,
        y: 0,
        transition: { duration: 0.1 }
      }
    },
    secondary: {
      idle: { 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        scale: 1,
        y: 0
      },
      hover: { 
        background: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        scale: 1.02,
        y: -2
      },
      press: { scale: 0.98, y: 0 }
    }
  };

  return (
    <motion.button
      className={`relative overflow-hidden rounded-2xl px-8 py-4 font-medium text-white cursor-pointer border-0 ${className}`}
      style={{ willChange: 'transform' }}
      initial="idle"
      animate={isPressed ? 'press' : isHovered ? 'hover' : 'idle'}
      variants={variants[variant]}
      transition={{ 
        type: 'tween',
        ease: easings.smooth,
        duration: 0.2
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
        }}
        animate={isHovered ? { 
          opacity: [0, 1, 0],
          x: [-100, 100] 
        } : {}}
        transition={{ duration: 0.6, ease: easings.smooth }}
      />
    </motion.button>
  );
};

// Smooth Card with advanced hover effects
export const PremiumCard = ({ 
  children, 
  className = '',
  glow = false,
  tilt = false,
  ...props 
}) => {
  const ref = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !tilt) return;
    
    const rect = (ref.current as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    
    setMousePosition({ x: x * 20, y: y * -20 });
  };

  return (
    <motion.div
      ref={ref}
      className={`relative backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 ${className}`}
      style={{ 
        willChange: 'transform',
        perspective: 1000
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotateX: tilt ? mousePosition.y * 0.1 : 0,
        rotateY: tilt ? mousePosition.x * 0.1 : 0,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.4, ease: easings.smooth },
        y: { duration: 0.4, ease: easings.smooth }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      {...props}
    >
      {children}
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.1) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: easings.smooth }}
        />
      )}
    </motion.div>
  );
};

// Smooth Page Transitions
export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{
        type: 'tween',
        ease: easings.smooth,
        duration: 0.4
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

// Advanced Scroll Reveal
export const SmoothReveal = ({ 
  children, 
  direction = 'up',
  delay = 0,
  className = '' 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directions = {
    up: { y: 60 },
    down: { y: -60 },
    left: { x: 60 },
    right: { x: -60 }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ willChange: 'transform, opacity' }}
      initial={{ 
        opacity: 0, 
        ...directions[direction],
        scale: 0.95,
        filter: 'blur(10px)'
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0,
        scale: 1,
        filter: 'blur(0px)'
      } : {}}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: delay,
        opacity: { duration: 0.6, ease: easings.smooth },
        filter: { duration: 0.6, ease: easings.smooth }
      }}
    >
      {children}
    </motion.div>
  );
};

// Floating Action Button
export const FloatingButton = ({ 
  children, 
  onClick, 
  position = 'bottom-right',
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = document.documentElement.scrollTop;
      setIsVisible(scrolled > 300);
    };

    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const positions = {
    'bottom-right': 'fixed bottom-8 right-8',
    'bottom-left': 'fixed bottom-8 left-8',
    'top-right': 'fixed top-8 right-8',
    'top-left': 'fixed top-8 left-8'
  };

  return (
    <motion.button
      className={`${positions[position]} z-50 w-14 h-14 bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-full shadow-2xl flex items-center justify-center text-white ${className}`}
      style={{ willChange: 'transform' }}
      initial={{ scale: 0, rotate: 180 }}
      animate={{ 
        scale: isVisible ? 1 : 0,
        rotate: isVisible ? 0 : 180,
        y: isVisible ? 0 : 100
      }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

// Magnetic Button (follows mouse)
export const MagneticButton = ({ 
  children, 
  strength = 0.3,
  className = '',
  onClick,
  ...props 
}) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = (ref.current as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={`relative cursor-pointer ${className}`}
      style={{ willChange: 'transform' }}
      animate={{ x: position.x, y: position.y }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 40
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Smooth Input with focus animations
export const PremiumInput = ({ 
  label, 
  error, 
  className = '',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative"
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <input
          className={`w-full px-6 py-4 bg-neutral-50/50 backdrop-blur-md border border-neutral-200 rounded-2xl text-neutral-900 placeholder-transparent focus:outline-none focus:border-neutral-400 transition-all duration-300 ease-out ${error ? 'border-red-400' : ''}`}
          style={{ willChange: 'border-color' }}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(e.target.value.length > 0);
          }}
          {...props}
        />
        
        <motion.label
          className={`absolute left-6 pointer-events-none transition-all duration-300 ease-out ${error ? 'text-red-400' : 'text-neutral-500'}`}
          animate={{
            y: isFocused || hasValue ? -30 : 16,
            scale: isFocused || hasValue ? 0.85 : 1,
            color: isFocused ? '#525252' : error ? '#f87171' : '#737373'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {label}
        </motion.label>
        
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-neutral-600 to-neutral-800"
          initial={{ width: '0%' }}
          animate={{ width: isFocused ? '100%' : '0%' }}
          transition={{ duration: 0.3, ease: easings.smooth }}
        />
      </motion.div>
      
      {error && (
        <motion.p
          className="text-red-400 text-sm mt-2 ml-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: easings.smooth }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default {
  PremiumButton,
  PremiumCard,
  PageTransition,
  SmoothReveal,
  FloatingButton,
  MagneticButton,
  PremiumInput,
  easings
};