import React from 'react';

export default function Badge({
  children,
  variant = "default", // 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'purple' | 'outline'
  size = "md", // 'sm' | 'md'
  className = ""
}) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    brand: "bg-teal-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-teal-200 dark:border-brand-800/40",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40",
    outline: "border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
  }[variant] || variantStyles.default;

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-xs font-medium rounded-md",
    md: "px-2.5 py-0.5 text-xs font-semibold rounded-full"
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 leading-none ${variantStyles} ${sizeStyles} ${className}`}>
      {children}
    </span>
  );
}
