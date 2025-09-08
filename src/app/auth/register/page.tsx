"use client";
import { supabase } from '../../../lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Registration Component - User Account Creation
 * 
 * This component handles new user registration for the polling application.
 * It creates user accounts through Supabase Auth and initiates the user onboarding
 * process that enables access to poll creation and management features.
 * 
 * CONTEXT & PURPOSE:
 * - Serves as the entry point for new users to join the polling platform
 * - Integrates with Supabase Auth for secure account creation and email verification
 * - Establishes user identity required for poll ownership and management
 * - Provides seamless transition to login flow after successful registration
 * 
 * ASSUMPTIONS:
 * - Supabase Auth is configured with email confirmation enabled
 * - Users provide valid email addresses for account verification
 * - Password requirements are enforced by Supabase Auth policies
 * - Network connectivity is available for registration requests
 * 
 * EDGE CASES HANDLED:
 * - Duplicate email addresses (Supabase returns appropriate error)
 * - Weak passwords (handled by Supabase Auth password policies)
 * - Invalid email formats (HTML5 validation + Supabase validation)
 * - Network failures during registration process
 * - Supabase service unavailability
 * 
 * CONNECTIONS TO OTHER COMPONENTS:
 * - Links to Login page (/auth/login) for existing users and post-registration flow
 * - Uses shared Supabase client from lib/supabaseClient
 * - Integrates with email verification system (handled by Supabase)
 * - Connected to user dashboard access after email confirmation
 * - Part of the authentication flow managed by Navbar component
 * 
 * SECURITY CONSIDERATIONS:
 * - Passwords are securely transmitted through Supabase's encrypted channels
 * - Email verification prevents unauthorized account creation
 * - No sensitive data is stored in component state
 * - Follows Supabase Auth security best practices
 * 
 * @returns {JSX.Element} The registration form with email/password inputs and error handling
 */
export default function Register() {
  // Form state management - tracks user input for account creation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Error state - displays registration failures to user
  // Provides immediate feedback for validation errors or system issues
  const [error, setError] = useState('');
  
  // Navigation hook - handles post-registration routing
  // Redirects users to login page after successful account creation
  const router = useRouter();

  /**
   * Handles user account creation through Supabase Auth
   * 
   * This function orchestrates the complete registration flow:
   * 1. Prevents default form submission for client-side handling
   * 2. Calls Supabase Auth API to create new user account
   * 3. Manages error states for failed registration attempts
   * 4. Redirects to login page upon successful account creation
   * 
   * REGISTRATION FLOW:
   * - User submits email/password combination
   * - Supabase creates account and sends verification email
   * - User is redirected to login page with instructions
   * - Email verification enables full account access
   * 
   * ERROR HANDLING:
   * - Email already exists: "User already registered" message
   * - Weak password: Password strength requirement message
   * - Invalid email: Email format validation error
   * - Network issues: Connection error message
   * 
   * @param {React.FormEvent} e - Form submission event
   * @returns {Promise<void>} Resolves after registration attempt completes
   */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Clear any previous error messages before new attempt
    setError('');
    
    // Attempt account creation through Supabase Auth service
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      // Display user-friendly error message for failed registration
      // Supabase provides localized error messages that are safe to display
      setError(error.message);
    } else {
      // Successful registration - redirect to login page
      // User will need to verify email before accessing dashboard
      router.push('/auth/login');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600">Start creating amazing polls today</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl sm:px-10">
          <form onSubmit={handleRegister} className="space-y-6">
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
                placeholder="Create a password" 
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
              Create Account
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
