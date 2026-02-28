interface NoPhotoPlaceholderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function NoPhotoPlaceholder({ size = 'medium', className = '' }: NoPhotoPlaceholderProps) {
  const sizeClasses = {
    small: 'h-48',
    medium: 'h-64',
    large: 'h-96',
  };

  const logoSizes = {
    small: { height: '80px', width: 'auto' },
    medium: { height: '100px', width: 'auto' },
    large: { height: '120px', width: 'auto' },
  };

  const textSizes = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  };

  const subtextSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  return (
    <div
      className={`w-full ${sizeClasses[size]} bg-[#fafaf8] flex flex-col items-center justify-center p-6 text-center ${className}`}
    >
      {/* Can I Cook It Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-color.svg"
        alt="Can I Cook It"
        style={logoSizes[size]}
        className="mb-4 mix-blend-darken"
      />

      {/* Main message */}
      <p className={`${textSizes[size]} font-semibold text-gray-800 mb-2`}>
        Can't wait to see what you cook! 📸
      </p>

      {/* Subtext */}
      <p className={`${subtextSizes[size]} text-gray-600`}>
        Cook this and be the first to share your photo
      </p>
    </div>
  );
}
