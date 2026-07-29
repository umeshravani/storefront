export function AnimatedLogo({
  className = "w-[90px] h-[32px]",
  variant = "gold",
}: {
  className?: string;
  variant?: "gold" | "silver";
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes goldShine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .logo-shine-mask {
          background-size: 200% auto;
          animation: goldShine 3s linear infinite;
          -webkit-mask-image: url(/wallx.svg);
          -webkit-mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: left center;
          mask-image: url(/wallx.svg);
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: left center;
        }
        .logo-shine-mask.gold {
          background-image: linear-gradient(
            110deg,
            #FBC02D 0%,
            #FFF59D 30%,
            #ffffff 50%,
            #FFF59D 70%,
            #FBC02D 100%
          );
        }
        .logo-shine-mask.silver {
          background-image: linear-gradient(
            110deg,
            #C0C0C0 0%,
            #E0E0E0 30%,
            #ffffff 50%,
            #E0E0E0 70%,
            #C0C0C0 100%
          );
        }
      `,
        }}
      />
      <div
        className={`logo-shine-mask ${variant} shrink-0 ${className}`}
        role="img"
        aria-label="Logo"
      />
    </>
  );
}
