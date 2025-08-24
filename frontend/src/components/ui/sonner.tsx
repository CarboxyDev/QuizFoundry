"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme();

  const toasterStyles =
    theme === "dark"
      ? {
          "--normal-bg": "var(--card)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--card-foreground)",
          "--success-bg": "hsl(150 100% 6%)",
          "--success-border": "hsl(147 100% 12%)",
          "--success-text": "hsl(150 86% 65%)",
          "--error-bg": "hsl(358 76% 10%)",
          "--error-border": "hsl(357 89% 16%)",
          "--error-text": "hsl(358 100% 81%)",
          "--warning-bg": "hsl(64 100% 6%)",
          "--warning-border": "hsl(60 100% 12%)",
          "--warning-text": "hsl(46 87% 65%)",
          "--info-bg": "hsl(215 100% 6%)",
          "--info-border": "hsl(223 100% 12%)",
          "--info-text": "hsl(216 87% 65%)",
          "--primary-bg": "hsl(var(--primary) / 0.1)",
          "--primary-border": "hsl(var(--primary) / 0.2)",
          "--primary-text": "hsl(var(--primary))",
        }
      : {
          "--normal-bg": "var(--card)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--card-foreground)",
          "--success-bg": "hsl(143 85% 96%)",
          "--success-border": "hsl(145 92% 91%)",
          "--success-text": "hsl(140 100% 27%)",
          "--error-bg": "hsl(0 86% 97%)",
          "--error-border": "hsl(0 84% 90%)",
          "--error-text": "hsl(0 74% 42%)",
          "--warning-bg": "hsl(48 96% 89%)",
          "--warning-border": "hsl(48 96% 76%)",
          "--warning-text": "hsl(25 95% 53%)",
          "--info-bg": "hsl(214 100% 97%)",
          "--info-border": "hsl(214 95% 93%)",
          "--info-text": "hsl(214 84% 56%)",
          "--primary-bg": "hsl(var(--primary) / 0.1)",
          "--primary-border": "hsl(var(--primary) / 0.2)",
          "--primary-text": "hsl(var(--primary))",
        };

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={toasterStyles as React.CSSProperties}
      {...props}
    />
  );
};

export { Toaster };
