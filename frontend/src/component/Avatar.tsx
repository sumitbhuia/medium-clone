import { useState, useEffect, useCallback } from 'react';
import { AvatarProps } from "../types";

export default function Avatar({
  name,
  avatarUrl,
  size = 40,
  className = '',
  alt,
  onImageError,
  onImageLoad,
  shape = 'circle',
  border,
  showLoadingSpinner = false,
  fallbackComponent
}: AvatarProps): JSX.Element {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!avatarUrl);
  const [retryCount, setRetryCount] = useState(0);

  // Default fallback image
  const defaultFallbackImage = '/default-avatar.png';

  // Preload image to improve consistency
  const preloadImage = useCallback((url: string) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
      setIsLoading(false);
      onImageLoad?.();
    };
    img.onerror = () => {
      if (retryCount < 3) {
        setTimeout(() => setRetryCount(prev => prev + 1), 1000); // Retry after 1 second
      } else {
        setImageLoaded(false);
        setImageError(true);
        setIsLoading(false);
        onImageError?.();
      }
    };
  }, [onImageLoad, onImageError, retryCount]);

  // Reset states and preload when avatarUrl changes
  useEffect(() => {
    if (avatarUrl) {
      setImageLoaded(false);
      setImageError(false);
      setIsLoading(true);
      setRetryCount(0);
      preloadImage(avatarUrl);
    } else {
      setImageLoaded(false);
      setImageError(false);
      setIsLoading(false);
    }
  }, [avatarUrl, preloadImage]);

  // Handle retry on error
  useEffect(() => {
    if (retryCount > 0 && retryCount < 3 && avatarUrl) {
      preloadImage(avatarUrl);
    }
  }, [retryCount, avatarUrl, preloadImage]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setIsLoading(false);
    onImageLoad?.();
  };

  const handleImageError = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
    } else {
      setImageLoaded(false);
      setImageError(true);
      setIsLoading(false);
      onImageError?.();
    }
  };

  // Generate initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent background color based on name
  const getBackgroundColor = (name: string): string => {
    if (!name) return '#6b7280'; // gray-500
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Shape classes
  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg'
  };

  // Font size based on avatar size
  const getFontSize = (size: number): string => {
    if (size <= 24) return 'text-xs';
    if (size <= 32) return 'text-sm';
    if (size <= 48) return 'text-base';
    if (size <= 64) return 'text-lg';
    return 'text-xl';
  };

  // Border styles
  const borderStyles = border ? {
    borderWidth: `${border.width || 2}px`,
    borderColor: border.color || '#e5e7eb',
    borderStyle: 'solid'
  } : {};

  const initials = getInitials(name);
  const backgroundColor = getBackgroundColor(name);
  const effectiveAvatarUrl = avatarUrl && !imageError ? avatarUrl : defaultFallbackImage;
  const shouldShowImage = !!avatarUrl;
  const shouldShowFallback = !avatarUrl || imageError || !imageLoaded;

  return (
    <div
      className={`
        relative inline-flex items-center justify-center overflow-hidden
        ${shapeClasses[shape]}
        ${className}
      `}
      style={{
        width: size,
        height: size,
        backgroundColor: shouldShowFallback && !isLoading ? backgroundColor : 'transparent',
        ...borderStyles
      }}
      role="img"
      aria-label={alt || `Avatar for ${name}`}
    >
      {/* Image Avatar */}
      {shouldShowImage && (
        <img
          src={effectiveAvatarUrl}
          alt={alt || `${name}'s avatar`}
          className={`
            w-full h-full object-cover
            ${shapeClasses[shape]}
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-200
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Loading Spinner */}
      {isLoading && showLoadingSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg
            className="animate-spin h-5 w-5 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
      )}

      {/* Fallback Content */}
      {shouldShowFallback && !isLoading && (
        <>
          {fallbackComponent || (
            <span
              className={`
                font-semibold text-white select-none
                ${getFontSize(size)}
              `}
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              {initials}
            </span>
          )}
        </>
      )}
    </div>
  );
}

// Convenience wrapper for common use cases
export function UserAvatar({
  user,
  size = 40,
  ...props
}: {
  user: {
    name?: string;
    username?: string;
    avatarUrl?: string | null;
    displayName?: string;
  };
  size?: number;
} & Omit<AvatarProps, 'name' | 'avatarUrl'>) {
  const displayName = user.displayName || user.name || user.username || 'Unknown User';
  return (
    <Avatar
      name={displayName}
      avatarUrl={user.avatarUrl}
      size={size}
      {...props}
    />
  );
}

// Avatar with status indicator
export function StatusAvatar({
  status,
  statusColor = '#22c55e',
  statusSize = 12,
  ...avatarProps
}: AvatarProps & {
  status?: 'online' | 'offline' | 'away' | 'busy';
  statusColor?: string;
  statusSize?: number;
}) {
  const statusColors = {
    online: '#22c55e', // green-500
    offline: '#6b7280', // gray-500
    away: '#f59e0b', // amber-500
    busy: '#ef4444' // red-500
  };

  return (
    <div className="relative inline-block">
      <Avatar {...avatarProps} />
      {status && (
        <div
          className="absolute bottom-0 right-0 rounded-full border-2 border-white"
          style={{
            width: statusSize,
            height: statusSize,
            backgroundColor: statusColors[status] || statusColor,
            transform: 'translate(25%, 25%)'
          }}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

// Avatar group for showing multiple users
export function AvatarGroup({
  users,
  maxVisible = 3,
  size = 32,
  overlap = 8,
  showCount = true,
  ...avatarProps
}: {
  users: Array<{
    name?: string;
    username?: string;
    avatarUrl?: string | null;
    displayName?: string;
  }>;
  maxVisible?: number;
  size?: number;
  overlap?: number;
  showCount?: boolean;
} & Omit<AvatarProps, 'name' | 'avatarUrl' | 'size'>) {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <div className="flex items-center">
      {visibleUsers.map((user, index) => (
        <div
          key={user.username || user.name || index}
          className="relative"
          style={{
            marginLeft: index > 0 ? -overlap : 0,
            zIndex: visibleUsers.length - index
          }}
        >
          <UserAvatar
            user={user}
            size={size}
            border={{ width: 2, color: '#ffffff' }}
            {...avatarProps}
          />
        </div>
      ))}
      {remainingCount > 0 && showCount && (
        <div
          className="relative flex items-center justify-center bg-gray-100 border-2 border-white rounded-full text-gray-600 font-sans font-medium text-xs"
          style={{
            width: size,
            height: size,
            marginLeft: -overlap,
            zIndex: 0
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}