import {
  Heart,
  Truck,
  ShoppingBag,
  Palette,
  Shield,
  Clock,
} from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
  {
    title: "Handcrafted with Love",
    description:
      "Every button is carefully made in Louisiana with attention to detail and quality materials.",
    icon: <Heart className="h-5 w-5" />,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Fast Turnaround",
    description:
      "Quick production times so you get your buttons when you need them for game day or events.",
    icon: <Clock className="h-5 w-5" />,
    color: "bg-secondary/10 text-secondary",
  },
  {
    title: "Bulk Discounts",
    description:
      "The more you order, the more you save. Perfect for teams, schools, and large events.",
    icon: <ShoppingBag className="h-5 w-5" />,
    color: "bg-accent/10 text-accent",
  },
  {
    title: "Custom Designs",
    description:
      "Personalize with names, numbers, photos, and team colors. Make each button unique!",
    icon: <Palette className="h-5 w-5" />,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Quality Guaranteed",
    description:
      "Durable, vibrant 3-inch buttons that last through every game and celebration.",
    icon: <Shield className="h-5 w-5" />,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Flexible Delivery",
    description:
      "Local pickup in Louisiana or fast UPS shipping anywhere in the country.",
    icon: <Truck className="h-5 w-5" />,
    color: "bg-orange-500/10 text-orange-500",
  },
];

interface FeaturesProps {
  className?: string;
}

const Features = ({ className }: FeaturesProps) => {
  return (
    <section className={cn("py-12 md:py-16 bg-background", className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Why Choose L. Ellis Designs?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We&apos;re passionate about creating buttons that celebrate your team, your school, and your special moments.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-5 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <span className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl",
                feature.color
              )}>
                {feature.icon}
              </span>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Features };
