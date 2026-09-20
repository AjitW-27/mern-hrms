import React from "react";

const Logo = ({ open = true }) => {
  return open ? (
    <svg width="220" height="70" viewBox="0 0 300 90">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="40%" stopColor="#4F46E5" />
          <stop offset="70%" stopColor="#312E81" />
        </linearGradient>
      </defs>

      {/* Icon */}
      <rect x="10" y="15" width="65" height="65" rx="20" fill="url(#g1)" />

      {/* A */}
      <path
        d="M22 55 L32 28 L42 55 M27 45 L37"
        stroke="white"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* W */}
      <path
        d="M42 55 L50 32 L58 55 L64 30"
        stroke="white"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Text */}
      <text x="95" y="48" fontSize="26" fontWeight="800" fill="rgba(255,255,255,.87)">
        AJIT
      </text>

      <text x="95" y="70" fontSize="20" fill="#A5AEFB" fontWeight="800" letterSpacing="3">
        WADIKAR
      </text>
    </svg>
  ) : (
    // Collapsed icon only
    <svg width="45" height="45" viewBox="0 0 80 80">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
      </defs>

      <rect width="80" height="80" rx="20" fill="url(#g1)" />

      <path
        d="M18 55 L30 25 L42 55 M24 42 L36 42"
        stroke="white"
        strokeWidth="3"
        fill="none"
      />

      <path
        d="M42 55 L50 32 L58 55 L64 30"
        stroke="white"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
};

export default Logo;
