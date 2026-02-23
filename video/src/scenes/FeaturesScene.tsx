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

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * 20;
  const s = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 12 },
  });

  const scale = interpolate(s, [0, 1], [0.7, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [40, 0]);

  // Subtle floating
  const float = Math.sin((frame - delay) * 0.05) * 3;

  return (
    <div
      style={{
        width: 380,
        backgroundColor: "#15181c",
        borderRadius: 20,
        padding: 36,
        border: `1px solid #2a2d31`,
        transform: `scale(${scale}) translateY(${y + float}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          backgroundColor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "white",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: 15,
          color: "#9ca3af",
          margin: 0,
          lineHeight: 1.6,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {description}
      </p>

      {/* Accent line */}
      <div
        style={{
          width: 50,
          height: 3,
          borderRadius: 2,
          backgroundColor: color,
          marginTop: 4,
        }}
      />
    </div>
  );
};

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const features = [
    {
      icon: "📦",
      title: "Suivi Multi-Transporteurs",
      description:
        "Yalidine, ZR Express, Maystro, Ecotrack — tous vos colis dans un seul tableau de bord",
      color: ORANGE,
    },
    {
      icon: "👥",
      title: "Gestion Clients",
      description:
        "Base clients complète avec historique, taux de livraison et scoring VIP automatique",
      color: BLUE,
    },
    {
      icon: "📊",
      title: "Analytique Avancée",
      description:
        "KPIs en temps réel, prédictions IA des retours et recommandations d'optimisation",
      color: "#22c55e",
    },
    {
      icon: "💰",
      title: "Finance & Facturation",
      description:
        "Suivi des paiements transporteurs, calcul COD automatique et rapprochement bancaire",
      color: "#a855f7",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Background elements */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ORANGE}08 0%, transparent 60%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <h2
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: "white",
            margin: 0,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Tout ce dont vous avez besoin
        </h2>
        <p
          style={{
            fontSize: 20,
            color: "#6b7280",
            margin: "12px 0 0",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Une plateforme complète pour votre e-commerce
        </p>
      </div>

      {/* Feature cards grid */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 80,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1700,
        }}
      >
        {features.map((feature, i) => (
          <FeatureCard key={i} {...feature} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
