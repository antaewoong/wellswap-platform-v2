'use client';

import React from 'react';
import { motion } from 'framer-motion';

// 🎨 Awwwards-inspired Premium Design System
// Sophisticated monotone palette with strategic accent colors

export const designSystem = {
  // Core monotone palette - sophisticated neutrals
  colors: {
    // Primary neutrals (tone-on-tone foundation)
    neutral: {
      50: '#fafafa',   // Pure white backgrounds
      100: '#f5f5f5',  // Light backgrounds
      200: '#e5e5e5',  // Subtle borders
      300: '#d4d4d4',  // Light borders
      400: '#a3a3a3',  // Muted text
      500: '#737373',  // Secondary text
      600: '#525252',  // Primary text
      700: '#404040',  // Dark text
      800: '#262626',  // Headers
      900: '#171717',  // Deep black
    },
    
    // Warm neutrals for sophistication
    stone: {
      50: '#fafaf9',
      100: '#f5f5f4', 
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
    },

    // Strategic accent color - single sophisticated hue
    accent: {
      primary: '#1e293b',    // Sophisticated slate
      secondary: '#0f172a',  // Deep slate
      muted: '#e2e8f0',     // Light slate for subtle highlights  
      subtle: '#f8fafc',    // Very light slate for backgrounds
    },

    // Success/status colors - minimal palette
    status: {
      success: '#059669',   // Emerald green
      warning: '#d97706',   // Amber
      error: '#dc2626',     // Red
      info: '#2563eb',      // Same as accent primary
    }
  },

  // Typography scale - refined hierarchy
  typography: {
    display: {
      xl: 'text-6xl md:text-7xl lg:text-8xl font-light tracking-tight',
      lg: 'text-4xl md:text-5xl lg:text-6xl font-light tracking-tight',
      md: 'text-3xl md:text-4xl lg:text-5xl font-light tracking-tight',
      sm: 'text-2xl md:text-3xl font-light tracking-tight',
    },
    heading: {
      xl: 'text-3xl md:text-4xl font-medium tracking-tight',
      lg: 'text-2xl md:text-3xl font-medium tracking-tight',
      md: 'text-xl md:text-2xl font-medium tracking-tight',
      sm: 'text-lg md:text-xl font-medium tracking-tight',
    },
    body: {
      lg: 'text-lg leading-relaxed',
      md: 'text-base leading-relaxed',
      sm: 'text-sm leading-relaxed',
    },
    caption: 'text-xs uppercase tracking-wide font-medium',
  },

  // Spacing system - refined scale
  spacing: {
    section: 'py-24 md:py-32',
    container: 'px-6 md:px-8 lg:px-12',
    content: 'space-y-8 md:space-y-12',
    component: 'space-y-4 md:space-y-6',
  },

  // Premium animations - smooth and sophisticated
  animations: {
    // Subtle entrance animations
    fadeIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    },
    
    // Sophisticated hover effects
    hover: {
      scale: { scale: 1.02, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
      lift: { y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
      glow: { 
        boxShadow: '0 10px 40px rgba(37, 99, 235, 0.1)',
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
      }
    },

    // Stagger animations for content reveal
    stagger: {
      container: {
        animate: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
          }
        }
      },
      item: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }
    }
  }
};

// Premium Button Component - minimal and sophisticated
export const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const variants = {
    primary: `
      bg-neutral-900 hover:bg-neutral-800 text-neutral-50
      border border-neutral-900 hover:border-neutral-800
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-transparent hover:bg-neutral-50 text-neutral-900 
      border border-neutral-300 hover:border-neutral-400
      shadow-sm hover:shadow-md
    `,
    ghost: `
      bg-transparent hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900
      border-transparent hover:border-neutral-200
    `,
    accent: `
      bg-accent-primary hover:bg-accent-secondary text-neutral-50
      border border-accent-primary hover:border-accent-secondary
      shadow-sm hover:shadow-md
    `
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-200 ease-out focus:outline-none focus:ring-2 
        focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-50
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      whileHover={designSystem.animations.hover.scale}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Premium Card Component - sophisticated glass effect
export const PremiumCard = ({ 
  children, 
  className = '',
  hover = true,
  ...props 
}) => {
  return (
    <motion.div
      className={`
        bg-neutral-50/50 backdrop-blur-xl border border-neutral-200/50
        rounded-2xl p-6 md:p-8 shadow-sm
        ${className}
      `}
      initial={designSystem.animations.fadeIn.initial}
      animate={designSystem.animations.fadeIn.animate}
      transition={designSystem.animations.fadeIn.transition}
      whileHover={hover ? designSystem.animations.hover.lift : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Premium Section Container
export const PremiumSection = ({ children, className = '', ...props }) => {
  return (
    <motion.section
      className={`${designSystem.spacing.section} ${className}`}
      variants={designSystem.animations.stagger.container}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      {...props}
    >
      <div className={`max-w-7xl mx-auto ${designSystem.spacing.container}`}>
        {children}
      </div>
    </motion.section>
  );
};

// Premium Typography Components
export const Display = ({ children, size = 'lg', className = '', ...props }) => {
  return (
    <motion.h1 
      className={`${designSystem.typography.display[size]} text-neutral-900 ${className}`}
      variants={designSystem.animations.stagger.item}
      {...props}
    >
      {children}
    </motion.h1>
  );
};

export const Heading = ({ children, size = 'lg', className = '', as = 'h2', ...props }) => {
  const Component = motion[as];
  return (
    <Component
      className={`${designSystem.typography.heading[size]} text-neutral-800 ${className}`}
      variants={designSystem.animations.stagger.item}
      {...props}
    >
      {children}
    </Component>
  );
};

export const Body = ({ children, size = 'md', className = '', ...props }) => {
  return (
    <motion.p
      className={`${designSystem.typography.body[size]} text-neutral-600 ${className}`}
      variants={designSystem.animations.stagger.item}
      {...props}
    >
      {children}
    </motion.p>
  );
};

export const Caption = ({ children, className = '', ...props }) => {
  return (
    <motion.span
      className={`${designSystem.typography.caption} text-neutral-500 ${className}`}
      variants={designSystem.animations.stagger.item}
      {...props}
    >
      {children}
    </motion.span>
  );
};

// Sophisticated Gradient Text (subtle)
export const PremiumGradientText = ({ children, className = '', ...props }) => {
  return (
    <span
      className={`
        bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900
        bg-clip-text text-transparent ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

export default {
  designSystem,
  PremiumButton,
  PremiumCard,
  PremiumSection,
  Display,
  Heading,
  Body,
  Caption,
  PremiumGradientText
};