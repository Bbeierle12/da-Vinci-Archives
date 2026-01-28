import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile devices and touch capabilities
 * @returns {Object} Device detection state
 * @returns {boolean} isMobile - Whether the device is mobile (screen width < 768px or mobile user agent)
 * @returns {boolean} isTouchDevice - Whether the device supports touch input
 */
export function useDeviceDetection() {
  // Initialize state with immediate browser check to avoid flash of incorrect settings
  const getInitialMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
  };

  const getInitialTouch = () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const [isMobile, setIsMobile] = useState(getInitialMobile);
  const [isTouchDevice, setIsTouchDevice] = useState(getInitialTouch);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTouchDevice };
}
