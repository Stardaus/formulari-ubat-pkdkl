import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';
import React from 'react';

const mockData = [
  { "Generic Name": "Drug A", Brand: "Brand A", Category: "Cat A", "FUKKM System/Group": "Grp 1" },
  { "Generic Name": "Drug B", Brand: "Brand B", Category: "Cat B", "FUKKM System/Group": "Grp 2" },
];

describe('SearchBar', () => {
  it('renders correctly', () => {
    render(
      <SearchBar 
        data={mockData} 
        setSearchResults={() => {}} 
        searchTerm="" 
        setSearchTerm={() => {}} 
      />
    );
    expect(screen.getByPlaceholderText(/search for a drug/i)).toBeInTheDocument();
  });

  it('calls setSearchTerm on input change', () => {
    const setSearchTerm = vi.fn();
    render(
      <SearchBar 
        data={mockData} 
        setSearchResults={() => {}} 
        searchTerm="" 
        setSearchTerm={setSearchTerm} 
      />
    );
    
    const input = screen.getByPlaceholderText(/search for a drug/i);
    fireEvent.change(input, { target: { value: 'Drug A' } });
    
    expect(setSearchTerm).toHaveBeenCalledWith('Drug A');
  });
});
