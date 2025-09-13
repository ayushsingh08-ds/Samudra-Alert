import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-12 text-center ${className}`}>
      {Icon && <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;