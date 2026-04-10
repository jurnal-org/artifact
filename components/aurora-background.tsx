"use client";

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base dark wash to unify colors */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Top-left violet glow */}
      <div
        className="absolute -top-48 -left-48 w-[800px] h-[800px] rounded-full animate-aurora-1 will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(120, 80, 220, 0.14) 0%, rgba(120, 80, 220, 0.05) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Top-right teal glow */}
      <div
        className="absolute -top-32 -right-56 w-[700px] h-[900px] animate-aurora-2 will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse, rgba(60, 180, 160, 0.12) 0%, rgba(60, 180, 160, 0.04) 40%, transparent 70%)",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          filter: "blur(90px)",
        }}
      />
      {/* Center-left teal glow */}
      <div
        className="absolute top-1/3 -left-32 w-[600px] h-[700px] animate-aurora-3 will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse, rgba(60, 180, 160, 0.10) 0%, rgba(60, 180, 160, 0.03) 40%, transparent 70%)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(80px)",
        }}
      />
      {/* Center violet glow */}
      <div
        className="absolute top-1/2 left-1/3 w-[700px] h-[600px] animate-aurora-4 will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse, rgba(120, 80, 220, 0.11) 0%, rgba(120, 80, 220, 0.04) 40%, transparent 70%)",
          borderRadius: "40% 60% 70% 30% / 50% 60% 40% 50%",
          filter: "blur(100px)",
        }}
      />
      {/* Bottom-right violet glow */}
      <div
        className="absolute -bottom-48 -right-32 w-[750px] h-[750px] animate-aurora-5 will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(120, 80, 220, 0.12) 0%, rgba(120, 80, 220, 0.04) 40%, transparent 70%)",
          borderRadius: "70% 30% 50% 50% / 40% 60% 40% 60%",
          filter: "blur(90px)",
        }}
      />
      {/* Bottom-left teal glow */}
      <div
        className="absolute -bottom-32 left-0 w-[650px] h-[800px] animate-aurora-6 will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse, rgba(60, 180, 160, 0.08) 0%, rgba(60, 180, 160, 0.03) 40%, transparent 70%)",
          borderRadius: "50% 50% 30% 70% / 70% 30% 50% 50%",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}
