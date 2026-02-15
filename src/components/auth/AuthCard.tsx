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
      <div className={`${small ? 'w-[70px] h-[70px] rounded-2xl' : 'w-[90px] h-[90px] rounded-3xl'} bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center`}>
        <Icon name="park" size={small ? 32 : 40} className="text-white" />
      </div>

      {/* Title */}
      <h1 className={`${small ? 'text-4xl font-normal' : 'text-[40px] font-bold'} text-white text-center`}>
        Pomodoro Forest
      </h1>
      <p className={`text-base text-center ${small ? 'text-white-60' : 'text-white-80'}`}>
        {subtitle}
      </p>

      {children}
    </>
  );
}
