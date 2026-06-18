// A handwritten margin scrawl. Renders nothing when there's no note for the
// slot, so callers can drop it in freely. The little arrow ties it to the
// thing it's commenting on.
export default function MarginNote({ text, className = '', arrow = '↖' }) {
  if (!text) return null
  return (
    <p
      className={`scrawl pointer-events-none select-none text-base leading-tight text-margin/90 ${className}`}
      aria-hidden="true"
    >
      <span className="mr-1 not-italic opacity-70">{arrow}</span>
      {text}
    </p>
  )
}
