interface ButtonProps {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    // Added optional props for better flexibility
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    className?: string;
    ariaLabel?: string;
  }
  
  export function Button({
    label,
    onClick,
    icon,
    type = 'button',
    disabled = false,
    className = '',
    ariaLabel,
  }: ButtonProps): JSX.Element {
    return (
      <button
        onClick={onClick}
        type={type}
        disabled={disabled}
        aria-label={ariaLabel || label}
        className={`w-full py-2.5 px-2 text-sm font-medium text-white bg-black rounded-lg 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-700'} 
          focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300 
          ${className}`}
      >
        <span className="flex items-center justify-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </span>
      </button>
    );
  }