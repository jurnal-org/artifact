interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={`mb-4 ${isUser ? "ml-10" : ""}`}>
      {!isUser && (
        <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-violet-dim">
          Jurnal
        </span>
      )}
      <div
        className={`rounded-2xl p-4 ${
          isUser
            ? "rounded-br-sm border border-teal/10 bg-teal/[0.06]"
            : "rounded-bl-sm border border-violet/10 bg-violet/[0.06]"
        }`}
      >
        <p className="text-sm leading-relaxed text-muted">{content}</p>
      </div>
    </div>
  );
}
