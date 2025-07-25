import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import * as Icons from "../Icons";
import mediumText from '../assets/mediumText.png';
import medium from '../assets/medium.png';
import { supabase } from "../supabaseClient";
import { UserAvatar } from "./Avatar";
import { ActionButton, HeaderConfig, IconButton, } from "../types";
import { api } from "../api";

// Shared sign-out function
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error.message);
};


export function Header({
  // Layout defaults
  sticky = false,
  shadow = false,
  border = false,
  spacing = 'normal', // Compact , normal , spacious

  // Logo defaults
  logo = { variant: 'icon', size: 'md', linkTo: '/blogs' },

  // User defaults
  showAvatar = true,
  avatarSize = 40,
  avatarClickPath,

  // Auth defaults
  showSignOut = true,
  signOutRedirect = '/signin',

  // Auto-features
  autoEditButton = false,
  autoWriteButton = false,

  // Custom content
  actionButtons = [],
  iconButtons = [],
  leftContent,
  rightContent,
  centerContent,

  // Callbacks
  onUserFetch,
  onSignOut
}: HeaderConfig = {}): JSX.Element {

  const navigate = useNavigate();
  const { id: postId } = useParams();
  const [name, setName] = useState<string>("User");
  const [avatar, setAvatar] = useState<string>("");
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

          const result = await api.getMe();
          setName(result.username);
          setAvatar(result.avatar);
          onUserFetch?.(result);


        if (autoEditButton && postId) {
          const data = await api.canEditPost(Number(postId));
          setCanEdit(Boolean(data));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setCanEdit(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [postId, name, autoEditButton, onUserFetch]);

  const handleSignOut = async () => {
    await signOut();
    onSignOut?.();
    navigate(signOutRedirect);
  };

  // Style configurations
  const spacingMap = {
    compact: 'space-x-2',
    normal: 'space-x-4',
    spacious: 'space-x-6'
  };

  const logoSizeMap = {
    sm: 'h-6',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-12'
  };

  const buttonVariants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300'
  };

  const iconVariants = {
    default: 'text-gray-600 hover:text-black focus:ring-gray-300',
    danger: 'text-gray-600 hover:text-red-500 focus:ring-red-300'
  };

  // Auto-generated buttons
  const autoButtons: ActionButton[] = [];

  if (autoWriteButton) {
    autoButtons.push({
      id: 'write',
      label: 'Write',
      icon: <Icons.PlusIcon size={18} />,
      onClick: () => navigate('/publish'),
      variant: 'secondary',
      ariaLabel: 'Write a new post'
    });
  }

  if (autoEditButton && postId && canEdit && !isLoading) {
    autoButtons.push({
      id: 'edit',
      label: 'Edit',
      icon: <Icons.PencilIcon size={18} />,
      onClick: () => navigate(`/edit/${postId}`),
      variant: 'secondary',
      ariaLabel: 'Edit this post'
    });
  }

  const allActionButtons = [...autoButtons, ...actionButtons];

  // Auto-generated icon buttons
  const autoIconButtons: IconButton[] = [];

  if (showSignOut) {
    autoIconButtons.push({
      id: 'signout',
      icon: <Icons.SignOutIcon size={20} />,
      onClick: handleSignOut,
      ariaLabel: 'Sign out',
      variant: 'danger'
    });
  }

  const allIconButtons = [...iconButtons, ...autoIconButtons];

  return (
    <div className={`
      flex justify-between items-center bg-white p-4
      ${sticky ? 'sticky top-0 z-50' : ''}
      ${shadow ? 'shadow-sm' : ''}
      ${border ? 'border-b border-gray-200' : ''}
    `}>

      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        {logo && (
          <Link to={logo.linkTo || '/blogs'}>
            <img
              className={`
                cursor-pointer transition-transform duration-200 hover:scale-105
                ${logoSizeMap[logo.size || 'md']}
                ${logo.className || ''}
              `}
              alt="Medium Logo"
              src={logo.variant === 'text' ? mediumText : medium}
            />
          </Link>
        )}

        {leftContent}
      </div>

      {/* Center Section */}
      {centerContent && (
        <div className="flex-1 flex justify-center">
          {centerContent}
        </div>
      )}

      {/* Right Section */}
      <div className={`flex items-center ${spacingMap[spacing]}`}>
        {/* Action Buttons */}
        {allActionButtons.map((button) => (
          <button
            key={button.id}
            onClick={button.onClick}
            disabled={button.disabled || button.loading}
            className={`
              flex items-center text-sm font-medium rounded-full px-4 py-2
              focus:outline-none focus:ring-2 transition duration-200
              disabled:opacity-60 disabled:cursor-not-allowed
              ${buttonVariants[button.variant || 'secondary']}
              ${button.className || ''}
            `}
            aria-label={button.ariaLabel || button.label}
          >
            {button.loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
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
                {button.loadingText || 'Loading...'}
              </span>
            ) : (
              <>
                {button.icon && <span className="mr-2">{button.icon}</span>}
                {button.label}
              </>
            )}
          </button>
        ))}

        {/* Icon Buttons */}
        {allIconButtons.map((button) => (
          <button
            key={button.id}
            onClick={button.onClick}
            className={`
              p-2 rounded-full focus:outline-none focus:ring-2 transition duration-200
              ${iconVariants[button.variant || 'default']}
              ${button.className || ''}
            `}
            aria-label={button.ariaLabel}
          >
            {button.icon}
          </button>
        ))}

        {/* Avatar */}
        {showAvatar && (
          <button
            onClick={() => navigate(
              avatarClickPath ||'/profile'
            )}
            className="focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full transition duration-200 hover:scale-105"
            aria-label={`View profile of ${name}`}
          >
            <UserAvatar
              user={{
                name: name,
                avatarUrl: avatar
              }}
              size={avatarSize}
            />
          </button>
        )}

        {rightContent}
      </div>
    </div>
  );
}

