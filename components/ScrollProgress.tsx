import React, { useState, useEffect, useRef } from 'react';

interface ScrollProgressProps {
  contentRef: React.RefObject<HTMLDivElement>;
  theme: 'light' | 'dark';
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ contentRef, theme }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      // Calculate scroll percentage
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      setScrollProgress(progress);
      setIsVisible(maxScroll > 50); // Show only if content is scrollable
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();

      // Recheck when content changes
      const observer = new ResizeObserver(handleScroll);
      observer.observe(element);

      return () => {
        element.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      };
    }
  }, [contentRef]);

  if (!isVisible) return null;

  const isDark = theme === 'dark';

  return (
    <div
      className="fixed right-0 top-0 bottom-0 w-1 z-50 pointer-events-none"
      style={{
        right: '18px',
        top: '80px',
        bottom: '80px',
      }}
    >
      {/* Background track */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
          isDark
            ? 'bg-white/10'
            : 'bg-black/5'
        }`}
        style={{ width: '3px' }}
      />

      {/* Progress indicator */}
      <div
        className={`absolute top-0 left-0 rounded-full transition-all duration-150 ${
          isDark
            ? 'bg-gradient-to-b from-[#00E8FF] to-[#0052CC] shadow-[0_0_12px_rgba(0,232,255,0.5)]'
            : 'bg-gradient-to-b from-[#0052CC] to-[#1A8CFF] shadow-[0_0_8px_rgba(0,82,204,0.3)]'
        }`}
        style={{
          width: '3px',
          height: `${scrollProgress}%`,
          transition: 'height 0.15s ease-out',
        }}
      />

      {/* Indicator dot at current position */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 rounded-full transition-all duration-150 ${
          isDark
            ? 'bg-[#00E8FF] shadow-[0_0_16px_rgba(0,232,255,0.6)]'
            : 'bg-[#0052CC] shadow-[0_0_12px_rgba(0,82,204,0.4)]'
        }`}
        style={{
          width: '6px',
          height: '6px',
          top: `${scrollProgress}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
};
