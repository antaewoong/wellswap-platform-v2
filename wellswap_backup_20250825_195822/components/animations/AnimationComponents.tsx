import React from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// 🎯 Simple Parallax Effect
export const ParallaxSection = ({ 
  children, 
  speed = 0.5, 
  className = "" 
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);
  
  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 🎭 Clean Scroll Trigger Animation
export const ScrollTriggerAnimation = ({ 
  children, 
  threshold = 0.1, 
  delay = 0,
  duration = 0.6,
  className = ""
}: {
  children: React.ReactNode;
  threshold?: number;
  delay?: number;
  duration?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    amount: threshold, 
    once: true,
    margin: "-50px 0px -50px 0px"
  });
  
  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ✨ Simple Typewriter Effect
export const TypewriterText = ({ 
  text, 
  speed = 50, 
  delay = 0,
  className = "",
  repeat = true,
  pauseAfterComplete = 2000
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  repeat?: boolean;
  pauseAfterComplete?: number;
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setIsTyping(true);
    }, delay);
    
    return () => clearTimeout(initialDelay);
  }, [delay]);
  
  useEffect(() => {
    if (!isTyping) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (repeat) {
      const resetTimeout = setTimeout(() => {
        setDisplayText('');
        setCurrentIndex(0);
      }, pauseAfterComplete);
      
      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex, isTyping, text, speed, repeat, pauseAfterComplete]);
  
  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// 🎨 Fade In Animation
export const FadeInAnimation = ({ 
  children, 
  delay = 0,
  duration = 0.6,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 🎯 Animated Button
export const AnimatedButton = ({ 
  children, 
  onClick,
  className = "",
  disabled = false,
  style
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
      style={style}
    >
      {children}
    </motion.button>
  );
};

// 🎭 Animated Card
export const AnimatedCard = ({ 
  children, 
  className = "",
  hover = true,
  style
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// 🎪 Stagger Container
export const StaggerContainer = ({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 🎯 Stagger Item
export const StaggerItem = ({ 
  children, 
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 🎨 Smooth Header
export const SmoothHeader = ({ 
  children, 
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  
  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 🌟 Loading Spinner
export const LoadingSpinner = ({ 
  size = "md",
  className = ""
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-600 border-t-blue-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

// 📊 Animated Counter
export const AnimatedCounter = ({ 
  value, 
  duration = 2,
  className = "",
  suffix = ""
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);
  
  return (
    <span className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// 🎨 Animated Main Title
export const AnimatedMainTitle = ({ 
  children, 
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`text-4xl md:text-6xl font-bold gradient-text ${className}`}
    >
      {children}
    </motion.h1>
  );
};

// 🌊 Gradient Background
export const GradientBackground = ({ 
  children, 
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}>
      {children}
    </div>
  );
};
