import React from 'react';

export default function Avatar({
  src,
  alt = "User",
  size = "md", // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status = null, // 'online' | 'offline' | null
  hasStatusRing = false,
  hasUnseenStatus = false,
  onClick = null,
  className = ""
}) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl"
  }[size] || "w-10 h-10 text-sm";

  const statusDotSizes = {
    xs: "w-1.5 h-1.5 bottom-0 right-0 border",
    sm: "w-2 h-2 bottom-0 right-0 border",
    md: "w-2.5 h-2.5 bottom-0.5 right-0.5 border-2",
    lg: "w-3.5 h-3.5 bottom-0.5 right-0.5 border-2",
    xl: "w-4 h-4 bottom-1 right-1 border-2",
    "2xl": "w-5 h-5 bottom-1 right-1 border-2"
  }[size] || "w-2.5 h-2.5 bottom-0.5 right-0.5 border-2";

  const initials = alt
    ? alt.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const ringClass = hasStatusRing
    ? hasUnseenStatus
      ? "p-0.5 ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-bg-dark"
      : "p-0.5 ring-2 ring-slate-300 dark:ring-slate-700 ring-offset-2 ring-offset-white dark:ring-offset-bg-dark"
    : "";

  return (
    <div
      onClick={onClick}
      className={`relative inline-block flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className={`${sizeClasses} ${ringClass} rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-medium text-slate-700 dark:text-slate-200 shadow-sm transition-transform active:scale-95`}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute rounded-full border-white dark:border-surface-dark ${statusDotSizes} ${
            status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
          title={status === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
