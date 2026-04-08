interface KeywordCloudProps { keywords: { keyword: string; count: number }[]; }
export function KeywordCloud({ keywords }: KeywordCloudProps) {
  const maxCount = Math.max(...keywords.map((k) => k.count), 1);
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map(({ keyword, count }) => {
        const opacity = 0.4 + (count / maxCount) * 0.6;
        return (
          <span key={keyword} className="rounded-full border border-violet/15 bg-violet/10 px-3 py-1 text-xs text-violet-light" style={{ opacity }}>
            {keyword}<span className="ml-1 text-muted-foreground">{count}</span>
          </span>
        );
      })}
    </div>
  );
}
