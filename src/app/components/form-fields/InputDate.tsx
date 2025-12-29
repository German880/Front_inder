/**
 * Input de fecha reutilizable
 */

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { FormFieldWrapper } from './FormFieldWrapper';

export interface InputDateProps {
  label: string;
  required?: boolean;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
  maxDate?: Date;
  minDate?: Date;
}

export const InputDate: React.FC<InputDateProps> = ({
  label,
  required,
  error,
  registration,
  maxDate,
  minDate,
}) => {
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <FormFieldWrapper label={label} required={required} error={error}>
      <input
        type="date"
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-1
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
        `}
        max={maxDate ? formatDate(maxDate) : undefined}
        min={minDate ? formatDate(minDate) : undefined}
        {...registration}
      />
    </FormFieldWrapper>
  );
};
