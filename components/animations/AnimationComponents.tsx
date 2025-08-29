import React from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// Framer Motion 안전장치 - 클라이언트 사이드에서만 체크
const isMotionAvailable = typeof window !== 'undefined' && typeof motion !== 'undefined';

// Hydration 안전장치 - 클라이언트에서만 애니메이션 활성화
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
};

// 🎭 Advanced Page Transition Container
export const PageTransitionContainer = ({ 
  children, 
  currentPage,
  className = ""
}: {
  children: React.ReactNode;
  currentPage: string;
  className?: string;
}) => {
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ 
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
          staggerChildren: 0.1
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// 🎨 Smooth Page Transition
export const SmoothPageTransition = ({ 
  children, 
  isVisible,
  className = ""
}: {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}) => {
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className} style={{ display: isVisible ? 'block' : 'none' }}>
        {children}
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 🎯 Morphing Page Transition
export const MorphingPageTransition = ({ 
  children, 
  isVisible,
  direction = 'right',
  className = ""
}: {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}) => {
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className} style={{ display: isVisible ? 'block' : 'none' }}>
        {children}
      </div>
    );
  }
  
  const getDirectionalProps = () => {
    switch (direction) {
      case 'left':
        return { x: -100, y: 0 };
      case 'right':
        return { x: 100, y: 0 };
      case 'up':
        return { x: 0, y: -100 };
      case 'down':
        return { x: 0, y: 100 };
      default:
        return { x: 100, y: 0 };
    }
  };
  
  const { x, y } = getDirectionalProps();
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x, y, rotateY: direction === 'left' || direction === 'right' ? 15 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0, rotateY: 0 }}
          exit={{ opacity: 0, x: -x, y: -y, rotateY: direction === 'left' || direction === 'right' ? -15 : 0 }}
          transition={{ 
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 🎭 Fade Scale Transition
export const FadeScaleTransition = ({ 
  children, 
  isVisible,
  className = ""
}: {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}) => {
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className} style={{ display: isVisible ? 'block' : 'none' }}>
        {children}
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -30 }}
          transition={{ 
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 🎨 Staggered Page Content
export const StaggeredPageContent = ({ 
  children, 
  isVisible,
  staggerDelay = 0.1,
  className = ""
}: {
  children: React.ReactNode;
  isVisible: boolean;
  staggerDelay?: number;
  className?: string;
}) => {
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className} style={{ display: isVisible ? 'block' : 'none' }}>
        {children}
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.3,
            staggerChildren: staggerDelay
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 🎯 Stagger Item for Page Content
export const StaggerItem = ({ 
  children, 
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

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
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
  
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
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
  
  const isInView = useInView(ref, { 
    amount: threshold, 
    once: true,
    margin: "-50px 0px -50px 0px"
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
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
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    
    if (currentIndex < text.length) {
      setIsTyping(true);
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      if (repeat) {
        const timeout = setTimeout(() => {
          setDisplayText('');
          setCurrentIndex(0);
        }, pauseAfterComplete);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentIndex, text, speed, repeat, pauseAfterComplete, isClient]);

  if (!isClient) {
    return (
      <span className={className}>
        {text}
      </span>
    );
  }

  return (
    <span className={className}>
      {displayText}
      {isTyping && <span className="animate-pulse">|</span>}
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
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
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
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        style={style}
        tabIndex={0}
      >
        {children}
      </button>
    );
  }
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
      style={style}
      tabIndex={0}
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
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  
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

// 🎨 Stagger Container
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1,
  className = ""
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) => {
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 🎯 Animated Counter
export const AnimatedCounter = ({ 
  value, 
  suffix = "", 
  duration = 2,
  className = ""
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) => {
  const [count, setCount] = useState(0);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    
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
  }, [value, duration, isClient]);

  if (!isClient) {
    return (
      <span className={className}>
        {value}{suffix}
      </span>
    );
  }

  return (
    <span className={className}>
      {count}{suffix}
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
      className={className}
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
    <div className={`bg-gradient-to-br ${className}`}>
      {children}
    </div>
  );
};

// 🎯 Smooth Header Component
export const SmoothHeader = ({ 
  children, 
  className = "",
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const isClient = useIsClient();
  
  if (!isMotionAvailable || !isClient) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 🌀 Loading Spinner Component
export const LoadingSpinner = ({ 
  size = "md",
  className = ""
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const isClient = useIsClient();
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };
  
  if (!isClient) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"></div>
      </div>
    );
  }
  
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      className={`${sizeClasses[size]} ${className}`}
    >
      <div className="w-full h-full rounded-full border-2 border-zinc-300 border-t-zinc-600"></div>
    </motion.div>
  );
};
