// High-tech medical scan icon for the empty-state placeholder.
// Default colour is teal-900 (#134e4a) via the className; override with
// the `className` prop if needed elsewhere.
export default function MedicalScanIcon({ className = "w-24 h-auto text-[#134e4a]" }) {
  return (
    <svg
      viewBox="0 0 300 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2 2">
        <line x1="20" y1="20" x2="20" y2="180" />
        <line x1="150" y1="20" x2="150" y2="180" />
        <line x1="280" y1="20" x2="280" y2="180" />
        <line x1="20" y1="20" x2="280" y2="20" />
        <line x1="20" y1="100" x2="280" y2="100" />
        <line x1="20" y1="180" x2="280" y2="180" />
      </g>

      <path
        d="M 50 100 Q 80 40 110 100 T 170 100 Q 200 160 230 100"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      <g stroke="currentColor" strokeWidth="1" opacity="0.6">
        <circle cx="95" cy="80" r="1.5" />
        <circle cx="100" cy="110" r="1.5" />
        <circle cx="205" cy="115" r="1.5" />
        <circle cx="210" cy="85" r="1.5" />
        <path d="M 120 70 l 30 15 m 0 0 l -15 25" strokeDasharray="3 3" />
        <path d="M 180 130 l -30 -15 m 0 0 l 15 -25" strokeDasharray="3 3" />
      </g>

      <g>
        <circle cx="150" cy="100" r="15" fill="white" stroke="currentColor" strokeWidth="2" />
        <path d="M 145 100 L 155 100 M 150 95 L 150 105" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="150" cy="100" r="3" fill="currentColor" />
      </g>

      <g fill="currentColor" fontFamily="monospace" fontSize="7" opacity="0.8">
        <text x="25" y="15">F1</text>
        <text x="140" y="15">HZ</text>
        <text x="260" y="15">MM</text>
        <text x="25" y="195">X</text>
        <text x="140" y="195">Y</text>
        <text x="260" y="195">Z</text>
      </g>
    </svg>
  );
}
