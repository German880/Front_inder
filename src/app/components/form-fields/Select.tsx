/**
 * Select reutilizable
 */

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { FormFieldWrapper } from './FormFieldWrapper';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  required,
  options,
  registration,
  error,
  disabled = false,
  placeholder,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        {...registration}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'
        } ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">{placeholder || 'Seleccione...'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-sm">{error.message}</span>}
    </div>
  );
};
