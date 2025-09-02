/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
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
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  // UNIT TEST 1: Test login form rendering
  test('renders login form with all fields and buttons', () => {
    render(<Login />);
    
    // Check that the form elements are rendered
    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
    
    // Check navigation links
    const signUpLink = screen.getByText(/sign up here/i);
    expect(signUpLink).toBeTruthy();
    expect(signUpLink.getAttribute('href')).toBe('/auth/register');
  });
  
  // UNIT TEST 2: Test form submission with successful login
  test('submits the form and redirects on successful login', async () => {
    // Setup mock for successful login
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
      error: null
    });
    
    render(<Login />);
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that supabase auth was called correctly
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Check that redirection occurs
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  // INTEGRATION TEST: Test form submission with error handling
  test('displays error message when login fails', async () => {
    const errorMessage = 'Invalid email or password';
    
    // Setup mock for failed login
    mockSignInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage }
    });
    
    render(<Login />);
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'wrong@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that supabase auth was called correctly
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'wrong@example.com',
      password: 'wrongpassword'
    });
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeTruthy();
    });
    
    // Check that no redirection occurred
    expect(mockPush).not.toHaveBeenCalled();
  });
});
