import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react'; // Changed Icon
import { COLORS } from '../../config/colors';

const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500); // Auto-dismiss after 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const styleVars = {
    '--primary': COLORS.primary,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 left-1/2 z-[9999] flex items-center gap-3 px-6 py-3 bg-white text-gray-900 rounded-full shadow-xl border border-gray-100 min-w-max"
          style={styleVars}
        >
          <div className="flex items-center justify-center">
            <ShoppingCart size={18} className="text-[var(--primary)]" strokeWidth={2.5} />
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
