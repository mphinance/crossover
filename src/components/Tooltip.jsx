import { useState, useId } from 'react'

// Lightweight, accessible tooltip. Hover/focus reveals a help bubble.
export default function Tooltip({ label = 'More info', children }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="ml-1 grid h-4 w-4 place-items-center rounded-full bg-mist text-[10px] font-bold text-slatey hover:bg-rule focus:outline-none focus:ring-2 focus:ring-target"
      >
        ?
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs leading-relaxed text-paper shadow-lg"
        >
          {children}
        </span>
      )}
    </span>
  )
}
