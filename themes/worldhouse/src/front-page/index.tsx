import { createRoot } from "react-dom/client";

import styles from "./style.css";
import { BackgroundAnimation } from "./BackgroundAnimation";
import { WorldHouseLogoSvg } from "../components/WorldHouseLogoSvg";

if (process.env.NODE_ENV === "development") {
  styles.use();
}

export default function FrontPage() {
  return (
    <>
      <BackgroundAnimation
        tileSize={15}
        gap={0}
        radius={50}
        riseMs={90}
        holdMs={70}
        fadeMs={260}
        bgColor="#020305"
        tileColor="#0b0f14"
        illuminateColor="#f1f1f1"
        illuminateMaxAlpha={0.9}
        gridLineAlpha={0.5}
        gridLineWidth={1}
        
        rippleSpeed={600}
        rippleDurationMs={1200} // further
        rippleFadeDistance={1000}
        rippleCore={2}
        rippleShoulder={3}
        rippleFadeSteps={1.5}
        rippleCoreWidth={7}
        rippleShoulderWidth={14}
        rippleStepTiles={3} // more gaps between ring positions
        rippleVariation={0.55}
        rippleHotChance={0.50}
        rippleHotBoost={0.95}
        rippleWobbleSpeed={0.6}

        variation={0.55}
      />

      <main className="wh-main">
        {/* your site */}
        <div className="wh-logo">
          <WorldHouseLogoSvg />
        </div>
      </main>
    </>
  );
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<FrontPage />);
