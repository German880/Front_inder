/**
 * Input de texto reutilizable
 */

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

export interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: FieldError | string;  // Ahora acepta string también
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
  // Obtener el mensaje de error
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        {...registration}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className || ''}`}
        {...inputProps}
      />

      {errorMessage && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
};

export const InputField = InputText;
export default InputText;
