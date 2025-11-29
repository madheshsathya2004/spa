import React from 'react';
import './index1.css';
const SlotButton = ({ slot, isSelected, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(slot)}
      className="slot-btn"
      
    >
      {slot}
    </button>
  );
};

export default SlotButton;