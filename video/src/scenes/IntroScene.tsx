import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Sequence,
} from "remotion";

const ORANGE = "#f97316";
const BLUE = "#4959b4";
const DARK_BG = "#0f1114";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo circle animation
  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const logoRotation = interpolate(frame, [0, 40], [180, 0], {
    extrapolateRight: "clamp",
  });

  // Title animation
  const titleOpacity = interpolate(frame, [25, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 12 } });
  const titleTranslateY = interpolate(titleY, [0, 1], [40, 0]);

  // Subtitle animation
  const subtitleOpacity = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = spring({ frame: Math.max(0, frame - 50), fps, config: { damping: 12 } });
  const subtitleTranslateY = interpolate(subtitleY, [0, 1], [30, 0]);

  // Decorative lines animation
  const lineWidth = interpolate(frame, [60, 100], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Particles floating
  const particle1Y = interpolate(frame, [0, 180], [600, -200]);
  const particle2Y = interpolate(frame, [0, 180], [800, -100]);
  const particle3Y = interpolate(frame, [0, 180], [700, -300]);

  // Exit fade
  const exitOpacity = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ORANGE}20 0%, transparent 70%)`,
          top: -100,
          right: -100,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BLUE}20 0%, transparent 70%)`,
          bottom: -100,
          left: -100,
          filter: "blur(60px)",
        }}
      />

      {/* Floating particles */}
      {[
        { x: 200, y: particle1Y, size: 6, color: ORANGE },
        { x: 1600, y: particle2Y, size: 4, color: BLUE },
        { x: 900, y: particle3Y, size: 5, color: ORANGE },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: 0.4,
          }}
        />
      ))}

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE}dd)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
            boxShadow: `0 20px 60px ${ORANGE}40`,
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 16h6" />
            <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
            <path d="m7 12 3 3 7-7" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px)`,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: -2,
              margin: 0,
              textAlign: "center",
            }}
          >
            Delivery
            <span style={{ color: ORANGE }}> Tracker</span>
          </h1>
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)`,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleTranslateY}px)`,
          }}
        >
          <p
            style={{
              fontSize: 28,
              color: "#9ca3af",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              margin: 0,
              textAlign: "center",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Gérez vos livraisons intelligemment
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
