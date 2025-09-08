"use client";
import { supabase } from '../../../lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Login Component - Authentication Entry Point
 * 
 * This component serves as the primary authentication gateway for the polling application.
 * It handles user login through Supabase Auth and manages the authentication flow that
 * connects users to their personalized dashboard and poll management capabilities.
 * 
 * CONTEXT & PURPOSE:
 * - Acts as the security checkpoint before accessing protected features (dashboard, poll creation)
 * - Integrates with Supabase Auth service for secure credential validation
 * - Provides user feedback for authentication errors and success states
 * - Maintains consistent UI/UX with the application's design system
 * 
 * ASSUMPTIONS:
 * - Supabase client is properly configured with valid project credentials
 * - Users have already registered through the registration flow
 * - Network connectivity is available for authentication requests
 * - Browser supports modern JavaScript features (async/await, ES6+)
 * 
 * EDGE CASES HANDLED:
 * - Invalid email/password combinations
 * - Network failures during authentication
 * - Malformed email addresses (handled by HTML5 validation)
 * - Empty form submissions (prevented by required attributes)
 * - Supabase service unavailability
 * 
 * CONNECTIONS TO OTHER COMPONENTS:
 * - Links to Registration page (/auth/register) for new users
 * - Redirects to Dashboard (/dashboard) upon successful authentication
 * - Uses shared Supabase client from lib/supabaseClient
 * - Integrates with Navbar component for authentication state management
 * - Protected by route middleware (if implemented) to prevent authenticated users from accessing
 * 
 * @returns {JSX.Element} The login form with email/password inputs and error handling
 */
export default function Login() {
  // Form state management - tracks user input for authentication
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Error state - displays authentication failures to user
  // This provides immediate feedback for invalid credentials or network issues
  const [error, setError] = useState('');
  
  // Navigation hook - handles post-authentication routing
  // Redirects users to dashboard after successful login
  const router = useRouter();

  /**
   * Handles user authentication through Supabase Auth
   * 
   * This function orchestrates the complete login flow:
   * 1. Prevents default form submission to handle authentication client-side
   * 2. Calls Supabase Auth API with user credentials
   * 3. Manages error states for failed authentication attempts
   * 4. Redirects to dashboard upon successful authentication
   * 
   * SECURITY CONSIDERATIONS:
   * - Credentials are sent securely through Supabase's encrypted channels
   * - No sensitive data is stored in component state beyond the session
   * - Error messages are user-friendly but don't expose system details
   * 
   * ERROR HANDLING:
   * - Network failures: Displays connection error message
   * - Invalid credentials: Shows "Invalid email or password" message
   * - Rate limiting: Supabase handles and returns appropriate error
   * 
   * @param {React.FormEvent} e - Form submission event
   * @returns {Promise<void>} Resolves after authentication attempt completes
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Clear any previous error messages before new attempt
    setError('');
    
    // Attempt authentication through Supabase Auth service
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Display user-friendly error message for failed authentication
      // Supabase provides localized error messages that are safe to display
      setError(error.message);
    } else {
      // Successful authentication - redirect to user dashboard
      // Dashboard is the main hub for poll management and user activities
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input 
                id="email"
                type="email" 
                placeholder="Enter your email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200" 
                required 
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input 
                id="password"
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200" 
                required 
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
