interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 3 concentric circles representing voice/pulse/waves */}
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="3" opacity="0.6" />
      <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="4" />
    </svg>
  )
}

