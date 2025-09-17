/**
 * SharePoll component
 * @file Main component for poll sharing functionality
 */

import React, { useState } from 'react';
import ShareButton from './ShareButton';
import ShareModal from './ShareModal';

interface SharePollProps {
  /**
   * ID of the poll to share
   */
  pollId: string;
  /**
   * Title of the poll
   */
  pollTitle: string;
  /**
   * Custom button text
   */
  buttonText?: string;
  /**
   * Additional CSS classes for the button
   */
  className?: string;
}

/**
 * Component that combines share button and modal for poll sharing functionality
 */
export function SharePoll({ 
  pollId, 
  pollTitle,
  buttonText = 'Share Poll',
  className = ''
}: SharePollProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openShareModal = () => {
    setIsModalOpen(true);
  };

  const closeShareModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <ShareButton
        onShareClick={openShareModal}
        className={className}
      >
        {buttonText}
      </ShareButton>
      
      <ShareModal
        isOpen={isModalOpen}
        onClose={closeShareModal}
        pollId={pollId}
        pollTitle={pollTitle}
      />
    </>
  );
}

export default SharePoll;