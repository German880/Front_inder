/**
 * Form Section - container para secciones
 */

import React from 'react';

export interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`space-y-5 p-6 bg-white rounded-lg border border-gray-200 ${className || ''}`}>
      {children}
    </div>
  );
};
