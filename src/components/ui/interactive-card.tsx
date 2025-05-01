import * as React from "react"
import { cn } from "@/lib/utils"

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "glass" | "glow" | "bordered"
  hoverEffect?: boolean
  hasRipple?: boolean
}

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, variant = "default", hoverEffect = true, hasRipple = false, ...props }, ref) => {
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hoverEffect) return;
      
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Add custom properties for the gradient movement
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    };
    
    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hoverEffect) return;
      const card = e.currentTarget;
      
      // Reset transform on mouse leave
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    };
    
    const handleRipple = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasRipple) return;
      
      const card = e.currentTarget;
      const ripple = document.createElement('span');
      const rect = card.getBoundingClientRect();
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = 'ripple-effect';
      
      card.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-6 transition-all duration-300",
          // Base styles
          "relative overflow-hidden cursor-pointer",
          // Variant styles
          variant === "default" && "bg-white border border-gray-200 shadow-sm hover:shadow-md",
          variant === "gradient" && "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm hover:shadow-md hover:from-blue-100 hover:to-indigo-100",
          variant === "glass" && "backdrop-blur-md bg-white/70 border border-white/50 shadow-lg hover:bg-white/80",
          variant === "glow" && "bg-white border border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]",
          variant === "bordered" && "bg-white/90 border-2 border-transparent hover:border-aidify-blue/20",
          // Hover effect
          hoverEffect && "hover:-translate-y-1",
          // Ripple effect
          hasRipple && "relative",
          className
        )}
        style={{ 
          WebkitTapHighlightColor: 'transparent' 
        }}
        onClick={handleRipple}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    );
  }
);

InteractiveCard.displayName = "InteractiveCard";

export { InteractiveCard }; 