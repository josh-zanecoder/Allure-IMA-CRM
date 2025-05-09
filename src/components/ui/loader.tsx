import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  message?: string;
}

export default function Loader({
  size = "md",
  fullPage = true,
  message,
}: LoaderProps) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logoSrc, setLogoSrc] = useState("/allure-logo-dark-sm.png"); // Default logo for SSR

  useEffect(() => {
    setIsVisible(true);
    let currentProgress = 0;

    const incrementProgress = () => {
      if (currentProgress < 100) {
        currentProgress += 1.5; // Increased increment step
        setProgress(currentProgress);
        setTimeout(incrementProgress, 10); // Reduced delay
      }
    };

    incrementProgress();
    return () => setIsVisible(false);
  }, []);

  // Only change the logo after hydration on the client side
  useEffect(() => {
    // Update logo based on theme
    setLogoSrc(
      theme === "dark"
        ? "/allure-logo-light-sm.png"
        : "/allure-logo-dark-sm.png"
    );
  }, [theme]);

  const LoaderContent = () => (
    <div className="flex flex-col items-center gap-4 sm:gap-8">
      <Image
        src={logoSrc}
        alt="Allure IMA Logo"
        width={500}
        height={150}
        className="h-16 sm:h-24 md:h-32 w-auto [filter:contrast(1.5)_brightness(1.4)] dark:[filter:contrast(1.6)_brightness(1.5)]"
        priority
      />
      <div className="w-full max-w-[90vw] sm:max-w-[24rem] sm:w-96 h-2 sm:h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-50 ease-linear" // Faster transition
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && (
        <p className="text-xs sm:text-sm text-center text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-100 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm p-4 sm:p-6",
          "animate-in fade-in zoom-in-95 duration-300",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
          !isVisible && "opacity-0"
        )}
        data-state={isVisible ? "open" : "closed"}
      >
        <LoaderContent />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-3 sm:p-4 md:p-6",
        "animate-in fade-in zoom-in-95 duration-300",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
        !isVisible && "opacity-0"
      )}
      data-state={isVisible ? "open" : "closed"}
    >
      <LoaderContent />
    </div>
  );
}
