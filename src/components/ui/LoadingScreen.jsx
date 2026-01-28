import { useState, useEffect } from 'react';

/**
 * Loading screen shown while 3D assets initialize
 * Includes orientation hint for mobile users
 */
export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showOrientationHint, setShowOrientationHint] = useState(false);

  useEffect(() => {
    // Check if device is mobile and in portrait mode
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setShowOrientationHint(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Fade out after reaching 100%
          setTimeout(() => {
            setVisible(false);
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={`loading-screen ${progress >= 100 ? 'fade-out' : ''}`}>
      <div className="loading-content">
        <div className="loading-gear">
          <svg viewBox="0 0 100 100" className="gear-svg" aria-hidden="true">
            <path
              d="M50 10 L55 20 L65 15 L60 25 L70 30 L60 35 L65 45 L55 40 L50 50 L45 40 L35 45 L40 35 L30 30 L40 25 L35 15 L45 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="50" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <h2 className="loading-title">Da Vinci Workshop</h2>

        {showOrientationHint && (
          <p className="loading-text" style={{ marginBottom: '1rem', color: '#c9a227' }}>
            📱 For best experience, rotate to landscape mode
          </p>
        )}

        <div className="loading-bar" role="progressbar" aria-valuenow={Math.min(100, progress)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="loading-fill"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>

        <p className="loading-text">
          {progress < 30 && 'Preparing workshop...'}
          {progress >= 30 && progress < 60 && 'Lighting candles...'}
          {progress >= 60 && progress < 90 && 'Winding gears...'}
          {progress >= 90 && 'Ready'}
        </p>
      </div>
    </div>
  );
}
