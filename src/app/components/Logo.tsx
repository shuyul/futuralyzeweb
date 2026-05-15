interface LogoProps {
  size?: number;
  variant?: "dark" | "light";
  accent?: string;
  showZh?: boolean;
  className?: string;
}

export function Logo({
  size = 24,
  variant = "dark",
  accent = "#C4463A",
  showZh = true,
  className = "",
}: LogoProps) {
  const ink = variant === "dark" ? "#1A1A1A" : "#F8F6F2";
  const muted = variant === "dark" ? "rgba(26,26,26,0.55)" : "rgba(248,246,242,0.65)";
  const rule = variant === "dark" ? "rgba(26,26,26,0.22)" : "rgba(248,246,242,0.3)";
  const enSize = size * 0.78;
  const triSize = enSize * 0.86;
  const strokeW = Math.max(1.2, enSize * 0.075);
  const zhSize = Math.max(14, size * 0.78);

  return (
    <span
      className={`inline-flex items-center select-none ${className}`}
      aria-label="Futuralyze · 未见"
    >
      <span
        style={{
          fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: enSize,
          letterSpacing: "-0.045em",
          lineHeight: 1,
          color: ink,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <span>Futur</span>
        <svg
          viewBox="0 0 24 22"
          width={triSize}
          height={triSize * (22 / 24)}
          style={{
            margin: `0 ${enSize * 0.02}px`,
            display: "inline-block",
            transform: `translateY(${enSize * 0.04}px)`,
            overflow: "visible",
          }}
        >
          <path
            d="M12 2 L22.5 20.5 L1.5 20.5 Z"
            fill="none"
            stroke={accent}
            strokeWidth={strokeW}
            strokeLinejoin="miter"
            strokeLinecap="square"
          />
        </svg>
        <span>lyze</span>
      </span>

      {showZh && (
        <>
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 1,
              height: size * 0.72,
              background: rule,
              margin: `0 ${size * 0.38}px 0 ${size * 0.42}px`,
            }}
          />
          <span
            style={{
              fontFamily: "'Noto Serif SC', 'Songti SC', serif",
              fontWeight: 500,
              fontSize: zhSize,
              letterSpacing: "0.22em",
              paddingRight: "0.05em",
              color: ink,
              lineHeight: 1,
            }}
          >
            未见
          </span>
        </>
      )}
    </span>
  );
}
