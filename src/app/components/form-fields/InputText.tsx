/**
 * Input de texto reutilizable
 */

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { FormFieldWrapper } from './FormFieldWrapper';

export interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: FieldError;
  helperText?: string;
  registration?: UseFormRegisterReturn;
}

export const InputText: React.FC<InputTextProps> = ({
  label,
  required,
  error,
  helperText,
  registration,
  className,
  ...inputProps
}) => {
  const baseClasses = `
    w-full px-4 py-2 border rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-1
    transition-colors duration-200
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
  `;

  return (
    <FormFieldWrapper label={label} required={required} error={error} helperText={helperText}>
      <input
        className={`${baseClasses} ${className || ''}`}
        {...inputProps}
        {...registration}
      />
    </FormFieldWrapper>
  );
};
