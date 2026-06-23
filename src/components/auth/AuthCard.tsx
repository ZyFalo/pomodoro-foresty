import { Icon } from '@/components/ui';

interface AuthCardProps {
  children: React.ReactNode;
  subtitle: string;
  small?: boolean;
}

export function AuthCard({ children, subtitle, small = false }: AuthCardProps) {
  return (
    <>
      {/* App Icon */}
      <div
        className={`relative ${small ? 'w-[66px] h-[66px] rounded-[20px]' : 'w-[86px] h-[86px] rounded-[26px]'} bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center shadow-[0_10px_36px_rgba(46,139,87,0.45)] animate-scale-in`}
      >
        <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20" />
        <Icon name="forest" size={small ? 30 : 38} className="text-white" filled />
      </div>

      {/* Title */}
      <h1
        className={`font-display ${small ? 'text-[32px]' : 'text-[42px]'} font-semibold text-white text-center tracking-tight leading-none animate-fade-up [animation-delay:60ms]`}
      >
        Pomodoro Forest
      </h1>
      <p
        className={`text-[15px] leading-relaxed text-center max-w-sm ${small ? 'text-white-50' : 'text-white-60'} animate-fade-up [animation-delay:120ms]`}
      >
        {subtitle}
      </p>

      {children}
    </>
  );
}
