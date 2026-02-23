import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

const ORANGE = "#f97316";
const BLUE = "#4959b4";
const DARK_BG = "#0f1114";

const AnimatedCounter: React.FC<{
  target: number;
  suffix?: string;
  delay: number;
}> = ({ target, suffix = "", delay }) => {
  const frame = useCurrentFrame();
  const value = interpolate(
    frame,
    [delay, delay + 60],
    [0, target],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <span>
      {Math.round(value).toLocaleString()}
      {suffix}
    </span>
  );
};

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Stats entrance
  const statsOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA entrance
  const ctaSpring = spring({
    frame: Math.max(0, frame - 70),
    fps,
    config: { damping: 10 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.8, 1]);
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);

  // Button pulse
  const pulse = Math.sin(frame * 0.08) * 0.03 + 1;

  // Background ring animation
  const ringScale = interpolate(frame, [0, 180], [0.5, 1.5], {
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(frame, [0, 120, 180], [0.15, 0.05, 0], {
    extrapolateRight: "clamp",
  });

  const stats = [
    { label: "Colis suivis", value: 50000, suffix: "+", color: ORANGE, delay: 10 },
    { label: "Taux de livraison", value: 94, suffix: "%", color: "#22c55e", delay: 20 },
    { label: "Transporteurs", value: 8, suffix: "+", color: BLUE, delay: 30 },
    { label: "Temps économisé", value: 70, suffix: "%", color: "#a855f7", delay: 40 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Animated background ring */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          border: `2px solid ${ORANGE}`,
          opacity: ringOpacity,
          transform: `scale(${ringScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `1px solid ${BLUE}`,
          opacity: ringOpacity * 0.7,
          transform: `scale(${ringScale * 0.9})`,
        }}
      />

      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ORANGE}15 0%, transparent 70%)`,
          top: 100,
          right: 200,
          filter: "blur(40px)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 50,
          zIndex: 1,
        }}
      >
        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 60,
            opacity: statsOpacity,
          }}
        >
          {stats.map((stat, i) => {
            const s = spring({
              frame: Math.max(0, frame - stat.delay),
              fps,
              config: { damping: 12 },
            });
            const y = interpolate(s, [0, 1], [30, 0]);

            return (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  transform: `translateY(${y}px)`,
                  opacity: interpolate(s, [0, 1], [0, 1]),
                }}
              >
                <p
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: stat.color,
                    margin: 0,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    delay={stat.delay}
                  />
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: "#6b7280",
                    margin: "8px 0 0",
                    fontFamily: "system-ui, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            opacity: ctaOpacity,
            transform: `scale(${ctaScale})`,
          }}
        >
          <h2
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "white",
              margin: 0,
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
              letterSpacing: -1,
            }}
          >
            Prêt à optimiser vos
            <br />
            <span style={{ color: ORANGE }}>livraisons</span> ?
          </h2>

          <p
            style={{
              fontSize: 20,
              color: "#9ca3af",
              margin: 0,
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
            }}
          >
            Rejoignez les e-commerçants qui font confiance à Delivery Tracker
          </p>

          {/* CTA Button */}
          <div
            style={{
              marginTop: 12,
              padding: "18px 48px",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`,
              color: "white",
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
              transform: `scale(${pulse})`,
              boxShadow: `0 20px 50px ${ORANGE}40`,
              letterSpacing: 0.5,
            }}
          >
            Commencer gratuitement →
          </div>
        </div>

        {/* URL */}
        <p
          style={{
            fontSize: 16,
            color: "#4b5563",
            margin: 0,
            fontFamily: "system-ui, sans-serif",
            opacity: ctaOpacity,
            letterSpacing: 2,
          }}
        >
          deliverytracker.tn
        </p>
      </div>
    </AbsoluteFill>
  );
};
