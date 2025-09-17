/**
 * ShareButton component
 * @file Button component that triggers sharing functionality
 */

import React, { ButtonHTMLAttributes } from 'react';

interface ShareButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /**
   * Callback function when button is clicked
   */
  onShareClick: () => void;
  /**
   * Icon to display in button
   */
  icon?: React.ReactNode;
  /**
   * Size variant of the button
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A customizable button component that triggers sharing functionality
 */
export function ShareButton({ 
  onShareClick, 
  icon, 
  size = 'md', 
  children = 'Share', 
  className = '',
  ...props 
}: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={onShareClick}
      className={`share-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${className}`}
      {...props}
    >
      {icon && <span className="share-button-icon mr-2">{icon}</span>}
      {children}
    </button>
  );
}

export default ShareButton;