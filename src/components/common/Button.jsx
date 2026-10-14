import React from 'react';

export default function Button({
  children,
  type = "button",
  variant = "primary", // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = "md", // 'sm' | 'md' | 'lg' | 'icon'
  disabled = false,
  loading = false,
  icon: Icon = null,
  onClick = null,
  className = "",
  title = ""
}) {
  const baseClasses = "relative inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none rounded-xl";

  const variantClasses = {
    primary: "bg-brand-700 hover:bg-brand-800 text-white shadow-sm hover:shadow focus:ring-brand-500 dark:focus:ring-offset-bg-dark",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus:ring-slate-400",
    outline: "border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 focus:ring-slate-400",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-slate-400",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500",
    tealLight: "bg-teal-50 hover:bg-teal-100 text-brand-800 dark:bg-brand-950/40 dark:hover:bg-brand-950/70 dark:text-teal-300"
  }[variant] || "";

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
    icon: "p-2 text-sm rounded-lg"
  }[size] || "px-4 py-2 text-sm gap-2";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />
      ) : null}
      {children}
    </button>
  );
}
