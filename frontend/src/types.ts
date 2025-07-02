import { ReactNode } from "react";

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export interface User {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  publishedAt?: string;
  readTime: number;
  clapCount: number;
  responseCount: number;
  bookmarkCount: number;
  isClapped: boolean;
  isBookmarked: boolean;
  tags: string[];
  imageUrl?: string;
  author: User;
}

export interface BlogProps {
  post: Post;
  showAuthorInfo?: boolean;
  showEngagementStats?: boolean;
  clapCount?: number;
  responseCount?: number;
  onClap?: (postId: string) => Promise<void>;
  onBookmark?: (postId: string) => Promise<void>;
  onShare?: (postId: string) => Promise<void>;
}


// Action button configuration for Header 
export interface ActionButton {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  ariaLabel?: string;
}

// Icon button configuration for Header 
export interface IconButton {
  id: string;
  icon: ReactNode;
  onClick: () => void;
  ariaLabel: string;
  variant?: 'default' | 'danger';
  className?: string;
}

// Logo configuration for Header 
export interface LogoConfig {
  variant?: 'text' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
  className?: string;
}

// Header configuration for Header 
export interface HeaderConfig {
  // Layout
  sticky?: boolean;
  shadow?: boolean;
  border?: boolean;
  spacing?: 'compact' | 'normal' | 'spacious';

  // Logo
  logo?: LogoConfig;

  // User
  showAvatar?: boolean;
  avatarSize?: number;
  avatarClickPath?: string;
  userName?: string;

  // Authentication
  showSignOut?: boolean;
  signOutRedirect?: string;

  // Auto-features (smart defaults based on context)
  autoEditButton?: boolean;
  autoWriteButton?: boolean;

  // Custom buttons
  actionButtons?: ActionButton[];
  iconButtons?: IconButton[];

  // Custom content
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  centerContent?: ReactNode;

  // Callbacks
  onUserFetch?: (user: any) => void;
  onSignOut?: () => void;
}


export interface AvatarProps {
  /** Display name for fallback initials */
  name: string;
  /** Avatar image URL */
  avatarUrl?: string | null;
  /** Size of the avatar in pixels */
  size?: number;
  /** Custom CSS classes */
  className?: string;
  /** Alt text for the image */
  alt?: string;
  /** Callback when image fails to load */
  onImageError?: () => void;
  /** Callback when image loads successfully */
  onImageLoad?: () => void;
  /** Shape of the avatar */
  shape?: 'circle' | 'square' | 'rounded';
  /** Border configuration */
  border?: {
    width?: number;
    color?: string;
  };
  /** Loading placeholder */
  showLoadingSpinner?: boolean;
  /** Custom fallback component */
  fallbackComponent?: React.ReactNode;
}

export interface UpdateUserProfilePayload {
  displayName?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  username?: string;
}
