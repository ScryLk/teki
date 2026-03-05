<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
<filter id="bodyGlow" x="-50%" y="-50%" width="200%" height="200%">
<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
<feMerge>
<feMergeNode in="blur" />
<feMergeNode in="SourceGraphic" />
</feMerge>
</filter>

<filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
  <feMerge>
    <feMergeNode in="blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>

<radialGradient id="tealGradient" cx="50%" cy="50%" r="50%">
  <stop offset="0%" style="stop-color:#00D4C8" />
  <stop offset="100%" style="stop-color:#00A8B4" />
</radialGradient>

<radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
  <stop offset="0%" style="stop-color:#0A1628; stop-opacity:0.3" />
  <stop offset="100%" style="stop-color:#0A1628; stop-opacity:0" />
</radialGradient>
</defs>

<rect width="400" height="400" fill="#0A1628" />

<ellipse cx="200" cy="330" rx="60" ry="15" fill="url(#shadowGradient)" />

<ellipse cx="200" cy="280" rx="60" ry="50" fill="url(#tealGradient)" filter="url(#bodyGlow)" />

<circle cx="200" cy="190" r="50" fill="url(#tealGradient)" filter="url(#bodyGlow)" />

<path d="M 160,165 L 175,120 L 190,165 Z" fill="url(#tealGradient)" filter="url(#bodyGlow)" />
<path d="M 210,165 L 225,120 L 240,165 Z" fill="url(#tealGradient)" filter="url(#bodyGlow)" />

<path d="M 255,250 Q 300,230 280,180" stroke="url(#tealGradient)" stroke-width="10" stroke-linecap="round" fill="none" filter="url(#bodyGlow)" />

<circle cx="180" cy="190" r="10" fill="#39FF14" filter="url(#eyeGlow)" />
<circle cx="220" cy="190" r="10" fill="#39FF14" filter="url(#eyeGlow)" />

<path d="M 190,210 Q 200,215 210,210" stroke="#00A8B4" stroke-width="2" stroke-linecap="round" fill="none" />

</svg>

