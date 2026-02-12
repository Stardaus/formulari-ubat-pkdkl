import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';
import React from 'react';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  X: () => <div data-testid="clear-icon" />
}));

describe('SearchBar', () => {
  it('renders correctly', () => {
    render(
      <SearchBar 
        searchQuery="" 
        setSearchQuery={() => {}} 
      />
    );
    expect(screen.getByPlaceholderText(/search by generic name/i)).toBeInTheDocument();
  });

  it('calls setSearchQuery on input change', () => {
    const setSearchQuery = vi.fn();
    render(
      <SearchBar 
        searchQuery="" 
        setSearchQuery={setSearchQuery} 
      />
    );
    
    const input = screen.getByPlaceholderText(/search by generic name/i);
    fireEvent.change(input, { target: { value: 'Drug A' } });
    
    expect(setSearchQuery).toHaveBeenCalledWith('Drug A');
  });

  it('renders clear button when searchQuery is not empty', () => {
    render(
      <SearchBar 
        searchQuery="Drug A" 
        setSearchQuery={() => {}} 
      />
    );
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument();
  });
});