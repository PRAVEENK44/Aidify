import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  detailedDescription?: string;
  imageSrc?: string;
  imageAlt?: string;
  colorClass?: string;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  detailedDescription,
  imageSrc,
  imageAlt = "Feature illustration",
  colorClass = "bg-gradient-to-r from-aidify-blue to-aidify-green"
}: FeatureCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  return (
    <>
      <div 
        className={cn(
          "features-card group transition-all duration-300 cursor-pointer",
          "hover:shadow-lg hover:translate-y-[-5px]"
        )}
        onClick={() => setDetailsOpen(true)}
      >
        <div className={cn(
          "mb-5 w-16 h-16 flex items-center justify-center rounded-full",
          colorClass
        )}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 group-hover:text-aidify-blue transition-colors">{title}</h3>
        <p className="opacity-90">{description}</p>
        <div className="mt-4 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm opacity-60 group-hover:opacity-100 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setDetailsOpen(true);
            }}
          >
            Learn More
          </Button>
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <DialogHeader className={cn(
            "px-6 py-4", 
            colorClass, 
            "text-white"
          )}>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-white/20 p-2 rounded-full">{icon}</span>
              {title}
            </DialogTitle>
          </DialogHeader>
          
          {imageSrc && (
            <div className="w-full h-[200px] overflow-hidden">
              <img 
                src={imageSrc} 
                alt={imageAlt} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="px-6 py-4">
            <DialogDescription className="text-base text-gray-700 mb-4">
              {detailedDescription || description}
            </DialogDescription>
            
            <div className="mt-4">
              <Button 
                onClick={() => setDetailsOpen(false)}
                className="w-full bg-aidify-blue hover:bg-aidify-blue/90"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
