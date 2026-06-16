import { toast as hotToast } from 'react-hot-toast';
import { CheckCircle, AlertTriangle, XCircle, Trophy } from 'lucide-react';

const defaultOptions = {
  style: {
    background: 'rgba(15, 23, 42, 0.9)', // slate-900 with opacity
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  className: 'glass',
};

export const toast = {
  success: (message) => {
    hotToast.success(message, {
      ...defaultOptions,
      icon: <CheckCircle className="text-emerald-400" size={20} />,
      style: {
        ...defaultOptions.style,
        border: '1px solid rgba(52, 211, 153, 0.3)', // emerald border
      },
    });
  },
  
  error: (message) => {
    hotToast.error(message, {
      ...defaultOptions,
      icon: <XCircle className="text-red-400" size={20} />,
      style: {
        ...defaultOptions.style,
        border: '1px solid rgba(248, 113, 113, 0.3)', // red border
      },
    });
  },
  
  warning: (message) => {
    hotToast(message, {
      ...defaultOptions,
      icon: <AlertTriangle className="text-amber-400" size={20} />,
      style: {
        ...defaultOptions.style,
        border: '1px solid rgba(251, 191, 36, 0.3)', // amber border
      },
    });
  },
  
  achievement: (title, points) => {
    hotToast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/20 backdrop-blur-xl`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Trophy className="text-yellow-300" size={24} />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white uppercase tracking-wider">
                  Achievement Unlocked!
                </p>
                <p className="mt-1 text-sm text-white/90">
                  {title}
                </p>
                {points && (
                  <p className="mt-1 text-xs font-medium text-yellow-300">
                    +{points} Wellness Points
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
      { duration: 4000 }
    );
  },
  
  info: (message) => {
    hotToast(message, defaultOptions);
  }
};
