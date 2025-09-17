/**
 * ShareModal component
 * @file Modal component for sharing poll options
 */

import React, { useState } from 'react';
import { copyToClipboard, shareViaEmail, isValidEmail } from '../../lib/shareUtils';
import { shareToTwitter, shareToFacebook, shareToLinkedIn, shareToWhatsApp } from '../../lib/socialMedia';

interface ShareModalProps {
  /**
   * Whether the modal is visible
   */
  isOpen: boolean;
  /**
   * Function to close the modal
   */
  onClose: () => void;
  /**
   * ID of the poll to share
   */
  pollId: string;
  /**
   * Title of the poll to share
   */
  pollTitle: string;
}

/**
 * Modal component for sharing polls via different platforms
 */
export function ShareModal({ isOpen, onClose, pollId, pollTitle }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Handle closing the modal with escape key and clicking outside
  React.useEffect(() => {
    // Only add event listeners if the modal is open
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      // Close modal if clicking on the overlay (outside the modal content)
      const target = e.target as HTMLElement;
      if (target.classList.contains('modal-overlay')) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    
    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto'; // Re-enable scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle link copy
  const handleCopyLink = async () => {
    // Get the current URL or construct a share URL
    const shareUrl = `${window.location.origin}/poll/${pollId}`;
    const success = await copyToClipboard(shareUrl);
    
    if (success) {
      setCopySuccess(true);
      // Reset success message after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Handle email sharing
  const handleEmailShare = async () => {
    if (!email) {
      setEmailError('Please enter an email address');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    await shareViaEmail(email, pollId, pollTitle);
    onClose(); // Close modal after sending email
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 modal-overlay">
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Share this Poll</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Copy Link Section */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Share Link</h4>
          <div className="flex">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/poll/${pollId}`}
              className="flex-grow border border-gray-300 rounded-l px-3 py-2 text-sm bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors text-sm"
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Email Share Section */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Share via Email</h4>
          <div className="flex flex-col">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="border border-gray-300 rounded px-3 py-2 text-sm mb-2"
            />
            {emailError && (
              <p className="text-red-500 text-xs mb-2">{emailError}</p>
            )}
            <button
              onClick={handleEmailShare}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
            >
              Send Email
            </button>
          </div>
        </div>

        {/* Social Media Sharing */}
        <div>
          <h4 className="text-sm font-medium mb-2">Share on Social Media</h4>
          <div className="flex space-x-3">
            <button
              onClick={() => shareToTwitter(pollId, pollTitle)}
              className="bg-[#1DA1F2] text-white p-2 rounded-full hover:bg-opacity-80 transition-colors"
              aria-label="Share on Twitter"
            >
              Twitter
            </button>
            <button
              onClick={() => shareToFacebook(pollId, pollTitle)}
              className="bg-[#4267B2] text-white p-2 rounded-full hover:bg-opacity-80 transition-colors"
              aria-label="Share on Facebook"
            >
              Facebook
            </button>
            <button
              onClick={() => shareToLinkedIn(pollId, pollTitle)}
              className="bg-[#0077B5] text-white p-2 rounded-full hover:bg-opacity-80 transition-colors"
              aria-label="Share on LinkedIn"
            >
              LinkedIn
            </button>
            <button
              onClick={() => shareToWhatsApp(pollId, pollTitle)}
              className="bg-[#25D366] text-white p-2 rounded-full hover:bg-opacity-80 transition-colors"
              aria-label="Share on WhatsApp"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;