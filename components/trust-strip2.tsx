import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface TrustStrip2Props {
  rating?: number;
  reviewCount?: number;
  customerCount?: string;
  pressLogos?: { name: string; logo?: string }[];
  className?: string;
}

const DEFAULT_LOGOS = [
  { name: "Forbes" },
  { name: "TechCrunch" },
  { name: "Vogue" },
  { name: "Wired" },
  { name: "GQ" },
];

const TrustStrip2 = ({
  rating = 4.9,
  reviewCount = 12500,
  customerCount = "1M+",
  pressLogos = DEFAULT_LOGOS,
  className,
}: TrustStrip2Props) => {
  return (
    <section className={cn("py-8", className)}>
      <div className="container">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Rating & Customer Count */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
            {/* Star Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-5",
                      i < Math.floor(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted",
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold">{rating}</span>
              <span className="text-muted-foreground">
                ({reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            <div className="hidden h-6 w-px bg-border md:block" />

            {/* Customer Count */}
            <p className="text-muted-foreground">
              Trusted by{" "}
              <span className="font-semibold text-foreground">
                {customerCount}
              </span>{" "}
              customers
            </p>
          </div>

          {/* Press Logos */}
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">As seen in:</span>
            <div className="flex items-center gap-4">
              {pressLogos.map((logo, index) => (
                <span
                  key={index}
                  className="text-sm font-semibold text-muted-foreground"
                >
                  {logo.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { TrustStrip2 };

