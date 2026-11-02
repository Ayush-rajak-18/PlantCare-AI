import React, { useState } from "react";

/* ---------------------------------------------------------
   PlantArt:    style for plasnt leaf in login pge
--------------------------------------------------------- */

// leaf: r = ghumav (rotation), s = size, c = colour number (0,1,2)
function Leaf({ r, s = 1, c = 0 }) {
  const fills = ["url(#leafA)", "url(#leafB)", "url(#leafC)"];
  return (
    <g transform={`translate(200 330) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C -52 -70 -40 -190 0 -250 C 40 -190 52 -70 0 0 Z" fill={fills[c % 3]} />
      <path d="M0 0 L0 -236" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" />
      {[-60, -105, -150, -195].map((y) => (
        <g key={y} stroke="rgba(255,255,255,0.3)" strokeWidth="1.6">
          <path d={`M0 ${y} L-26 ${y - 22}`} />
          <path d={`M0 ${y} L26 ${y - 22}`} />
        </g>
      ))}
    </g>
  );
}

function PlantArt({ className = "" }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <img
        src="/hero-plant.png"
        alt="Plant"
        onError={() => setImgFailed(true)}
        className={`object-contain drop-shadow-[0_24px_40px_rgba(20,48,31,0.25)] ${className}`}
      />
    );
  }

  return (
    <svg viewBox="0 0 400 460" className={className} role="img" aria-label="Plant illustration">
      <defs>
        <linearGradient id="leafA" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1f6b3a" />
          <stop offset="1" stopColor="#5fb77c" />
        </linearGradient>
        <linearGradient id="leafB" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#265338" />
          <stop offset="1" stopColor="#3f9d5f" />
        </linearGradient>
        <linearGradient id="leafC" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#2f7d49" />
          <stop offset="1" stopColor="#8ad3a1" />
        </linearGradient>
        <linearGradient id="pot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#e3ece5" />
          <stop offset="1" stopColor="#b9c9bd" />
        </linearGradient>
      </defs>

      {/* leaves */}
      <Leaf r={-72} s={0.85} c={2} />
      <Leaf r={72} s={0.85} c={1} />
      <Leaf r={-48} s={1.0} c={0} />
      <Leaf r={48} s={1.0} c={2} />
      <Leaf r={-22} s={1.1} c={1} />
      <Leaf r={24} s={1.12} c={0} />
      <Leaf r={0} s={1.2} c={2} />

      {/* pot */}
      <path d="M118 318 H282 L262 352 C256 388 238 414 200 424 C162 414 144 388 138 352 Z" fill="url(#pot)" />
      <ellipse cx="200" cy="318" rx="84" ry="14" fill="#2b4a37" />
      <ellipse cx="200" cy="318" rx="84" ry="14" fill="none" stroke="#265338" strokeWidth="2.5" />
      <rect x="170" y="428" width="60" height="9" rx="4.5" fill="#c9d8cd" />
    </svg>
  );
}

export default PlantArt;
