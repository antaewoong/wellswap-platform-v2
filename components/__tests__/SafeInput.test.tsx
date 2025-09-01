import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SafeInput from '../SafeInput';

describe('SafeInput Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default props', () => {
    render(<SafeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('calls onChange when input value changes', () => {
    render(<SafeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test input' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test input');
  });

  it('sanitizes script tags from input', () => {
    render(<SafeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '<script>alert("xss")</script>test' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('removes javascript: protocol from input', () => {
    render(<SafeInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'javascript:alert("xss")' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('applies custom className', () => {
    render(<SafeInput value="" onChange={mockOnChange} className="custom-class" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<SafeInput value="" onChange={mockOnChange} style={customStyle} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle('background-color: red');
  });

  it('handles disabled state', () => {
    render(<SafeInput value="" onChange={mockOnChange} disabled={true} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('handles different input types', () => {
    render(<SafeInput value="" onChange={mockOnChange} type="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('respects maxLength prop', () => {
    render(<SafeInput value="" onChange={mockOnChange} maxLength={10} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });
});