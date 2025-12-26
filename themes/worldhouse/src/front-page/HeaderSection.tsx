import { useTheme } from "./Context";
import { BackgroundAnimation } from "./BackgroundAnimation";
import { WorldHouseLogoSvg } from "../components/WorldHouseLogoSvg";

export default function HeaderSection() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return (
    <div className="wh-content">
      <BackgroundAnimation
        tileSize={15}
        gap={0}
        radius={50}
        riseMs={90}
        holdMs={70}
        fadeMs={260}
        bgColor={isDarkMode ? "#020305" : "#ffffff"}
        tileColor={isDarkMode ? "#0b0f14" : "#ffffff"}
        illuminateColor={isDarkMode ? "#f1f1f1" : "#999999"}
        illuminateMaxAlpha={1}
        gridLineAlpha={1}
        gridLineWidth={1}
        gridLineColor={isDarkMode ? "#ffffff" : "#000000"}
        rippleSpeed={500}
        rippleDurationMs={1000}
        rippleFadeDistance={800}
        rippleCore={2}
        rippleShoulder={3}
        rippleFadeSteps={1.5}
        rippleCoreWidth={7}
        rippleShoulderWidth={14}
        rippleStepTiles={3} // more gaps between ring positions
        rippleVariation={0.55}
        rippleHotChance={0.3}
        rippleHotBoost={0.95}
        rippleWobbleSpeed={0.6}
        variation={0.55}
      />
      <div className="wh-content-center">
        <div className="wh-logo">
          <WorldHouseLogoSvg
            gradient={
              isDarkMode ? ["#444444", "#333333"] : ["#f0f0f0", "#ffffff"]
            }
          />
        </div>
        <button
          onClick={() => {
            toggleDarkMode();
            console.log("clicked");
          }}
        >
          {isDarkMode ? "TRUE" : "FALSE"}
        </button>
        <h1>Digital, shaped by heart.</h1>
      </div>
    </div>
  );
}
