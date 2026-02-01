'use client'

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsBarProps {
  className?: string;
}

const StatsBar = ({ className }: StatsBarProps) => {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-6 lg:gap-12 mb-8", className)}>
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <span>5.0</span>
          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Customer Rating
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="text-2xl font-bold text-primary">
          <span>100+</span>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Unique Designs
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="text-2xl font-bold text-primary">
          <span>24hr</span>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Fast Turnaround
        </span>
      </div>
    </div>
  );
};

export { StatsBar };
