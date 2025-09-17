/**
 * Social media integration helpers for sharing polls
 * @file Contains functions for sharing polls to various social media platforms
 */

import { generateShareLink } from './shareUtils';

/**
 * Share a poll to Twitter
 * @param pollId - The ID of the poll to share
 * @param pollTitle - The title of the poll
 */
export function shareToTwitter(pollId: string, pollTitle: string): void {
  const shareUrl = generateShareLink(pollId, { source: 'twitter', medium: 'social' });
  const text = `Check out this poll: ${pollTitle}`;
  const hashtags = 'polling,vote,opinion';
  
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(hashtags)}`;
  
  // Open Twitter share dialog in a new window
  window.open(twitterUrl, '_blank', 'width=550,height=420');
}

/**
 * Share a poll to Facebook
 * @param pollId - The ID of the poll to share
 * @param pollTitle - The title of the poll (not used by Facebook but kept for API consistency)
 */
export function shareToFacebook(pollId: string, _pollTitle: string): void {
  const shareUrl = generateShareLink(pollId, { source: 'facebook', medium: 'social' });
  
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  
  // Open Facebook share dialog in a new window
  window.open(facebookUrl, '_blank', 'width=550,height=420');
}

/**
 * Share a poll to LinkedIn
 * @param pollId - The ID of the poll to share
 * @param pollTitle - The title of the poll
 */
export function shareToLinkedIn(pollId: string, pollTitle: string): void {
  const shareUrl = generateShareLink(pollId, { source: 'linkedin', medium: 'social' });
  
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(pollTitle)}`;
  
  // Open LinkedIn share dialog in a new window
  window.open(linkedInUrl, '_blank', 'width=550,height=420');
}

/**
 * Share a poll to WhatsApp
 * @param pollId - The ID of the poll to share
 * @param pollTitle - The title of the poll
 */
export function shareToWhatsApp(pollId: string, pollTitle: string): void {
  const shareUrl = generateShareLink(pollId, { source: 'whatsapp', medium: 'social' });
  const text = `Check out this poll: ${pollTitle} ${shareUrl}`;
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  
  // Open WhatsApp share dialog in a new window or app
  window.open(whatsappUrl, '_blank');
}

/**
 * Share a poll to Telegram
 * @param pollId - The ID of the poll to share
 * @param pollTitle - The title of the poll
 */
export function shareToTelegram(pollId: string, pollTitle: string): void {
  const shareUrl = generateShareLink(pollId, { source: 'telegram', medium: 'social' });
  const text = `Check out this poll: ${pollTitle} ${shareUrl}`;
  
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  
  // Open Telegram share dialog in a new window
  window.open(telegramUrl, '_blank');
}