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
const SIDEBAR_BG = "#222628";
const SIDEBAR_SELECTED = "#111314";

const SidebarItem: React.FC<{
  label: string;
  active?: boolean;
  delay: number;
}> = ({ label, active, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14 } });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const x = interpolate(s, [0, 1], [-30, 0]);

  return (
    <div
      style={{
        padding: "10px 16px",
        borderRadius: 8,
        backgroundColor: active ? SIDEBAR_SELECTED : "transparent",
        color: active ? ORANGE : "#9ca3af",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "system-ui, sans-serif",
        opacity,
        transform: `translateX(${x}px)`,
      }}
    >
      {label}
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  color: string;
  delay: number;
}> = ({ label, value, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12 } });
  const scale = interpolate(s, [0, 1], [0.8, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <div
      style={{
        backgroundColor: "#1a1d21",
        borderRadius: 16,
        padding: "24px 28px",
        border: "1px solid #2a2d31",
        transform: `scale(${scale})`,
        opacity,
        flex: 1,
      }}
    >
      <p
        style={{
          fontSize: 13,
          color: "#6b7280",
          margin: 0,
          marginBottom: 8,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 32,
          fontWeight: 700,
          color,
          margin: 0,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {value}
      </p>
    </div>
  );
};

const TableRow: React.FC<{
  tracking: string;
  carrier: string;
  status: string;
  statusColor: string;
  delay: number;
}> = ({ tracking, carrier, status, statusColor, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14 } });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [20, 0]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 20px",
        borderBottom: "1px solid #1f2227",
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ flex: 2 }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 14,
            color: "white",
            fontWeight: 500,
          }}
        >
          {tracking}
        </span>
      </div>
      <div style={{ flex: 1, fontSize: 14, color: "#9ca3af" }}>{carrier}</div>
      <div style={{ flex: 1 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: statusColor,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: statusColor,
            }}
          />
          {status}
        </span>
      </div>
    </div>
  );
};

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const enterOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterScale = interpolate(frame, [0, 20], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [270, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor animation
  const cursorX = interpolate(frame, [100, 140, 180, 220], [400, 700, 900, 600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [100, 140, 180, 220], [300, 250, 400, 350], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorOpacity = interpolate(frame, [90, 100, 230, 250], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: DARK_BG,
        opacity: enterOpacity * exitOpacity,
        transform: `scale(${enterScale})`,
      }}
    >
      {/* Browser mockup */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 100,
          right: 100,
          bottom: 60,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #2a2d31",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          display: "flex",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 220,
            backgroundColor: SIDEBAR_BG,
            padding: "20px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Logo placeholder */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: ORANGE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: 16, fontWeight: 700 }}>D</span>
            </div>
            <span
              style={{
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Delivery Tracker
            </span>
          </div>

          <SidebarItem label="📊 Tableau de bord" active delay={5} />
          <SidebarItem label="📦 Colis" delay={10} />
          <SidebarItem label="👥 Clients" delay={15} />
          <SidebarItem label="🔔 Notifications" delay={20} />
          <SidebarItem label="📈 Analytique" delay={25} />
          <SidebarItem label="💰 Finance" delay={30} />
          <SidebarItem label="⚙️ Paramètres" delay={35} />
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#111318",
            padding: 30,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "white",
                margin: 0,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Tableau de bord
            </h2>
            <div
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                backgroundColor: ORANGE,
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              + Ajouter un colis
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", gap: 16 }}>
            <StatCard label="Total Colis" value="1,247" color="white" delay={40} />
            <StatCard label="En Transit" value="342" color={BLUE} delay={50} />
            <StatCard label="Livrés" value="856" color="#22c55e" delay={60} />
            <StatCard label="Taux de livraison" value="94.2%" color={ORANGE} delay={70} />
          </div>

          {/* Table */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#15181c",
              borderRadius: 12,
              border: "1px solid #1f2227",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #1f2227",
                fontSize: 12,
                color: "#6b7280",
                fontWeight: 600,
                textTransform: "uppercase" as const,
                letterSpacing: 1,
                display: "flex",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <div style={{ flex: 2 }}>Numéro de suivi</div>
              <div style={{ flex: 1 }}>Transporteur</div>
              <div style={{ flex: 1 }}>Statut</div>
            </div>
            <TableRow tracking="YAL-2026-001234" carrier="Yalidine" status="Livré" statusColor="#22c55e" delay={80} />
            <TableRow tracking="ZR-2026-005678" carrier="ZR Express" status="En transit" statusColor={BLUE} delay={90} />
            <TableRow tracking="MAY-2026-009012" carrier="Maystro" status="En livraison" statusColor={ORANGE} delay={100} />
            <TableRow tracking="ECO-2026-007890" carrier="Ecotrack" status="En attente" statusColor="#eab308" delay={110} />
            <TableRow tracking="YAL-2026-003456" carrier="Yalidine" status="Livré" statusColor="#22c55e" delay={120} />
          </div>
        </div>
      </div>

      {/* Animated cursor */}
      <div
        style={{
          position: "absolute",
          left: cursorX,
          top: cursorY,
          opacity: cursorOpacity,
          zIndex: 100,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86h6.37c.38 0 .59-.43.35-.71L5.85 2.85c-.31-.32-.85-.1-.85.36z" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
