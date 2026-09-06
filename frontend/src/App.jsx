import { useCallback, useState } from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import LogoIntro, { shouldShowLogoIntro } from "./components/LogoIntro/LogoIntro.jsx";
import { ToastProvider } from "./components/common/ToastProvider.jsx";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => shouldShowLogoIntro());
  const [introComplete, setIntroComplete] = useState(false);
  const completeIntro = useCallback(() => {
    setShowIntro(false);
    setIntroComplete(true);
  }, []);

  return (
    <ToastProvider>
    <div className={introComplete ? "impactx-intro-complete" : ""}>
      <AppRoutes />
      {showIntro && <LogoIntro onComplete={completeIntro} />}
    </div>
    </ToastProvider>
  );
}
