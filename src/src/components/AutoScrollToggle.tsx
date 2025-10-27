import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import './AutoScrollToggle.css';

interface AutoScrollToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const AutoScrollToggle: React.FC<AutoScrollToggleProps> = ({ isEnabled, onToggle }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: number;

    const handleScroll = () => {
      setIsScrolling(true);
      setIsVisible(true);
      
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        setIsScrolling(false);
        setTimeout(() => {
          if (!isScrolling) {
            setIsVisible(false);
          }
        }, 2000);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isScrolling]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="auto-scroll-toggle"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            className={`scroll-toggle-btn ${isEnabled ? 'enabled' : 'disabled'}`}
            onClick={() => onToggle(!isEnabled)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isEnabled ? 'Desactivar scroll automático del sidebar' : 'Activar scroll automático del sidebar'}
          >
            {isEnabled ? <Eye size={20} /> : <EyeOff size={20} />}
          </motion.button>
          <motion.div 
            className="scroll-toggle-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {isEnabled ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AutoScrollToggle;
