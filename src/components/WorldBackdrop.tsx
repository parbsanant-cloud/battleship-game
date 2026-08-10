export default function WorldBackdrop() {
  return (
    <div className="world-backdrop" aria-hidden="true">
      <svg
        className="world-backdrop__svg"
        viewBox="0 0 1600 2400"
        preserveAspectRatio="none"
        role="presentation"
      >
        <defs>
          <linearGradient id="world-sea" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#15243a" />
            <stop offset="0.48" stopColor="#0b1628" />
            <stop offset="1" stopColor="#180f1e" />
          </linearGradient>
          <radialGradient id="world-moonlight" cx="50%" cy="0%" r="75%">
            <stop offset="0" stopColor="#d8d4bf" stopOpacity="0.18" />
            <stop offset="0.45" stopColor="#7a8996" stopOpacity="0.05" />
            <stop offset="1" stopColor="#0a0e1a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="world-route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#bd9658" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#d5b778" stopOpacity="0.45" />
            <stop offset="1" stopColor="#bd9658" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        <rect width="1600" height="2400" fill="url(#world-sea)" />
        <rect width="1600" height="2400" fill="url(#world-moonlight)" />

        <g className="world-backdrop__waves" fill="none" stroke="#9ca9aa" strokeOpacity="0.12">
          <path d="M0 170 C180 100 310 250 570 170 S1030 110 1600 190" />
          <path d="M0 330 C100 250 370 420 690 330 S1250 270 1600 370" />
          <path d="M0 560 C210 480 380 650 730 560 S1210 490 1600 610" />
          <path d="M0 790 C120 700 420 860 760 770 S1270 710 1600 820" />
          <path d="M0 1030 C190 930 430 1110 800 1010 S1260 960 1600 1080" />
          <path d="M0 1290 C170 1170 430 1370 750 1270 S1260 1220 1600 1350" />
          <path d="M0 1530 C180 1440 450 1610 810 1500 S1280 1460 1600 1580" />
          <path d="M0 1780 C130 1670 440 1880 760 1760 S1260 1710 1600 1840" />
          <path d="M0 2040 C180 1930 450 2130 820 2020 S1300 1970 1600 2100" />
          <path d="M0 2280 C140 2170 420 2380 760 2260 S1280 2220 1600 2340" />
        </g>

        <path
          className="world-backdrop__route"
          d="M220 410 C470 570 300 790 580 930 S1080 1060 1310 1280 S1180 1710 930 1840 S650 2100 1120 2220"
          fill="none"
          stroke="url(#world-route)"
          strokeDasharray="3 18"
          strokeLinecap="round"
        />

        <g className="world-backdrop__stars" fill="#e5dfc9">
          <circle cx="180" cy="230" r="2" />
          <circle cx="340" cy="150" r="1.5" />
          <circle cx="650" cy="280" r="1.5" />
          <circle cx="1020" cy="180" r="2" />
          <circle cx="1390" cy="320" r="1.5" />
          <circle cx="1450" cy="740" r="2" />
          <circle cx="210" cy="1180" r="1.5" />
          <circle cx="1250" cy="1530" r="1.5" />
          <circle cx="350" cy="2020" r="2" />
          <circle cx="1340" cy="2180" r="1.5" />
        </g>

        <g className="world-backdrop__landmark world-backdrop__cyclops" transform="translate(110 710)">
          <path d="M0 125 L34 72 86 58 121 18 190 42 232 92 278 111 305 157 0 157Z" fill="#121622" />
          <path d="M122 77 Q155 48 186 77 Q155 112 122 77Z" fill="#30333a" />
          <ellipse cx="154" cy="77" rx="10" ry="14" fill="#d2b46d" fillOpacity="0.5" />
          <circle cx="154" cy="77" r="3" fill="#0b0d14" />
        </g>

        <g className="world-backdrop__landmark world-backdrop__sirens" transform="translate(1280 980)">
          <path d="M0 146 Q48 95 110 118 T226 122 L260 166 0 166Z" fill="#121622" />
          <path d="M98 118 Q97 76 111 52 Q128 78 126 116 M151 120 Q153 80 169 59 Q180 87 174 121" fill="none" stroke="#aaa18f" strokeOpacity="0.5" strokeWidth="4" />
          <circle cx="111" cy="50" r="3" fill="#d8c994" fillOpacity="0.55" />
          <circle cx="169" cy="57" r="3" fill="#d8c994" fillOpacity="0.55" />
        </g>

        <g className="world-backdrop__landmark world-backdrop__scylla" transform="translate(1240 1450)">
          <path d="M0 208 Q70 142 145 176 T300 150 L340 240 0 240Z" fill="#0a0d16" />
          <path d="M86 191 Q72 94 111 38 Q142 100 128 184 M153 184 Q161 72 204 19 Q222 105 198 183 M219 188 Q251 98 300 67 Q303 153 268 200" fill="#10121b" stroke="#817776" strokeOpacity="0.23" strokeWidth="6" />
          <circle cx="111" cy="75" r="5" fill="#b49463" fillOpacity="0.35" />
          <circle cx="203" cy="57" r="5" fill="#b49463" fillOpacity="0.35" />
          <circle cx="292" cy="99" r="5" fill="#b49463" fillOpacity="0.35" />
        </g>

        <g className="world-backdrop__landmark world-backdrop__charybdis" transform="translate(120 1740)">
          <circle cx="150" cy="150" r="108" fill="#080d17" fillOpacity="0.55" />
          <path d="M40 152 Q95 76 168 128 T272 145 Q215 186 150 174 T40 152Z" fill="none" stroke="#a6afb0" strokeOpacity="0.26" strokeWidth="6" />
          <path d="M72 152 Q115 112 159 142 T235 151 Q195 172 151 164 T72 152Z" fill="none" stroke="#c2b78f" strokeOpacity="0.22" strokeWidth="4" />
          <path d="M112 151 Q140 137 163 149 T192 151" fill="none" stroke="#c2b78f" strokeOpacity="0.24" strokeWidth="3" />
        </g>

        <g className="world-backdrop__landmark world-backdrop__ithaca" transform="translate(1050 2110)">
          <path d="M0 165 Q62 100 145 114 T300 105 L360 178 0 178Z" fill="#151a21" />
          <path d="M112 115 Q153 48 198 104 L229 126" fill="none" stroke="#77878a" strokeOpacity="0.55" strokeWidth="5" />
          <path d="M170 101 L170 74 M158 85 L182 85" stroke="#bda35d" strokeOpacity="0.5" strokeWidth="3" />
          <circle cx="169" cy="66" r="8" fill="#e5c978" fillOpacity="0.62" />
          <path d="M34 192 C130 176 240 198 340 185" fill="none" stroke="#b7b7a1" strokeOpacity="0.24" strokeWidth="3" />
        </g>

        <path className="world-backdrop__trident" d="M820 420 V300 M780 320 L820 280 860 320 M800 300 V265 M840 300 V265" fill="none" stroke="#d0bd88" strokeOpacity="0.1" strokeWidth="4" />
        <path className="world-backdrop__lightning" d="M1180 450 L1210 520 1190 520 1220 590" fill="none" stroke="#d7d0b8" strokeOpacity="0.26" strokeWidth="4" />
      </svg>
    </div>
  )
}
