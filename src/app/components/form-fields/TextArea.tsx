import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: FieldError | string;
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
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

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

export const TextAreaField = TextArea;
export default TextArea;
