function Cyclops() {
  return (
    <svg viewBox="0 0 300 170" preserveAspectRatio="xMidYMid meet" role="presentation">
      <path d="M0 151 18 116 43 112 57 75 84 87 106 39 132 66 155 19 183 62 214 50 238 93 271 97 300 137V170H0Z" fill="#101a25" />
      <path d="M98 138Q115 99 146 91q28 8 43 47-39 16-91 0Z" fill="#07101a" />
      <path d="M118 132q23-20 45-2" fill="none" stroke="#263a43" strokeOpacity="0.8" strokeWidth="4" />
      <circle cx="141" cy="120" r="3.5" fill="#cfb975" fillOpacity="0.42" />
      <path d="M20 153q74-18 144 0t116-3" fill="none" stroke="#6e878d" strokeOpacity="0.32" strokeWidth="3" />
    </svg>
  )
}

function Sirens() {
  return (
    <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid meet" role="presentation">
      <path d="M0 127 20 108 42 113 66 92 91 106 115 90 143 105 168 91 192 111 218 101 240 125V150H0Z" fill="#101a25" />
      <circle cx="104" cy="71" r="6" fill="#182733" />
      <path d="M93 111q2-29 11-37 12 9 16 37l-7 18H99Z" fill="#182733" />
      <circle cx="153" cy="67" r="5.5" fill="#182733" />
      <path d="M143 111q2-31 10-39 12 10 16 39l-7 17H149Z" fill="#182733" />
      <path d="M22 131q65-17 119 1t77-3" fill="none" stroke="#6d858c" strokeOpacity="0.3" strokeWidth="3" />
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
