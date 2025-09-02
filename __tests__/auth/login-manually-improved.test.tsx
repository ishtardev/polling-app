/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../../src/app/auth/login/page';

// Mock the router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Supabase
const mockSignInWithPassword = jest.fn();
jest.mock('../../src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  },
}));

describe('Login Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test to ensure clean state
    jest.clearAllMocks();
  });
  
  // UNIT TEST 1: Test login form rendering with improved assertions
  test('renders login form with all expected UI elements and proper styling', () => {
    render(<Login />);
    
    // Check for branding elements
    const logo = screen.getByText('P');
    expect(logo).toBeTruthy();
    expect(logo.parentElement?.className).toContain('bg-gradient-to-r');
    
    // Check heading content hierarchy
    expect(screen.getByText('Welcome back')).toBeTruthy();
    expect(screen.getByText('Sign in to your account to continue')).toBeTruthy();
    
    // Check that form elements are properly labeled and styled
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toBeTruthy();
    expect(emailInput.getAttribute('type')).toBe('email');
    expect(emailInput.hasAttribute('required')).toBeTruthy();
    expect(emailInput.className).toContain('focus:ring-2');
    
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.getAttribute('type')).toBe('password');
    expect(passwordInput.hasAttribute('required')).toBeTruthy();
    
    // Check button styling
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeTruthy();
    expect(signInButton.className).toContain('bg-gradient-to-r');
    expect(signInButton.className).toContain('hover:from-emerald-700');
    
    // Check navigation links
    const signUpLink = screen.getByText(/sign up here/i);
    expect(signUpLink).toBeTruthy();
    expect(signUpLink.getAttribute('href')).toBe('/auth/register');
  });
  
  // UNIT TEST 2: Test form submission with successful login and improved validation
  test('submits the form and redirects on successful login with proper state management', async () => {
    // Setup mock for successful login
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    });
    
    render(<Login />);
    
    // Verify initial state - no errors displayed
    expect(screen.queryByText(/error/i)).toBeNull();
    
    // Fill the form with controlled input validation
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' }
    });
    expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
    
    fireEvent.change(passwordInput, {
      target: { value: 'password123' }
    });
    expect((passwordInput as HTMLInputElement).value).toBe('password123');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that supabase auth was called with correct credentials and exactly once
    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Check that redirection occurs with proper timing
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
      expect(mockPush).toHaveBeenCalledTimes(1);
    });
    
    // Ensure no error state was set
    expect(screen.queryByText(/error/i)).toBeNull();
  });
  
  // INTEGRATION TEST: Enhanced test with more detailed error validation
  test('displays formatted error message when login fails and maintains form state', async () => {
    const errorMessage = 'Invalid email or password';
    
    // Setup mock for failed login
    mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    });
    
    render(<Login />);
    
    // Fill the form with test data
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, {
      target: { value: 'wrong@example.com' }
    });
    
    fireEvent.change(passwordInput, {
      target: { value: 'wrongpassword' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check authentication call
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'wrong@example.com',
      password: 'wrongpassword'
    });
    
    // Check that error message is displayed with proper styling
    const errorElement = await waitFor(() => screen.getByText(errorMessage));
    expect(errorElement).toBeTruthy();
    expect(errorElement.parentElement?.className).toContain('bg-red-50');
    expect(errorElement.parentElement?.className).toContain('text-red-700');
    
    // Check that form values are preserved after error
    expect((emailInput as HTMLInputElement).value).toBe('wrong@example.com');
    expect((passwordInput as HTMLInputElement).value).toBe('wrongpassword');
    
    // Check that no redirection occurred
    expect(mockPush).not.toHaveBeenCalled();
  });
});
