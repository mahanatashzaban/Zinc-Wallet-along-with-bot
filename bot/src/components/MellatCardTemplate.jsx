// src/components
import React from 'react';

const MellatCardTemplate = ({ owner, number, expireMonth, expireYear, bank }) => {
  // Format expiration date as MM/YY
  const expiration = `${expireMonth}/${expireYear}`;

  return (
    <svg width="320" height="200" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" rx="12" fill="#E0E0E0"/>
      <rect x="30" y="20" width="280" height="160" rx="10" fill="white" stroke="#D32F2F" strokeWidth="2"/>
      <text x="117" y="50" fill="#D32F2F" fontSize="18" fontWeight="bold" fontFamily="Tahoma, sans-serif">{bank}</text>

      <rect x="40" y="75" width="260" height="40" rx="4" fill="#F5F5F5" />
      <text x="70" y="100" fill="#000000" fontSize="16" fontFamily="Courier New, monospace">{number}</text>

      <text x="30" y="160" fill="#424242" fontSize="12" fontFamily="Tahoma, sans-serif">دارنده: {owner}</text>
      <text x="220" y="160" fill="#424242" fontSize="12" fontFamily="Tahoma, sans-serif">تاریخ: {expiration}</text>

      {/* Logo Placeholder */}
      <circle cx="285" cy="45" r="15" fill="#D32F2F"/>
      <circle cx="285" cy="45" r="7" fill="#FFC107"/>
    </svg>
  );
};

export default MellatCardTemplate;