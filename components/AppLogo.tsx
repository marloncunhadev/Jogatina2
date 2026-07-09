'use client';

import React from 'react';

interface AppLogoProps {
  className?: string;
}

export default function AppLogo({ className = 'w-16 h-16' }: AppLogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none drop-shadow-xl`}
    >
      {/* Outer Circular Rim & Deep Midnight Blue Background */}
      <circle cx="256" cy="256" r="240" fill="url(#bgGradient)" stroke="url(#rimGradient)" strokeWidth="12" />
      
      {/* Decorative inner circle path */}
      <circle cx="256" cy="256" r="226" stroke="#102554" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />

      {/* --- LAYER 1: Catan Hexagon (Bottom Left) --- */}
      <g transform="translate(80, 240) scale(0.9)">
        {/* Hexagon shape */}
        <polygon
          points="60,0 120,35 120,105 60,140 0,105 0,35"
          fill="url(#catanBg)"
          stroke="#D49A3B"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Landscape detail */}
        {/* Mountains */}
        <path d="M25 90 L50 45 L75 80 L95 55 L110 90 Z" fill="#7C8B9E" />
        <path d="M50 45 L60 65 L70 55 L75 80 Z" fill="#9FB0C4" opacity="0.7" />
        {/* Hills / Fields */}
        <path d="M10 100 Q60 70 110 100" fill="#4B7E38" />
        <path d="M5 105 Q60 85 115 105" fill="#5F9E49" />
        {/* Sun */}
        <circle cx="60" cy="50" r="16" fill="url(#sunGradient)" />
      </g>

      {/* --- LAYER 2: Cards --- */}
      
      {/* UNO Red Card (Top Right Back) */}
      <g transform="translate(280, 80) rotate(15) scale(0.9)">
        <rect x="0" y="0" width="110" height="160" rx="14" fill="#E21B1B" stroke="#FFFFFF" strokeWidth="6" />
        <ellipse cx="55" cy="80" rx="42" ry="65" fill="#000000" transform="rotate(-15, 55, 80)" opacity="0.15" />
        <ellipse cx="55" cy="80" rx="38" ry="58" fill="#FFFFFF" transform="rotate(-15, 55, 80)" />
        <ellipse cx="55" cy="80" rx="34" ry="54" fill="#E21B1B" transform="rotate(-15, 55, 80)" />
        <text
          x="55"
          y="92"
          fontFamily="'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="34"
          fill="#FBE106"
          textAnchor="middle"
          stroke="#000000"
          strokeWidth="4"
          paintOrder="stroke fill"
          transform="rotate(-15, 55, 80)"
        >
          UNO
        </text>
      </g>

      {/* FLIP 7 Card (Top Left Front) */}
      <g transform="translate(110, 85) rotate(-18) scale(0.95)">
        <rect x="0" y="0" width="110" height="160" rx="14" fill="#FFFFFF" stroke="#3182CE" strokeWidth="6" />
        {/* Yellow inner accent */}
        <path d="M 6 6 L 104 6 L 104 154 L 6 154 Z" fill="#FEE2E2" opacity="0.1" />
        <path d="M 8 8 L 102 8 L 102 30 L 8 30 Z" fill="#ED8936" rx="4" />
        <text
          x="55"
          y="24"
          fontFamily="'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="15"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          FLIP
        </text>
        <text
          x="55"
          y="115"
          fontFamily="'Impact', sans-serif"
          fontWeight="900"
          fontSize="84"
          fill="#E53E3E"
          textAnchor="middle"
          stroke="#000"
          strokeWidth="2"
        >
          7
        </text>
      </g>

      {/* UNO FLIP Card (Middle Right Front) */}
      <g transform="translate(325, 205) rotate(12) scale(0.9)">
        <rect x="0" y="0" width="110" height="160" rx="14" fill="#1A202C" stroke="#FFFFFF" strokeWidth="6" />
        <ellipse cx="55" cy="80" rx="38" ry="58" fill="#553C9A" transform="rotate(-10, 55, 80)" />
        <text
          x="55"
          y="72"
          fontFamily="'Arial Black', sans-serif"
          fontWeight="950"
          fontSize="24"
          fill="#FBE106"
          textAnchor="middle"
          stroke="#000000"
          strokeWidth="3"
          paintOrder="stroke fill"
          transform="rotate(-10, 55, 80)"
        >
          UNO
        </text>
        <text
          x="55"
          y="105"
          fontFamily="'Arial Black', sans-serif"
          fontWeight="950"
          fontSize="21"
          fill="#FFFFFF"
          textAnchor="middle"
          stroke="#000000"
          strokeWidth="3"
          paintOrder="stroke fill"
          transform="rotate(-10, 55, 80)"
        >
          FLIP!
        </text>
      </g>

      {/* --- LAYER 3: Scoreboard Notepad (Center) --- */}
      <g transform="translate(195, 130) scale(1.05)">
        {/* Paper Card */}
        <rect x="0" y="0" width="130" height="175" rx="8" fill="#F7FAFC" stroke="#2D3748" strokeWidth="4" />
        {/* Spiral binder top rings */}
        <rect x="20" y="-12" width="6" height="20" rx="3" fill="#2D3748" />
        <rect x="50" y="-12" width="6" height="20" rx="3" fill="#2D3748" />
        <rect x="80" y="-12" width="6" height="20" rx="3" fill="#2D3748" />
        <rect x="110" y="-12" width="6" height="20" rx="3" fill="#2D3748" />

        {/* Small avatar score columns */}
        <circle cx="65" cy="20" r="5" fill="#ED8936" />
        <circle cx="82" cy="20" r="5" fill="#E53E3E" />
        <circle cx="99" cy="20" r="5" fill="#3182CE" />
        <circle cx="116" cy="20" r="5" fill="#48BB78" />

        {/* Notebook Lines and Rows */}
        <line x1="8" y1="32" x2="122" y2="32" stroke="#4A5568" strokeWidth="2" />
        
        {/* Grid Columns */}
        <line x1="52" y1="12" x2="52" y2="165" stroke="#CBD5E0" strokeWidth="1.5" />
        <line x1="73" y1="28" x2="73" y2="165" stroke="#CBD5E0" strokeWidth="1" />
        <line x1="90" y1="28" x2="90" y2="165" stroke="#CBD5E0" strokeWidth="1" />
        <line x1="107" y1="28" x2="107" y2="165" stroke="#CBD5E0" strokeWidth="1" />

        {/* Scoreboard Rows */}
        {[48, 64, 80, 96, 112, 128, 144].map((y, idx) => (
          <line key={idx} x1="8" y1={y} x2="122" y2={y} stroke="#E2E8F0" strokeWidth="1.5" />
        ))}

        {/* Game Names in Scoreboard */}
        <text x="14" y="44" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize="9" fill="#1A202C">FLIP 7</text>
        <text x="14" y="60" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize="9" fill="#1A202C">UNO</text>
        <text x="14" y="76" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize="9" fill="#1A202C">UNO FLIP</text>
        <text x="14" y="92" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize="9" fill="#1A202C">CATAN</text>
        <text x="14" y="108" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize="9" fill="#1A202C">GENERAL</text>

        {/* Tiny placeholder score dots */}
        <circle cx="63" cy="44" r="1.5" fill="#718096" />
        <circle cx="81" cy="44" r="1.5" fill="#718096" />
        <circle cx="98" cy="44" r="1.5" fill="#718096" />
        <circle cx="63" cy="76" r="1.5" fill="#718096" />
        <circle cx="81" cy="60" r="1.5" fill="#718096" />
        <circle cx="115" cy="92" r="1.5" fill="#718096" />
      </g>

      {/* --- LAYER 4: Dice (Bottom Left Over Scoreboard) --- */}
      
      {/* White Die */}
      <g transform="translate(135, 315) rotate(-15) scale(0.9)">
        <rect x="0" y="0" width="60" height="60" rx="12" fill="#FFFFFF" stroke="#1A202C" strokeWidth="4" />
        {/* Die dots (5) */}
        <circle cx="15" cy="15" r="4.5" fill="#1A202C" />
        <circle cx="45" cy="15" r="4.5" fill="#1A202C" />
        <circle cx="30" cy="30" r="4.5" fill="#1A202C" />
        <circle cx="15" cy="45" r="4.5" fill="#1A202C" />
        <circle cx="45" cy="45" r="4.5" fill="#1A202C" />
      </g>

      {/* Red Die */}
      <g transform="translate(180, 340) rotate(18) scale(0.95)">
        <rect x="0" y="0" width="60" height="60" rx="12" fill="#E53E3E" stroke="#1A202C" strokeWidth="4" />
        {/* Die dots (3) */}
        <circle cx="15" cy="15" r="4.5" fill="#FFFFFF" />
        <circle cx="30" cy="30" r="4.5" fill="#FFFFFF" />
        <circle cx="45" cy="45" r="4.5" fill="#FFFFFF" />
      </g>

      {/* --- LAYER 5: Police/Captain Hat (Bottom Right Foreground) --- */}
      <g transform="translate(230, 290) scale(1.05)">
        {/* Shadow */}
        <ellipse cx="75" cy="100" rx="60" ry="15" fill="#000000" opacity="0.3" />
        
        {/* Visor Brim (Shiny black arc) */}
        <path d="M15 80 Q75 115 135 80 Q75 92 15 80 Z" fill="#1A202C" stroke="#000000" strokeWidth="2" />
        {/* Visor shine */}
        <path d="M 30 83 Q 75 102 120 83 Q 75 90 30 83 Z" fill="#4A5568" opacity="0.5" />

        {/* Hat main crown structure */}
        <path d="M10 65 C20 15, 130 15, 140 65 Z" fill="#1E293B" stroke="#000000" strokeWidth="3" />
        {/* Gold Trim band */}
        <path d="M 10 65 Q 75 80 140 65" stroke="#D49A3B" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M 12 65 Q 75 79 138 65" stroke="#F6AD55" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Gold Laurel leaves */}
        <path d="M 25 74 Q 45 76 55 68" stroke="#D49A3B" strokeWidth="3" fill="none" />
        <path d="M 125 74 Q 105 76 95 68" stroke="#D49A3B" strokeWidth="3" fill="none" />

        {/* Golden Star Badge */}
        <g transform="translate(75, 45) scale(0.9)">
          <polygon
            points="0,-18 5,-5 18,-5 8,4 12,17 0,9 -12,17 -8,4 -18,-5 -5,-5"
            fill="#ECC94B"
            stroke="#C05621"
            strokeWidth="2"
          />
        </g>
      </g>

      {/* --- DEFINITIONS AND GRADIENTS --- */}
      <defs>
        {/* Background Radial Gradient */}
        <radialGradient id="bgGradient" cx="256" cy="256" r="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1E46" />
          <stop offset="60%" stopColor="#08132B" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>

        {/* Rim Metallic Gradient */}
        <linearGradient id="rimGradient" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="30%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="70%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Catan Land Gradient */}
        <linearGradient id="catanBg" x1="0" y1="0" x2="120" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EDC575" />
          <stop offset="100%" stopColor="#C08413" />
        </linearGradient>

        {/* Sun Gradient */}
        <radialGradient id="sunGradient" cx="60" cy="50" r="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF0" />
          <stop offset="100%" stopColor="#DD6B20" />
        </radialGradient>
      </defs>
    </svg>
  );
}
