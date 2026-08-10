function Cyclops() {
  return (
    <svg viewBox="0 0 260 150" preserveAspectRatio="xMidYMid meet" role="presentation">
      <path d="M0 126 30 79 75 68 111 25 166 45 204 89 252 109 260 150H0Z" fill="#101b28" />
      <path d="M93 82Q129 45 165 80q-35 39-72 2Z" fill="#45545b" fillOpacity="0.72" />
      <ellipse cx="129" cy="79" rx="11" ry="16" fill="#d5bc76" fillOpacity="0.78" />
      <circle cx="129" cy="79" r="4" fill="#09111b" />
      <path d="M18 128Q96 112 178 129T258 126" fill="none" stroke="#9daeb0" strokeOpacity="0.45" strokeWidth="3" />
    </svg>
  )
}

function Sirens() {
  return (
    <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid meet" role="presentation">
      <path d="M0 125Q43 84 93 101t76-1q40-14 71 27v23H0Z" fill="#101722" />
      <path d="M91 105q-1-41 16-65 18 27 14 63M139 106q1-43 19-69 15 30 8 67" fill="none" stroke="#b7aa8f" strokeOpacity="0.75" strokeWidth="4" />
      <circle cx="107" cy="39" r="4" fill="#e4ce8a" fillOpacity="0.82" />
      <circle cx="158" cy="36" r="4" fill="#e4ce8a" fillOpacity="0.82" />
      <path d="M22 129q65-20 119 1t86-2" fill="none" stroke="#a4b7b5" strokeOpacity="0.48" strokeWidth="4" />
    </svg>
  )
}

function Scylla() {
  return (
    <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet" role="presentation">
      <path d="M0 183q58-60 116-38t103-12q51-28 81 29v38H0Z" fill="#08111c" />
      <path d="M69 171Q60 82 101 24q31 65 19 147M128 172Q137 64 184 9q19 74-6 160M191 176q26-87 80-116 3 80-34 125" fill="#0b1824" stroke="#a0a9a1" strokeOpacity="0.48" strokeWidth="6" />
      <circle cx="101" cy="57" r="6" fill="#d2b36b" fillOpacity="0.68" />
      <circle cx="184" cy="46" r="6" fill="#d2b36b" fillOpacity="0.68" />
      <circle cx="263" cy="82" r="6" fill="#d2b36b" fillOpacity="0.68" />
      <path d="M18 185q92-29 175 0t98-3" fill="none" stroke="#879a9e" strokeOpacity="0.42" strokeWidth="4" />
    </svg>
  )
}

function Charybdis() {
  return (
    <svg viewBox="0 0 220 220" preserveAspectRatio="xMidYMid meet" role="presentation">
      <circle cx="110" cy="110" r="94" fill="#07131f" fillOpacity="0.72" />
      <path d="M25 110q42-61 94-17t80 16q-47 36-92 14t-82-13Z" fill="none" stroke="#9fb3b2" strokeOpacity="0.62" strokeWidth="7" />
      <path d="M53 110q30-36 66-8t63 8q-36 26-66 12t-63-12Z" fill="none" stroke="#d2bf87" strokeOpacity="0.5" strokeWidth="5" />
      <path d="M82 110q18-15 35-2t29 2q-18 14-35 7t-29-7Z" fill="none" stroke="#d9d1b5" strokeOpacity="0.6" strokeWidth="4" />
    </svg>
  )
}

function Ithaca() {
  return (
    <svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" role="presentation">
      <path d="M0 116q52-52 109-37t91-4q58-25 100 18v57H0Z" fill="#142532" />
      <path d="M102 90q39-63 78-2l32 24" fill="none" stroke="#9eb2ad" strokeOpacity="0.76" strokeWidth="5" />
      <path d="M143 71V43m-13 16h26" stroke="#d5bc77" strokeOpacity="0.78" strokeWidth="3" />
      <circle cx="143" cy="36" r="9" fill="#f2d47e" fillOpacity="0.88" />
      <path d="M22 128q83-24 159 0t100-4" fill="none" stroke="#c2c7b0" strokeOpacity="0.52" strokeWidth="4" />
    </svg>
  )
}

export default function WorldBackdrop() {
  return (
    <div className="world-backdrop" aria-hidden="true">
      <svg
        className="world-backdrop__route"
        viewBox="0 0 100 2400"
        preserveAspectRatio="none"
        role="presentation"
      >
        <path
          d="M9 220C25 420 13 590 31 760S70 990 82 1190s-18 330-42 500 2 370 35 520"
          fill="none"
          stroke="#d5b778"
          strokeDasharray="1 3"
          strokeLinecap="round"
          strokeOpacity="0.42"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="world-backdrop__landmark world-backdrop__cyclops">
        <Cyclops />
      </div>
      <div className="world-backdrop__landmark world-backdrop__sirens">
        <Sirens />
      </div>
      <div className="world-backdrop__landmark world-backdrop__scylla">
        <Scylla />
      </div>
      <div className="world-backdrop__landmark world-backdrop__charybdis">
        <Charybdis />
      </div>
      <div className="world-backdrop__landmark world-backdrop__ithaca">
        <Ithaca />
      </div>
      <svg
        className="world-backdrop__storm"
        viewBox="0 0 180 160"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        <path d="M20 44q30-28 61-5 38-30 77 8" fill="none" stroke="#7f9ba4" strokeOpacity="0.4" strokeWidth="7" />
        <path d="M80 50v-31m-16 13L80 16l16 16m-8-14V5m-8 13V5" fill="none" stroke="#d3bf88" strokeOpacity="0.35" strokeWidth="3" />
        <path d="m116 60 16 28-11 0 14 31" fill="none" stroke="#ded8c2" strokeOpacity="0.68" strokeWidth="3" />
      </svg>
    </div>
  )
}
