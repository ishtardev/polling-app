/**
 * Utility functions for sharing polls
 * @file This file contains utilities for generating share links and sharing polls via various methods
 */

/**
 * Interface for share tracking parameters
 */
export interface ShareTrackingParams {
  source: string;
  medium: string;
  campaign?: string;
}

/**
 * Generates a shareable link for a poll
 * @param pollId - The ID of the poll to share
 * @param tracking - Optional tracking parameters for analytics
 * @returns A formatted URL for sharing
 */
export function generateShareLink(pollId: string, tracking?: ShareTrackingParams): string {
  // Get the base URL from environment or fallback to window location
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '');
  
  // Create the poll URL
  let shareUrl = `${baseUrl}/poll/${encodeURIComponent(pollId)}`;
  
  // Add tracking parameters if provided
  if (tracking) {
    const params = new URLSearchParams();
    params.append('utm_source', tracking.source);
    params.append('utm_medium', tracking.medium);
    if (tracking.campaign) params.append('utm_campaign', tracking.campaign);
    shareUrl += `?${params.toString()}`;
  }
  
  return shareUrl;
}

/**
 * Cache for successful clipboard operations
 */
const clipboardSupportCache: { supported?: boolean } = {};

/**
 * Checks if clipboard API is supported
 * @returns Boolean indicating if clipboard is supported
 */
function isClipboardSupported(): boolean {
  // Use cached result if available
  if (clipboardSupportCache.supported !== undefined) {
    return clipboardSupportCache.supported;
  }
  
  // Check for clipboard support
  const supported = !!(
    typeof navigator !== 'undefined' && 
    navigator.clipboard && 
    navigator.clipboard.writeText
  );
  
  // Cache the result
  clipboardSupportCache.supported = supported;
  return supported;
}

/**
 * Copies text to clipboard with optimized fallbacks
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves to true if copy was successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Use modern Clipboard API if available
    if (isClipboardSupported()) {
      await navigator.clipboard.writeText(text);
      return true;
    } 
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Shares a poll via email
 * @param email - Recipient's email address
 * @param pollId - ID of the poll to share
 * @param pollTitle - Title of the poll
 * @returns Promise that resolves to true if email client opened successfully
 */
export async function shareViaEmail(email: string, pollId: string, pollTitle: string): Promise<boolean> {
  try {
    const shareUrl = generateShareLink(pollId, { source: 'email', medium: 'share' });
    const subject = `Check out this poll: ${pollTitle}`;
    const body = `I thought you might be interested in this poll: ${pollTitle}\n\nYou can vote here: ${shareUrl}`;
    
    // Open email client with mailto link
    const mailtoLink = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    return true;
  } catch (err) {
    console.error('Failed to share via email: ', err);
    return false;
  }
}

/**
 * Validates an email address
 * @param email - Email address to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}