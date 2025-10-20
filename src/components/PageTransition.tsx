import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../utils/animations';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
