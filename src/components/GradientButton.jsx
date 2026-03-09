import React from 'react'

export default function GradientButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'primary', // 'primary' | 'danger' | 'success' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  loading = false,
}) {
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-5 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]',
  }

  const gradients = {
    primary: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
    danger:  'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    success: 'linear-gradient(135deg, #14F195 0%, #059669 100%)',
    ghost:   'transparent',
  }

  const borders = {
    primary: 'transparent',
    danger:  'transparent',
    success: 'transparent',
    ghost:   'rgba(153,69,255,0.45)',
  }

  const glows = {
    primary: '0 4px 20px rgba(153,69,255,0.35)',
    danger:  '0 4px 20px rgba(239,68,68,0.35)',
    success: '0 4px 20px rgba(20,241,149,0.35)',
    ghost:   'none',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        relative flex items-center justify-center gap-2 rounded-xl font-semibold
        active:scale-95 transition-all duration-200 overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{
        background: gradients[variant],
        border: `1px solid ${borders[variant]}`,
        boxShadow: disabled ? 'none' : glows[variant],
        color: variant === 'ghost' ? '#a78bfa' : '#fff',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Ripple overlay */}
      <span
        className="absolute inset-0 rounded-xl opacity-0 active:opacity-20 transition-opacity duration-150"
        style={{ background: 'white' }}
      />

      {loading ? (
        <>
          <span
            className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
