/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Login from '../../src/app/auth/login/page';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the supabase client
jest.mock('../../src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('Login Component', () => {
  // Unit Test 1: Tests if the login form renders correctly
  it('should render the login form with all required fields', () => {
    render(<Login />);
    
    // Check if the heading exists
    expect(screen.getByText('Welcome back')).toBeTruthy();
    
    // Check if form fields exist
    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    
    // Check if submit button exists
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
    
    // Check if the sign up link exists
    expect(screen.getByText(/don't have an account/i)).toBeTruthy();
    expect(screen.getByText(/sign up here/i)).toBeTruthy();
  });

  // Unit Test 2: Tests if login functionality works with valid credentials
  it('should call Supabase auth with correct credentials when form is submitted', async () => {
    // Import the mocked modules
    const { supabase } = require('../../src/lib/supabaseClient');
    
    // Mock successful response
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {},
      error: null
    });
    
    render(<Login />);
    
    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill and submit the form
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    // Check if Supabase was called with correct credentials
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  // Integration Test: Tests the complete login flow including error handling
  it('should handle login errors correctly', async () => {
    // Import the mocked modules
    const { supabase } = require('../../src/lib/supabaseClient');
    
    // Mock error response
    const errorMessage = "Invalid login credentials";
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    });
    
    render(<Login />);
    
    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Fill and submit the form
    await userEvent.type(emailInput, 'wrong@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeTruthy();
    });
  });
});
