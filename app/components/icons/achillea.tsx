export const AchilleaIcon = () => (
  <svg
    className="logo h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Achillea logo"
  >
    {/* stem */}
    <path
      d="M12 3V21"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    {/* upper branching (tight, symmetric) */}
    <path
      d="M12 7C14 7 15.6 6.2 17.2 4.8"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <path
      d="M12 7C10 7 8.4 6.2 6.8 4.8"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    {/* lower branching (wider, suggests growth/flow) */}
    <path
      d="M12 12C15 12 17.2 13.6 18.9 16"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      opacity={0.9}
    />
    <path
      d="M12 12C9 12 6.8 13.6 5.1 16"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      opacity={0.9}
    />
    {/* nodes (reduced + consistent) */}
    <circle cx="12" cy="7" r="1" fill="currentColor" />
    <circle cx="17.2" cy="4.8" r="0.9" fill="currentColor" />
    <circle cx="6.8" cy="4.8" r="0.9" fill="currentColor" />
    <circle cx="18.9" cy="16" r="0.9" fill="currentColor" opacity={0.75} />
    <circle cx="5.1" cy="16" r="0.9" fill="currentColor" opacity={0.75} />
  </svg>
)
