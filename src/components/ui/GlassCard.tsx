interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'dark' | 'light';
  width?: string;
  compact?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  variant = 'dark',
  width = '480px',
  compact = false,
  className = '',
}: GlassCardProps) {
  const base = 'relative flex flex-col items-center';

  const variants = {
    dark: `bg-[#0E1A12]/80 border border-white-10 rounded-[28px] backdrop-blur-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07)] ${compact ? 'gap-5 py-8 px-9' : 'gap-6 p-10'}`,
    light: `bg-white-8 border border-white-15 rounded-[28px] backdrop-blur-[16px] shadow-[0_16px_48px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.10)] ${compact ? 'gap-4 py-7 px-8' : 'gap-5 py-8 px-10'}`,
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} style={{ width, maxWidth: '100%' }}>
      {children}
    </div>
  );
}
