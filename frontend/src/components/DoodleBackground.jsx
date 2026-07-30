import React from 'react';

// Decorative hand-drawn campus doodles, sits fixed behind all content.
export default function DoodleBackground() {
  return (
    <svg
      className="doodle-layer"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="var(--line)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* lightbulb */}
        <g transform="translate(90,110) rotate(-8)">
          <circle cx="0" cy="0" r="22" />
          <path d="M-8 20 L8 20 M-6 26 L6 26" />
          <path d="M0 -22 L0 -30 M15 -16 L21 -22 M-15 -16 L-21 -22" />
        </g>
        {/* wrench */}
        <g transform="translate(1300,180) rotate(20)">
          <path d="M-30 30 L10 -10 M0 -20 a12 12 0 1 1 20 20 a12 12 0 0 1 -20 -20" />
        </g>
        {/* book */}
        <g transform="translate(180,650)">
          <path d="M-30 -18 L0 -24 L30 -18 L30 18 L0 24 L-30 18 Z" />
          <path d="M0 -24 L0 24" />
        </g>
        {/* speech bubble / grievance */}
        <g transform="translate(1250,620) rotate(-6)">
          <path d="M-35 -20 h70 a8 8 0 0 1 8 8 v24 a8 8 0 0 1 -8 8 h-45 l-14 14 v-14 h-11 a8 8 0 0 1 -8 -8 v-24 a8 8 0 0 1 8 -8 Z" />
          <path d="M-18 -4 h40 M-18 8 h26" />
        </g>
        {/* graduation cap */}
        <g transform="translate(700,80)">
          <path d="M-30 0 L0 -14 L30 0 L0 14 Z" />
          <path d="M-15 6 v14 q15 10 30 0 v-14" />
        </g>
        {/* clock (SLA timer) */}
        <g transform="translate(650,750) rotate(4)">
          <circle cx="0" cy="0" r="20" />
          <path d="M0 0 L0 -12 M0 0 L9 5" />
        </g>
        {/* pin / thumbtack */}
        <g transform="translate(1000,400) rotate(12)">
          <circle cx="0" cy="-8" r="8" />
          <path d="M0 0 L0 20" />
        </g>
        {/* gear */}
        <g transform="translate(380,380) rotate(10)">
          <circle cx="0" cy="0" r="16" />
          <circle cx="0" cy="0" r="5" />
          <path d="M0 -22 L0 -16 M0 22 L0 16 M-22 0 L-16 0 M22 0 L16 0 M15 -15 L11 -11 M-15 -15 L-11 -11 M15 15 L11 11 M-15 15 L-11 11" />
        </g>
        {/* checkmark note */}
        <g transform="translate(1120,80) rotate(-10)">
          <rect x="-20" y="-16" width="40" height="32" rx="4" />
          <path d="M-10 0 L-2 8 L12 -8" />
        </g>
      </g>
    </svg>
  );
}
