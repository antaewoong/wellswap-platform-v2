'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

// 🎨 Dynamic Typography Components inspired by imweb.me mobile design

// Hook for client-side rendering
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
};

// Enhanced Typewriter with multiple dynamic effects
export const DynamicTypewriter = ({ 
  texts, 
  speed = 80,
  deleteSpeed = 50,
  delayBetweenTexts = 2000,
  className = "",
  gradient = false,
  scale = false,
  blur = false
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isClient = useIsClient();

  const textArray = Array.isArray(texts) ? texts : [texts];

  useEffect(() => {
    if (!isClient || textArray.length === 0) return;

    const currentText = textArray[currentTextIndex];
    
    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, delayBetweenTexts);
      return () => clearTimeout(pauseTimeout);
    }

    if (!isDeleting && displayText === currentText) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText(currentText.slice(0, displayText.length - 1));
      } else {
        setDisplayText(currentText.slice(0, displayText.length + 1));
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex, isPaused, textArray, speed, deleteSpeed, delayBetweenTexts, isClient]);

  const gradientClass = gradient ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent' : '';
  const scaleClass = scale ? 'hover:scale-105 transition-transform duration-300' : '';
  const blurClass = blur ? 'text-shadow-lg' : '';

  if (!isClient) {
    return <span className={className}>{textArray[0]}</span>;
  }

  return (
    <motion.span
      className={`${className} ${gradientClass} ${scaleClass} ${blurClass} inline-block`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-0.5 h-6 bg-current ml-1 translate-y-1"
      />
    </motion.span>
  );
};

// Scroll-triggered Text Animation
export const ScrollRevealText = ({ 
  children, 
  className = "",
  delay = 0,
  direction = 'up',
  distance = 50,
  duration = 0.8,
  threshold = 0.1 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.3"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    direction === 'up' ? [distance, 0] : direction === 'down' ? [-distance, 0] : [0, 0]
  );
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'left' ? [distance, 0] : direction === 'right' ? [-distance, 0] : [0, 0]
  );

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, x }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Parallax Text Effect
export const ParallaxText = ({ 
  children, 
  className = "",
  speed = 0.5,
  direction = 'vertical' 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'vertical' ? [0, -50 * speed] : [0, 0]
  );
  
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'horizontal' ? [0, 50 * speed] : [0, 0]
  );

  return (
    <motion.div
      ref={ref}
      style={{ y, x }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Wave Text Animation
export const WaveText = ({ 
  text, 
  className = "",
  delay = 100,
  amplitude = 10,
  frequency = 2 
}) => {
  const isClient = useIsClient();
  
  if (!isClient) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ y: 0 }}
          animate={{
            y: [0, -amplitude, 0],
          }}
          transition={{
            duration: frequency,
            repeat: Infinity,
            delay: index * (delay / 1000),
            ease: "easeInOut"
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

// Morphing Text Effect
export const MorphingText = ({ 
  texts, 
  className = "",
  duration = 3000,
  morphDuration = 0.5 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isClient = useIsClient();
  
  const textArray = Array.isArray(texts) ? texts : [texts];

  useEffect(() => {
    if (!isClient || textArray.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % textArray.length);
    }, duration);

    return () => clearInterval(interval);
  }, [textArray.length, duration, isClient]);

  if (!isClient) {
    return <span className={className}>{textArray[0]}</span>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        initial={{ opacity: 0, rotateX: -90, scale: 0.8 }}
        animate={{ opacity: 1, rotateX: 0, scale: 1 }}
        exit={{ opacity: 0, rotateX: 90, scale: 0.8 }}
        transition={{ duration: morphDuration }}
        className={`${className} inline-block`}
      >
        {textArray[currentIndex]}
      </motion.span>
    </AnimatePresence>
  );
};

// Gradient Text with Dynamic Animation
export const GradientText = ({ 
  children, 
  className = "",
  animate = true,
  colors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981'],
  duration = 3 
}) => {
  const gradientColors = colors.join(', ');
  
  return (
    <motion.span
      className={`bg-gradient-to-r bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(45deg, ${gradientColors})`,
        backgroundSize: animate ? '300% 300%' : '100% 100%',
      }}
      animate={animate ? {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      } : {}}
      transition={{
        duration,
        ease: 'linear',
        repeat: Infinity
      }}
    >
      {children}
    </motion.span>
  );
};

// Split Text Animation
export const SplitTextAnimation = ({ 
  text, 
  className = "",
  animation = 'slideUp',
  stagger = 0.05,
  duration = 0.6 
}) => {
  const isClient = useIsClient();
  
  const animations = {
    slideUp: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 }
    },
    slideLeft: {
      initial: { x: -50, opacity: 0 },
      animate: { x: 0, opacity: 1 }
    },
    rotate: {
      initial: { rotateY: 90, opacity: 0 },
      animate: { rotateY: 0, opacity: 1 }
    },
    scale: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 }
    }
  };

  if (!isClient) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(' ');
  
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={`${wordIndex}-${charIndex}`}
              initial={animations[animation].initial}
              animate={animations[animation].animate}
              transition={{
                duration,
                delay: (wordIndex * word.length + charIndex) * stagger,
                ease: 'easeOut'
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && (
            <span className="inline-block w-2"></span>
          )}
        </span>
      ))}
    </span>
  );
};

// Mobile-optimized Hero Text
export const MobileHeroText = ({ 
  primaryText,
  secondaryText,
  className = "" 
}) => {
  const isClient = useIsClient();
  
  if (!isClient) {
    return (
      <div className={className}>
        <h1 className="text-3xl font-bold">{primaryText}</h1>
        {secondaryText && <p className="text-lg">{secondaryText}</p>}
      </div>
    );
  }

  return (
    <div className={`${className} text-center space-y-4`}>
      <motion.h1
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
      >
        <GradientText animate={true}>
          {primaryText}
        </GradientText>
      </motion.h1>
      
      {secondaryText && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto px-4"
        >
          <SplitTextAnimation 
            text={secondaryText}
            animation="slideUp"
            stagger={0.02}
          />
        </motion.div>
      )}
    </div>
  );
};

export default {
  DynamicTypewriter,
  ScrollRevealText,
  ParallaxText,
  WaveText,
  MorphingText,
  GradientText,
  SplitTextAnimation,
  MobileHeroText
};