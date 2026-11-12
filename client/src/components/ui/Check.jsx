export default function Check({ className = "" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`shrink-0 text-accent-brand ${className}`}>
      <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.12" />
      <path d="M6 10.4l2.6 2.6L14 7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
