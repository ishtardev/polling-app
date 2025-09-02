/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test component
const TestComponent = () => <div>Test Component</div>;

describe('Basic Test', () => {
  test('component renders', () => {
    render(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeTruthy();
  });
});
