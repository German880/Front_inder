/**
 * TextArea reutilizable
 */

import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

import { FormFieldWrapper } from './FormFieldWrapper';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: FieldError;
  helperText?: string;
  registration?: UseFormRegisterReturn;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  required,
  error,
  helperText,
  registration,
  className,
  ...textareaProps
}) => {
  return (
    <FormFieldWrapper label={label} required={required} error={error} helperText={helperText}>
      <textarea
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-1
          transition-colors duration-200
          resize-vertical min-h-24
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          ${className || ''}
        `}
        {...textareaProps}
        {...registration}
      />
    </FormFieldWrapper>
  );
};
