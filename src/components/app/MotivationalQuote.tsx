'use client';

interface MotivationalQuoteProps {
  phrase: string;
}

export function MotivationalQuote({ phrase }: MotivationalQuoteProps) {
  if (!phrase) return null;

  // Try to extract author from phrase (format: "quote - Author")
  const parts = phrase.split(' - ');
  const quoteText = parts[0].trim();
  const author = parts.length > 1 ? parts[parts.length - 1].trim() : null;

  return (
    <div className="relative max-w-md w-full bg-white-8 border border-white-15 rounded-2xl backdrop-blur-[14px] px-8 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.28)] overflow-hidden animate-fade-up">
      {/* Decorative quote mark */}
      <span
        className="absolute -top-2 left-4 font-display text-7xl leading-none text-primary/20 select-none pointer-events-none"
        aria-hidden
      >
        &ldquo;
      </span>
      <p className="relative font-display text-lg italic text-white-90 text-center leading-relaxed">
        {quoteText}
      </p>
      {author && (
        <p className="relative text-sm font-medium text-accent-green/80 text-center mt-3 tracking-wide">
          — {author}
        </p>
      )}
    </div>
  );
}
