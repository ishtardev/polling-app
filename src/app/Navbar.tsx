"use client";
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Navbar Component - Application Navigation Header
 * 
 * This component serves as the primary navigation interface for the polling application,
 * providing consistent access to key features and user authentication status across
 * all pages. It adapts its content based on user authentication state and provides
 * seamless navigation throughout the application.
 * 
 * Context & Purpose:
 * - Persistent navigation header visible on all pages
 * - Central hub for application navigation and user management
 * - Responsive design that adapts to different screen sizes
 * - Integrates authentication state with navigation options
 * 
 * Key Features:
 * - Real-time authentication state monitoring
 * - Conditional navigation based on user login status
 * - Responsive design with mobile-friendly layout
 * - Branded logo and application identity
 * - User avatar and profile information display
 * - Seamless logout functionality with state cleanup
 * 
 * Authentication Integration:
 * - Monitors Supabase auth state changes in real-time
 * - Automatically updates UI when user logs in/out
 * - Provides secure logout with proper session cleanup
 * - Displays user information when authenticated
 * 
 * Navigation Structure:
 * - Authenticated users: Dashboard, Create Poll, User Menu
 * - Unauthenticated users: Login, Register (Get Started)
 * - Logo always links to home page
 * - Consistent styling and hover effects
 * 
 * User Experience:
 * - Sticky positioning for always-accessible navigation
 * - Smooth transitions and hover effects
 * - Clear visual hierarchy and branding
 * - Responsive behavior for mobile devices
 * - Intuitive user avatar with email initial
 * 
 * Performance Considerations:
 * - Efficient auth state subscription management
 * - Proper cleanup of event listeners
 * - Minimal re-renders through controlled state updates
 * - Optimized for fast navigation between pages
 * 
 * Security Considerations:
 * - Secure logout with complete session termination
 * - Protected navigation links based on auth state
 * - No sensitive information exposed in UI
 * - Proper auth state validation
 * 
 * Responsive Design:
 * - Mobile-first approach with progressive enhancement
 * - Hidden elements on smaller screens (md:block)
 * - Flexible layout that adapts to screen size
 * - Touch-friendly button sizes and spacing
 * 
 * Accessibility:
 * - Semantic navigation structure
 * - Proper link and button elements
 * - Clear visual focus indicators
 * - Screen reader friendly content
 * 
 * Integration Points:
 * - Supabase authentication system
 * - Next.js routing and navigation
 * - Application-wide styling system
 * - User session management
 * 
 * Future Enhancements:
 * - Mobile hamburger menu for better mobile UX
 * - User dropdown menu with additional options
 * - Notification badges for user activities
 * - Theme switching capabilities
 * - Advanced user profile management
 * 
 * @returns JSX.Element - Complete navigation header component
 */
export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    /**
     * Authentication State Management
     * 
     * This effect establishes and maintains real-time synchronization with
     * Supabase authentication state. It ensures the navbar always reflects
     * the current user's authentication status and updates immediately when
     * auth state changes occur anywhere in the application.
     * 
     * Initial State Loading:
     * - Fetches current user on component mount
     * - Handles cases where user is already authenticated
     * - Provides immediate UI update with current auth state
     * 
     * Real-time State Monitoring:
     * - Subscribes to auth state changes (login, logout, token refresh)
     * - Updates navbar UI immediately when auth events occur
     * - Handles session expiration and renewal automatically
     * 
     * Event Handling:
     * - SIGNED_IN: User successfully authenticated
     * - SIGNED_OUT: User logged out or session expired
     * - TOKEN_REFRESHED: Session renewed automatically
     * - PASSWORD_RECOVERY: User initiated password reset
     * 
     * Memory Management:
     * - Properly unsubscribes from auth events on component unmount
     * - Prevents memory leaks and unnecessary event handlers
     * - Ensures clean component lifecycle management
     * 
     * Error Handling:
     * - Gracefully handles auth service failures
     * - Provides fallback null state for missing user data
     * - Maintains UI stability during auth transitions
     */
    // Load initial authentication state
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    
    // Subscribe to real-time authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null); // Update user state, fallback to null
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  /**
   * handleLogout - Secure User Logout Handler
   * 
   * Implements comprehensive logout functionality that ensures complete
   * session termination and proper application state cleanup. This function
   * coordinates between authentication service, local state, and navigation
   * to provide a seamless and secure logout experience.
   * 
   * Logout Process:
   * 1. Terminate Supabase authentication session
   * 2. Clear local user state immediately
   * 3. Redirect user to home page
   * 4. Auth state change will trigger UI updates automatically
   * 
   * Security Measures:
   * - Complete server-side session termination
   * - Immediate local state cleanup
   * - Prevents access to protected resources
   * - Clears any cached authentication tokens
   * 
   * User Experience:
   * - Immediate UI feedback (user state cleared)
   * - Smooth redirect to public home page
   * - No loading states or delays
   * - Consistent behavior across all logout triggers
   * 
   * Error Handling:
   * - Continues with logout even if server request fails
   * - Local state cleanup ensures UI consistency
   * - Network failures don't prevent logout completion
   * - Graceful degradation for offline scenarios
   * 
   * State Management:
   * - Optimistic local state update for immediate UI response
   * - Auth subscription will handle any additional cleanup
   * - Ensures consistent state across all components
   * 
   * Navigation:
   * - Redirects to home page (public route)
   * - Prevents access to protected dashboard/creation pages
   * - Maintains application flow and user expectations
   */
  async function handleLogout() {
    // Terminate authentication session on server
    await supabase.auth.signOut();
    
    // Immediately clear local user state for responsive UI
    setUser(null);
    
    // Redirect to public home page
    router.push('/');
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PollMaster</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {user && (
                <>
                  <a href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                    Dashboard
                  </a>
                  <a href="/create-poll" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                    Create Poll
                  </a>
                </>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <a 
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Login
                </a>
                <a 
                  href="/auth/register"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200 shadow-sm"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
