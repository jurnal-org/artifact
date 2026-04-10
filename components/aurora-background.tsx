"use client";

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top-left violet blob */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[100px] animate-aurora-1"
        style={{
          background: "rgba(120, 80, 220, 0.25)",
        }}
      />
      {/* Top-right teal blob */}
      <div
        className="absolute -top-20 -right-40 w-[500px] h-[700px] rounded-full blur-[120px] animate-aurora-2"
        style={{
          background: "rgba(60, 180, 160, 0.2)",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
        }}
      />
      {/* Center-left teal blob */}
      <div
        className="absolute top-1/3 -left-20 w-[400px] h-[500px] blur-[90px] animate-aurora-3"
        style={{
          background: "rgba(60, 180, 160, 0.18)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
        }}
      />
      {/* Center violet blob */}
      <div
        className="absolute top-1/2 left-1/3 w-[500px] h-[400px] blur-[110px] animate-aurora-4"
        style={{
          background: "rgba(120, 80, 220, 0.2)",
          borderRadius: "40% 60% 70% 30% / 50% 60% 40% 50%",
        }}
      />
      {/* Bottom-right violet blob */}
      <div
        className="absolute -bottom-32 -right-20 w-[550px] h-[550px] blur-[100px] animate-aurora-5"
        style={{
          background: "rgba(120, 80, 220, 0.22)",
          borderRadius: "70% 30% 50% 50% / 40% 60% 40% 60%",
        }}
      />
      {/* Bottom-left teal blob */}
      <div
        className="absolute -bottom-20 left-10 w-[450px] h-[600px] blur-[110px] animate-aurora-6"
        style={{
          background: "rgba(60, 180, 160, 0.15)",
          borderRadius: "50% 50% 30% 70% / 70% 30% 50% 50%",
        }}
      />
    </div>
  );
}
