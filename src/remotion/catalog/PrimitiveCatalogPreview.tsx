import type { FC } from "react";
import { AbsoluteFill } from "remotion";

import { BarChart } from "../primitives/charts/BarChart";
import LineChart from "../primitives/charts/LineChart";
import PieChart from "../primitives/charts/PieChart";
import DonutChart from "../primitives/charts/DonutChart";
import AreaChart from "../primitives/charts/AreaChart";
import ProgressBars from "../primitives/charts/ProgressBars";
import StatCounter from "../primitives/charts/StatCounter";
import ComparisonChart from "../primitives/charts/ComparisonChart";
import CircularProgress from "../primitives/charts/CircularProgress";
import AnimatedText from "../primitives/text/AnimatedText";
import BounceText from "../primitives/text/BounceText";
import BubblePopText from "../primitives/text/BubblePopText";
import FloatingBubbleText from "../primitives/text/FloatingBubbleText";
import GlitchText from "../primitives/text/GlitchText";
import { PoppingText } from "../primitives/text/PoppingText";
import PulsingText from "../primitives/text/PulsingText";
import SlideText from "../primitives/text/SlideText";
import TypewriterSubtitle from "../primitives/text/TypewriterSubtitle";
import AnimatedList from "../primitives/scenes/AnimatedList";
import CardFlip from "../primitives/scenes/CardFlip";
import CountdownTimer from "../primitives/scenes/CountdownTimer";
import NotificationPop from "../primitives/scenes/NotificationPop";
import ParticleExplosion from "../primitives/scenes/ParticleExplosion";
import ProgressSteps from "../primitives/scenes/ProgressSteps";
import RotatingCarousel from "../primitives/scenes/RotatingCarousel";
import SoundWave from "../primitives/scenes/SoundWave";
import TextHighlight from "../primitives/scenes/TextHighlight";
import BokehCircles from "../primitives/backgrounds/BokehCircles";
import GeometricPatterns from "../primitives/backgrounds/GeometricPatterns";
import { GradientShiftBackground } from "../primitives/backgrounds/GradientShiftBackground";
import GridPulse from "../primitives/backgrounds/GridPulse";
import LiquidWave from "../primitives/backgrounds/LiquidWave";
import MatrixRain from "../primitives/backgrounds/MatrixRain";
import NoiseGrain from "../primitives/backgrounds/NoiseGrain";
import PixelTransition from "../primitives/backgrounds/PixelTransition";
import Starfield from "../primitives/backgrounds/Starfield";
import CameraShake from "../primitives/cinematic/CameraShake";
import FilmBurn from "../primitives/cinematic/FilmBurn";
import KenBurns from "../primitives/cinematic/KenBurns";
import LetterboxReveal from "../primitives/cinematic/LetterboxReveal";
import ParallaxPan from "../primitives/cinematic/ParallaxPan";
import SpotlightReveal from "../primitives/cinematic/SpotlightReveal";
import VignettePulse from "../primitives/cinematic/VignettePulse";
import WhipPan from "../primitives/cinematic/WhipPan";
import ZoomPulse from "../primitives/cinematic/ZoomPulse";
import BlindsTransition from "../primitives/transitions/BlindsTransition";
import ClockWipe from "../primitives/transitions/ClockWipe";
import { CrossDissolve } from "../primitives/transitions/CrossDissolve";
import FadeThroughBlack from "../primitives/transitions/FadeThroughBlack";
import IrisTransition from "../primitives/transitions/IrisTransition";
import MorphTransition from "../primitives/transitions/MorphTransition";
import PushTransition from "../primitives/transitions/PushTransition";
import SlideWipe from "../primitives/transitions/SlideWipe";
import ZoomThrough from "../primitives/transitions/ZoomThrough";
import LogoBlurReveal from "../primitives/logos/LogoBlurReveal";
import LogoBounceDrop from "../primitives/logos/LogoBounceDrop";
import { LogoFadeReveal } from "../primitives/logos/LogoFadeReveal";
import LogoGlitchReveal from "../primitives/logos/LogoGlitchReveal";
import LogoScaleRotate from "../primitives/logos/LogoScaleRotate";
import LogoSpinReveal from "../primitives/logos/LogoSpinReveal";
import LogoSplitReveal from "../primitives/logos/LogoSplitReveal";
import LogoStrokeDraw from "../primitives/logos/LogoStrokeDraw";
import LogoTypewriter from "../primitives/logos/LogoTypewriter";
import ChapterTitle from "../primitives/scenes/ChapterTitle";
import CinematicTitleIntro from "../primitives/scenes/CinematicTitleIntro";
import CountdownIntro from "../primitives/scenes/CountdownIntro";
import CreditsRoll from "../primitives/scenes/CreditsRoll";
import EndCard from "../primitives/scenes/EndCard";
import LowerThird from "../primitives/scenes/LowerThird";
import QuoteCard from "../primitives/scenes/QuoteCard";
import SubscribeReminder from "../primitives/scenes/SubscribeReminder";
import TitleSplit from "../primitives/scenes/TitleSplit";
import { GalleryGrid } from "../primitives/media/GalleryGrid";
import ImageCarousel from "../primitives/media/ImageCarousel";
import ImageComparisonSlider from "../primitives/media/ImageComparisonSlider";
import ImageZoomReveal from "../primitives/media/ImageZoomReveal";
import MasonryGallery from "../primitives/media/MasonryGallery";
import PhotoStack from "../primitives/media/PhotoStack";
import PictureInPicture from "../primitives/media/PictureInPicture";
import PolaroidFrame from "../primitives/media/PolaroidFrame";
import SplitScreen from "../primitives/media/SplitScreen";
import {
  defaultPrimitiveCatalogId,
  primitiveCatalog,
  type PrimitiveCatalogId,
} from "./primitive-catalog";

