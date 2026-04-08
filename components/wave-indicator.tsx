"use client";

export function WaveIndicator() {
  return (
    <div className="flex items-center gap-[3px] h-10">
      {[12, 24, 36, 28, 18, 32, 14].map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-sm"
          style={{
            height: `${h}px`,
            background:
              "linear-gradient(to top, rgba(120,80,220,0.6), rgba(60,180,160,0.8))",
            animation: `wave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
