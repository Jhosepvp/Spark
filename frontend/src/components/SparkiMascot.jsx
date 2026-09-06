export function SparkiMascot({ className = "", animated = true }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Sparki, la ovejita de Spark"
    >
      <ellipse cx="100" cy="120" rx="62" ry="46" fill="var(--color-surface-2)" />
      <circle cx="60" cy="95" r="22" fill="var(--color-surface-2)" />
      <circle cx="140" cy="95" r="22" fill="var(--color-surface-2)" />
      <circle cx="100" cy="80" r="20" fill="var(--color-surface-2)" />
      <circle cx="130" cy="75" r="20" fill="var(--color-surface-2)" />
      <circle cx="70" cy="75" r="20" fill="var(--color-surface-2)" />

      <ellipse cx="100" cy="128" rx="38" ry="30" fill="#e7e7ea" />

      <circle cx="86" cy="122" r="4.5" fill="var(--color-bg)">
        {animated && (
          <animate
            attributeName="ry"
            values="4.5;0.5;4.5"
            keyTimes="0;0.5;1"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="114" cy="122" r="4.5" fill="var(--color-bg)">
        {animated && (
          <animate
            attributeName="ry"
            values="4.5;0.5;4.5"
            keyTimes="0;0.5;1"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <path
        d="M92 136 q8 7 16 0"
        stroke="var(--color-bg)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      <ellipse cx="66" cy="118" rx="6" ry="8" fill="#d8b8c4" opacity="0.6" />
      <ellipse cx="134" cy="118" rx="6" ry="8" fill="#d8b8c4" opacity="0.6" />
    </svg>
  );
}
