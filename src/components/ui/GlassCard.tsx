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
  const base = 'flex flex-col items-center';

  const variants = {
    dark: `bg-[#1B2A1BE6] rounded-2xl backdrop-blur-[10px] shadow-[0_10px_40px_#00000040] ${compact ? 'gap-5 py-8 px-10' : 'gap-6 p-10'}`,
    light: `bg-white-10 border border-white-20 rounded-[15px] backdrop-blur-[7px] ${compact ? 'gap-3.5 py-6 px-8' : 'gap-5 py-8 px-10'}`,
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} style={{ width }}>
      {children}
    </div>
  );
}
