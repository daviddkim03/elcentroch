/** The ring of ㅇ, for 엘 and for "center", with an open door. `public/icon.svg` is the same shape. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <path
        d="M40 55.7V36a8 8 0 0 0-16 0v19.7A25 25 0 1 1 40 55.7Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