// Preset configurations for common use cases
export const HeaderPresets = {
  // Publishing page header
  publish: (props: {
    userName?: string;
    onPublish: () => Promise<void>;
    isPublishing?: boolean;
    showNotifications?: boolean;
    showOptions?: boolean;
  }): HeaderConfig => ({
    logo: { variant: 'text', size: 'sm' },
    spacing: 'compact',
    userName: props.userName,
    avatarSize: 38,
    avatarClickPath: '/profile',
    actionButtons: [{
      id: 'publish',
      label: 'Publish',
      onClick: props.onPublish,
      variant: 'success',
      loading: props.isPublishing,
      loadingText: 'Publishing...',
      ariaLabel: 'Publish post'
    }],
    iconButtons: [
      ...(props.showOptions !== false ? [{
        id: 'options',
        icon: <Icons.Options size={20} />,
        onClick: () => { },
        ariaLabel: 'Options'
      }] : []),
      ...(props.showNotifications !== false ? [{
        id: 'notifications',
        icon: <Icons.Bell size={20} />,
        onClick: () => { },
        ariaLabel: 'Notifications'
      }] : [])
    ]
  }),

  // Blog/reading page header
  blog: (): HeaderConfig => ({
    sticky: true,
    shadow: true,
    border: true,
    logo: { variant: 'icon', size: 'md' },
    spacing: 'spacious',
    autoWriteButton: true,
    autoEditButton: true,
    avatarSize: 40
  }),

  // Minimal header
  minimal: (props: { showLogo?: boolean } = {}): HeaderConfig => ({
    spacing: 'normal',
    logo: props.showLogo !== false ? { variant: 'icon', size: 'sm' } : undefined,
    showAvatar: true,
    avatarSize: 36,
    actionButtons: [],
    iconButtons: []
  }),

  // Dashboard header
  dashboard: (props: {
    title?: string;
    actions?: ActionButton[];
  } = {}): HeaderConfig => ({
    sticky: true,
    border: true,
    spacing: 'normal',
    centerContent: props.title ? (
      <h1 className="text-xl font-semibold text-gray-900">{props.title}</h1>
    ) : undefined,
    actionButtons: props.actions || [],
    autoWriteButton: true
  })
};
