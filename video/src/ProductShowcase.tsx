import { AbsoluteFill, Series } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { CTAScene } from "./scenes/CTAScene";

export const ProductShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <Series>
        {/* Scene 1: Logo + Intro (0-6s = 180 frames) */}
        <Series.Sequence durationInFrames={180}>
          <IntroScene />
        </Series.Sequence>

        {/* Scene 2: Dashboard showcase (6-16s = 300 frames) */}
        <Series.Sequence durationInFrames={300}>
          <DashboardScene />
        </Series.Sequence>

        {/* Scene 3: Feature highlights (16-24s = 240 frames) */}
        <Series.Sequence durationInFrames={240}>
          <FeaturesScene />
        </Series.Sequence>

        {/* Scene 4: Stats + CTA (24-30s = 180 frames) */}
        <Series.Sequence durationInFrames={180}>
          <CTAScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
