import { createRoot } from "react-dom/client";

import styles from "./style.css";
import HeaderSection from "./HeaderSection";
import { ThemeProvider, useTheme } from "./Context";

if (process.env.NODE_ENV === "development") {
  styles.use();
}

export default function FrontPage() {
  const { isDarkMode } = useTheme();
  return (
    <div className={isDarkMode ? "dark-mode" : ""}>
      <HeaderSection />
    </div>
  );
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<ThemeProvider><FrontPage /></ThemeProvider>);
