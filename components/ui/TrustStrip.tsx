import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustStripProps {
  rating?: number;
  customerCount?: string;
  className?: string;
}

const TrustStrip = ({
  rating = 5.0,
  customerCount = "500+",
  className,
}: TrustStripProps) => {
  return (
    <div className={cn("flex flex-wrap items-center justify-center md:justify-start gap-4", className)}>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating}</span>
      </div>
      <span className="text-muted-foreground">•</span>
      <span className="text-sm text-muted-foreground">Trusted by {customerCount} teams</span>
    </div>
  );
};

export { TrustStrip };
