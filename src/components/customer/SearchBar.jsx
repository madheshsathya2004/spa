
import React from 'react';
import './index1.css';
const SearchBar = ({ onSearch }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Search spa by name..."
        onChange={(e) => onSearch(e.target.value)}
      
      />
    </div>
  );
};

export default SearchBar;