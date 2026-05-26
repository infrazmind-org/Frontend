import React from 'react';

export default function Logo({ className = "h-8 text-[var(--app-text)]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Text */}
      <text x="5" y="34" fill="currentColor" fontSize="26" fontWeight="800" fontFamily="Inter, system-ui, sans-serif" letterSpacing="-0.5">Infra</text>
      <text x="105" y="34" fill="currentColor" fontSize="26" fontWeight="800" fontFamily="Inter, system-ui, sans-serif" letterSpacing="-0.5">Mind</text>
      
      {/* Z Shape */}
      {/* Top line covering Infra */}
      <path d="M 5 8 L 90 8" stroke="#0668E1" strokeWidth="4" strokeLinecap="round" />
      {/* Diagonal */}
      <path d="M 90 8 L 75 42" stroke="#0668E1" strokeWidth="4" strokeLinecap="round" />
      {/* Bottom line covering Mind */}
      <path d="M 75 42 L 175 42" stroke="#0668E1" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
