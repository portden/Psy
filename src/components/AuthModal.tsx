import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Chrome } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (error) {
      // Error handled in AuthContext but we can catch it here if needed
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />
            
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h3>
              <p className="text-slate-500 font-medium small">Join the PsycheAcademy community today.</p>
            </div>

            <div className="space-y-4 text-center">
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-indigo-100 py-4 rounded-2xl font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
              >
                <Chrome className="w-5 h-5 text-indigo-600" />
                Continue with Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              By continuing, you agree to our <span className="text-indigo-600 font-bold hover:underline cursor-pointer">Terms of Service</span> and <span className="text-indigo-600 font-bold hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
