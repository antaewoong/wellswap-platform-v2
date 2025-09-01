'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// Advanced cursor following effect
export const MagneticWrapper: React.FC<{
  children: React.ReactNode;
  strength?: number;
  className?: string;
}> = ({ children, strength = 0.3, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// Floating cards with parallax effect
export const FloatingCard: React.FC<{
  children: React.ReactNode;
  index?: number;
  className?: string;
}> = ({ children, index = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const springConfig = { damping: 25, stiffness: 100 };
  
  // Parallax effect based on mouse position and card index
  const parallaxX = useTransform(
    useMotionValue(mousePosition.x),
    [0, window.innerWidth || 1920],
    [-10 - index * 2, 10 + index * 2]
  );
  
  const parallaxY = useTransform(
    useMotionValue(mousePosition.y),
    [0, window.innerHeight || 1080],
    [-5 - index, 5 + index]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        x: useSpring(parallaxX, springConfig),
        y: useSpring(parallaxY, springConfig),
      }}
      initial={{ opacity: 0, scale: 0.8, y: 60 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        scale: 1.02,
        rotateY: 5,
        rotateX: 5,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

// Premium hover reveal animation
export const HoverReveal: React.FC<{
  children: React.ReactNode;
  revealContent: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}> = ({ children, revealContent, direction = 'up', className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const revealVariants = {
    up: { y: '100%' },
    down: { y: '-100%' },
    left: { x: '100%' },
    right: { x: '-100%' }
  };

  const revealAnimation = {
    up: { y: 0 },
    down: { y: 0 },
    left: { x: 0 },
    right: { x: 0 }
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{ 
          scale: isHovered ? 1.1 : 1,
          filter: isHovered ? 'blur(2px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
      
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm flex items-center justify-center"
        initial={revealVariants[direction]}
        animate={isHovered ? revealAnimation[direction] : revealVariants[direction]}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {revealContent}
      </motion.div>
    </div>
  );
};

// Staggered text animation
export const StaggeredText: React.FC<{
  text: string;
  className?: string;
  delay?: number;
}> = ({ text, className = '', delay = 0 }) => {
  const letters = text.split('');

  return (
    <motion.div className={`inline-block ${className}`}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.02,
            ease: [0.22, 1, 0.36, 1]
          }}
          whileHover={{
            y: -4,
            color: '#0891b2',
            transition: { duration: 0.2 }
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Morphing button with state changes
export const MorphingButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  success?: boolean;
  className?: string;
}> = ({ children, onClick, loading = false, success = false, className = '' }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick?.();
    setTimeout(() => setIsClicked(false), 600);
  };

  const getButtonState = () => {
    if (success) return 'success';
    if (loading) return 'loading';
    if (isClicked) return 'clicked';
    return 'default';
  };

  const buttonVariants = {
    default: {
      scale: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    clicked: {
      scale: 0.95,
      backgroundColor: 'rgba(14, 165, 233, 0.2)',
      borderColor: 'rgba(14, 165, 233, 0.4)'
    },
    loading: {
      scale: 1,
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      borderColor: 'rgba(245, 158, 11, 0.4)'
    },
    success: {
      scale: 1,
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: 'rgba(16, 185, 129, 0.4)'
    }
  };

  return (
    <motion.button
      className={`
        relative px-6 py-3 rounded-xl border backdrop-blur-md font-medium
        transition-colors duration-300 overflow-hidden ${className}
      `}
      variants={buttonVariants}
      animate={getButtonState()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={loading}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Loading...</span>
          </motion.div>
        ) : success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
            >
              ✓
            </motion.div>
            <span>Success!</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Liquid progress indicator
export const LiquidProgress: React.FC<{
  progress: number;
  className?: string;
  color?: string;
}> = ({ progress, className = '', color = '#0891b2' }) => {
  return (
    <div className={`relative w-full h-8 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden border border-white/20 ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}40 0%, ${color} 50%, ${color}40 100%)`
        }}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Liquid wave effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            background: `radial-gradient(ellipse at center, ${color}60 0%, transparent 70%)`
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </motion.div>
      
      {/* Glass highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent rounded-full pointer-events-none" />
    </div>
  );
};

// Particle system for background
export const ParticleField: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 20, className = '' }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
};

// Interactive rating system
export const InteractiveRating: React.FC<{
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}> = ({ rating, maxRating = 5, interactive = false, onRatingChange, className = '' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isActive = starRating <= (hoverRating || rating);
        
        return (
          <motion.button
            key={index}
            className={`
              w-6 h-6 ${interactive ? 'cursor-pointer' : 'cursor-default'}
              ${isActive ? 'text-yellow-400' : 'text-gray-400'}
            `}
            whileHover={interactive ? { scale: 1.2 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            onMouseEnter={() => interactive && setHoverRating(starRating)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive}
          >
            <motion.svg
              fill="currentColor"
              viewBox="0 0 20 20"
              className="w-full h-full"
              animate={{
                filter: isActive ? 'drop-shadow(0 0 4px currentColor)' : 'none'
              }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </motion.svg>
          </motion.button>
        );
      })}
    </div>
  );
};

export default {
  MagneticWrapper,
  FloatingCard,
  HoverReveal,
  StaggeredText,
  MorphingButton,
  LiquidProgress,
  ParticleField,
  InteractiveRating
};