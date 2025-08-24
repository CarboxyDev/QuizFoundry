import { memo } from "react";

export const Background = memo(() => {
  return (
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0), radial-gradient(circle at 1px 1px, rgba(var(--primary),0.1) 1px, transparent 0)`,
        backgroundSize: "32px 32px, 48px 48px",
        backgroundPosition: "0 0, 16px 16px",
      }}
    />
  );
});

Background.displayName = "Background";
