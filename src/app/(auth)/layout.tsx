export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans bg-forest grain">
      {/* Orbes de luz atmosféricos (dinamismo sutil) */}
      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-primary/20 blur-[130px] animate-float pointer-events-none" />
      <div className="absolute -bottom-48 -right-32 w-[36rem] h-[36rem] rounded-full bg-accent-green/10 blur-[150px] animate-float [animation-delay:2.5s] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[24rem] h-[24rem] rounded-full bg-primary-dark/20 blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-5 px-4 py-10">
        {children}
      </div>
    </div>
  );
}
