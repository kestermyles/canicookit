interface NoPhotoPlaceholderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// Hand-drawn style camera SVG component
function StylizedCamera({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-90"
    >
      {/* Camera body - rounded rectangle with hand-drawn feel */}
      <path
        d="M12 22C12 19.7909 13.7909 18 16 18H48C50.2091 18 52 19.7909 52 22V46C52 48.2091 50.2091 50 48 50H16C13.7909 50 12 48.2091 12 46V22Z"
        fill="#FFF5F0"
        stroke="#E85D26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Camera lens - outer circle */}
      <circle
        cx="32"
        cy="34"
        r="10"
        fill="#FFE8DC"
        stroke="#E85D26"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Camera lens - inner circle */}
      <circle
        cx="32"
        cy="34"
        r="6"
        fill="#E85D26"
        opacity="0.3"
      />

      {/* Viewfinder on top - trapezoid shape */}
      <path
        d="M24 18C24 18 26 14 28 14H36C38 14 40 18 40 18"
        stroke="#E85D26"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FFF5F0"
      />

      {/* Flash - small circle top right */}
      <circle
        cx="46"
        cy="24"
        r="2.5"
        fill="#FFD93D"
        stroke="#E85D26"
        strokeWidth="1.5"
      />

      {/* Shutter button - small detail */}
      <circle
        cx="18"
        cy="24"
        r="1.5"
        fill="#E85D26"
      />

      {/* Lens highlight - adds dimension */}
      <circle
        cx="35"
        cy="31"
        r="2"
        fill="white"
        opacity="0.6"
      />
    </svg>
  );
}

export default function NoPhotoPlaceholder({ size = 'medium', className = '' }: NoPhotoPlaceholderProps) {
  // Fixed heights to match recipe card image areas
  const sizeClasses = {
    small: 'h-48',     // 192px - matches recipe card images
    medium: 'h-64',    // 256px - for medium contexts
    large: 'h-96',     // 384px - for hero images
  };

  const logoSizes = {
    small: { height: '60px', width: 'auto' },
    medium: { height: '100px', width: 'auto' },
    large: { height: '120px', width: 'auto' },
  };

  const cameraSizes = {
    small: 40,
    medium: 56,
    large: 72,
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl',
  };

  const subtextSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  const paddingSizes = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const spacingSizes = {
    small: 'mb-2',
    medium: 'mb-3',
    large: 'mb-4',
  };

  return (
    <div
      className={`w-full ${sizeClasses[size]} bg-[#fafaf8] flex flex-col items-center justify-center ${paddingSizes[size]} text-center ${className}`}
    >
      {/* Can I Cook It Logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-color.svg"
        alt="Can I Cook It"
        style={logoSizes[size]}
        className={`${spacingSizes[size]} mix-blend-darken`}
      />

      {/* Stylized Camera Illustration */}
      <div className={`${spacingSizes[size]}`}>
        <StylizedCamera size={cameraSizes[size]} />
      </div>

      {/* Main message */}
      <p className={`${textSizes[size]} font-semibold text-gray-800 mb-1`}>
        Can't wait to see what you cook!
      </p>

      {/* Subtext */}
      <p className={`${subtextSizes[size]} text-gray-600 leading-tight`}>
        Cook this and be the first to share your photo
      </p>
    </div>
  );
}
