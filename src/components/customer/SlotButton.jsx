import React from 'react';
import './index1.css';

const SlotButton = ({ slot, isSelected, onSelect, disabled }) => {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect(slot);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`slot-btn ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      disabled={disabled}
    >
      {slot}
    </button>
  );
};

export default SlotButton;