export type PrimitiveCatalogPreviewProps = {
  selectedId?: PrimitiveCatalogId;
};

const catalogLabels = new Map(primitiveCatalog.map((entry) => [entry.id, entry.label]));

const renderPrimitive = (selectedId: PrimitiveCatalogId) => {
  if (selectedId === "rve-chart-animation") {
    return <BarChart />;
  }

  if (selectedId === "rve-line-chart") {
    return <LineChart />;
  }

  if (selectedId === "rve-pie-chart") {
    return <PieChart />;
  }

  if (selectedId === "rve-donut-chart") {
    return <DonutChart />;
  }

  if (selectedId === "rve-area-chart") {
    return <AreaChart />;
  }

  if (selectedId === "rve-progress-bars") {
    return <ProgressBars />;
  }

  if (selectedId === "rve-stat-counter") {
    return <StatCounter />;
  }

  if (selectedId === "rve-comparison-chart") {
    return <ComparisonChart />;
  }

  if (selectedId === "rve-circular-progress") {
    return <CircularProgress />;
  }

  if (selectedId === "rve-animated-text") {
    return <AnimatedText />;
  }

  if (selectedId === "rve-bounce-text") {
    return <BounceText />;
  }

  if (selectedId === "rve-bubble-pop-text") {
    return <BubblePopText />;
  }

  if (selectedId === "rve-floating-bubble-text") {
    return <FloatingBubbleText />;
  }

  if (selectedId === "rve-glitch-text") {
    return <GlitchText />;
  }

  if (selectedId === "rve-popping-text") {
    return <PoppingText />;
  }

  if (selectedId === "rve-pulsing-text") {
    return <PulsingText />;
  }

  if (selectedId === "rve-slide-text") {
    return <SlideText />;
  }

  if (selectedId === "rve-typewriter-subtitle") {
    return <TypewriterSubtitle />;
  }

  if (selectedId === "rve-animated-list") {
    return <AnimatedList />;
  }

  if (selectedId === "rve-card-flip") {
    return <CardFlip />;
  }

  if (selectedId === "rve-countdown-timer") {
    return <CountdownTimer />;
  }

  if (selectedId === "rve-notification-pop") {
    return <NotificationPop />;
  }

  if (selectedId === "rve-particle-explosion") {
    return <ParticleExplosion />;
  }

  if (selectedId === "rve-progress-steps") {
    return <ProgressSteps />;
  }

  if (selectedId === "rve-rotating-carousel") {
    return <RotatingCarousel />;
  }

  if (selectedId === "rve-sound-wave") {
    return <SoundWave />;
  }

  if (selectedId === "rve-text-highlight") {
    return <TextHighlight />;
  }

  if (selectedId === "rve-bokeh-circles") {
    return <BokehCircles />;
  }

  if (selectedId === "rve-geometric-patterns") {
    return <GeometricPatterns />;
  }

  if (selectedId === "rve-gradient-shift") {
    return <GradientShiftBackground />;
  }

  if (selectedId === "rve-grid-pulse") {
    return <GridPulse />;
  }

  if (selectedId === "rve-liquid-wave") {
    return <LiquidWave />;
  }

  if (selectedId === "rve-matrix-rain") {
    return <MatrixRain />;
  }

  if (selectedId === "rve-noise-grain") {
    return <NoiseGrain />;
  }

  if (selectedId === "rve-pixel-transition") {
    return <PixelTransition />;
  }

  if (selectedId === "rve-starfield") {
    return <Starfield />;
  }

  if (selectedId === "rve-camera-shake") {
    return <CameraShake />;
  }

  if (selectedId === "rve-film-burn") {
    return <FilmBurn />;
  }

  if (selectedId === "rve-ken-burns") {
    return <KenBurns />;
  }

  if (selectedId === "rve-letterbox-reveal") {
    return <LetterboxReveal />;
  }

  if (selectedId === "rve-parallax-pan") {
    return <ParallaxPan />;
  }

  if (selectedId === "rve-spotlight-reveal") {
    return <SpotlightReveal />;
  }

  if (selectedId === "rve-vignette-pulse") {
    return <VignettePulse />;
  }

  if (selectedId === "rve-whip-pan") {
    return <WhipPan />;
  }

  if (selectedId === "rve-zoom-pulse") {
    return <ZoomPulse />;
  }

  if (selectedId === "rve-blinds-transition") {
    return <BlindsTransition />;
  }

  if (selectedId === "rve-clock-wipe") {
    return <ClockWipe />;
  }

  if (selectedId === "rve-cross-dissolve") {
    return <CrossDissolve />;
  }

  if (selectedId === "rve-fade-through-black") {
    return <FadeThroughBlack />;
  }

  if (selectedId === "rve-iris-transition") {
    return <IrisTransition />;
  }

  if (selectedId === "rve-morph-transition") {
    return <MorphTransition />;
  }

  if (selectedId === "rve-push-transition") {
    return <PushTransition />;
  }

  if (selectedId === "rve-slide-wipe") {
    return <SlideWipe />;
  }

  if (selectedId === "rve-zoom-through") {
    return <ZoomThrough />;
  }

  if (selectedId === "rve-logo-blur-reveal") {
    return <LogoBlurReveal />;
  }

  if (selectedId === "rve-logo-bounce-drop") {
    return <LogoBounceDrop />;
  }

  if (selectedId === "rve-logo-fade-reveal") {
    return <LogoFadeReveal />;
  }

  if (selectedId === "rve-logo-glitch-reveal") {
    return <LogoGlitchReveal />;
  }

  if (selectedId === "rve-logo-scale-rotate") {
    return <LogoScaleRotate />;
  }

  if (selectedId === "rve-logo-spin-reveal") {
    return <LogoSpinReveal />;
  }

  if (selectedId === "rve-logo-split-reveal") {
    return <LogoSplitReveal />;
  }

  if (selectedId === "rve-logo-stroke-draw") {
    return <LogoStrokeDraw />;
  }

  if (selectedId === "rve-logo-typewriter") {
    return <LogoTypewriter />;
  }

  if (selectedId === "rve-chapter-title") {
    return <ChapterTitle />;
  }

  if (selectedId === "rve-cinematic-title-intro") {
    return <CinematicTitleIntro />;
  }

  if (selectedId === "rve-countdown-intro") {
    return <CountdownIntro />;
  }

  if (selectedId === "rve-credits-roll") {
    return <CreditsRoll />;
  }

  if (selectedId === "rve-end-card") {
    return <EndCard />;
  }

  if (selectedId === "rve-lower-third") {
    return <LowerThird />;
  }

  if (selectedId === "rve-quote-card") {
    return <QuoteCard />;
  }

  if (selectedId === "rve-subscribe-reminder") {
    return <SubscribeReminder />;
  }

  if (selectedId === "rve-title-split") {
    return <TitleSplit />;
  }

  if (selectedId === "rve-gallery-grid") {
    return <GalleryGrid />;
  }

  if (selectedId === "rve-image-carousel") {
    return <ImageCarousel />;
  }

  if (selectedId === "rve-image-comparison-slider") {
    return <ImageComparisonSlider />;
  }

  if (selectedId === "rve-image-zoom-reveal") {
    return <ImageZoomReveal />;
  }

  if (selectedId === "rve-masonry-gallery") {
    return <MasonryGallery />;
  }

  if (selectedId === "rve-photo-stack") {
    return <PhotoStack />;
  }

  if (selectedId === "rve-picture-in-picture") {
    return <PictureInPicture />;
  }

  if (selectedId === "rve-polaroid-frame") {
    return <PolaroidFrame />;
  }

  if (selectedId === "rve-split-screen") {
    return <SplitScreen />;
  }

  return <PoppingText />;
};

export const PrimitiveCatalogPreview: FC<PrimitiveCatalogPreviewProps> = ({
  selectedId = defaultPrimitiveCatalogId,
}) => {
  const label = catalogLabels.get(selectedId) ?? catalogLabels.get(defaultPrimitiveCatalogId);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617" }}>
      {renderPrimitive(selectedId)}
      <div
        style={{
          background: "rgba(2, 6, 23, 0.72)",
          border: "1px solid rgba(248, 250, 252, 0.2)",
          borderRadius: 8,
          bottom: 24,
          color: "#f8fafc",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 700,
          left: 24,
          letterSpacing: 0,
          padding: "10px 14px",
          position: "absolute",
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};
