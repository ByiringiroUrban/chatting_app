import React from 'react';

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = null,
  icon: Icon = null,
  rightElement = null,
  required = false,
  disabled = false,
  id,
  name,
  className = "",
  autoFocus = false
}) {
  const inputId = id || name || `input_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`w-full rounded-xl bg-slate-50 dark:bg-slate-900 border ${
            error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-500'
          } ${Icon ? 'pl-9' : 'pl-3.5'} ${rightElement ? 'pr-10' : 'pr-3.5'} py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50`}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center text-slate-400 dark:text-slate-500">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
    </div>
  );
}
