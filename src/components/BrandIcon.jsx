// Renders an official brand mark (24x24 simple-icons path) inline.
export default function BrandIcon({ icon, className = 'h-4 w-4', color }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  )
}
