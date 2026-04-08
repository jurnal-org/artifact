"use client";

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute -top-20 -left-10 -right-10 h-72 blur-[60px] animate-pulse"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, rgba(120, 80, 220, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 30%, rgba(60, 180, 160, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(200, 100, 150, 0.07) 0%, transparent 50%)`,
          animationDuration: "8s",
        }}
      />
    </div>
  );
}
