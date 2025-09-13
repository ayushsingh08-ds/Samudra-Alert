import React from 'react';
import { Waves } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex items-center space-x-2">
        <Waves className={`${sizeClasses[size]} text-ocean-600 animate-pulse`} />
        <div className={`${sizeClasses[size]} border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin`}></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;