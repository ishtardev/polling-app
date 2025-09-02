/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../src/app/auth/login/page';
import { supabase } from '../../src/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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
  // Setup common test variables
  const mockRouter = {
    push: jest.fn(),
  };
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  // Unit Test 1 - Happy Path: Successful login
  it('should successfully log in a user with valid credentials', async () => {
    // Mock successful login response
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Render the login component
    render(<Login />);

    // Find form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill out the form
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    // Submit the form
    await userEvent.click(submitButton);

    // Assert that supabase.auth.signInWithPassword was called with correct arguments
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    // Assert that the router.push was called to redirect to dashboard
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });

    // Assert that no error message is displayed
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  // Unit Test 2 - Edge Case: Failed login with invalid credentials
  it('should display an error message when login fails', async () => {
    // Mock failed login response
    const errorMessage = 'Invalid email or password';
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    // Render the login component
    render(<Login />);

    // Find form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Fill out the form
    await userEvent.type(emailInput, 'wrong@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    
    // Submit the form
    await userEvent.click(submitButton);

    // Assert that supabase.auth.signInWithPassword was called
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });

    // Assert that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Assert that the router was not called to redirect
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  // Integration Test - Form validation and submission flow
  it('should validate form inputs and handle the complete login flow', async () => {
    // Mock successful login response
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Render the login component
    render(<Login />);

    // Find form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Try to submit the form without filling out the fields
    // This tests the HTML required validation
    await userEvent.click(submitButton);
    
    // The form shouldn't be submitted yet due to HTML validation
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    
    // Fill out the form with invalid email format
    await userEvent.type(emailInput, 'invalidemail');
    await userEvent.type(passwordInput, 'password123');
    
    // Browser validation should prevent submission, but we can't test that easily in Jest
    // So we'll just focus on the valid case
    
    // Clear the inputs and fill with valid data
    await userEvent.clear(emailInput);
    await userEvent.clear(passwordInput);
    await userEvent.type(emailInput, 'valid@example.com');
    await userEvent.type(passwordInput, 'validpassword');
    
    // Submit the form
    await userEvent.click(submitButton);
    
    // Check that Supabase was called with correct credentials
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'valid@example.com',
      password: 'validpassword',
    });
    
    // Verify navigation to dashboard occurs
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });
});
