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
    <div className="max-w-md w-full bg-[#2E8B5733] border border-[#2E8B574D] rounded-[15px] backdrop-blur-[7px] px-7 py-6">
      <p className="text-lg italic font-medium text-white text-center leading-relaxed">
        &ldquo;{quoteText}&rdquo;
      </p>
      {author && (
        <p className="text-sm text-white-60 text-center mt-2">— {author}</p>
      )}
    </div>
  );
}
