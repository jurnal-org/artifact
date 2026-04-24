interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={`mb-3 flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      {!isUser && (
        <span className="mb-1.5 ml-1 text-[9px] font-sans font-medium uppercase tracking-[2.5px] text-violet/55">
          Jurnal
        </span>
      )}
      <div
        className={`max-w-[80%] rounded-[18px] px-4 py-3 text-sm leading-relaxed backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] ${
          isUser
            ? "rounded-br-[4px] bg-gradient-to-br from-teal/[0.12] to-teal/[0.05] border border-teal/[0.18] text-white/68"
            : "rounded-bl-[4px] bg-gradient-to-br from-violet/[0.10] to-violet/[0.04] border border-violet/[0.16] text-white/62 font-serif italic"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
