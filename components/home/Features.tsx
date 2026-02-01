'use client'

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/iconMapping";

type FeatureItem = {
  title: string;
  description: string;
  icon: string;
  colorClass: string;
}

interface FeaturesProps {
  className?: string;
  featuresHeading?: string;
  featuresSubheading?: string;
  featureItems?: FeatureItem[];
}

const Features = ({
  className,
  featuresHeading = 'Why Choose L. Ellis Designs?',
  featuresSubheading = 'We\'re passionate about creating buttons that celebrate your team, your school, and your special moments.',
  featureItems = [
    { title: 'Handcrafted with Love', description: 'Every button is carefully made in Baton Rouge with attention to detail and quality materials.', icon: 'heart', colorClass: 'bg-primary/10 text-primary' },
    { title: 'Fast Turnaround', description: 'Quick production times so you get your buttons when you need them for game day or events.', icon: 'clock', colorClass: 'bg-secondary/10 text-secondary' },
    { title: 'Bulk Discounts', description: 'The more you order, the more you save. Perfect for teams, schools, and large events.', icon: 'shopping-bag', colorClass: 'bg-accent/10 text-accent' },
    { title: 'Custom Designs', description: 'Personalize with names, numbers, photos, and team colors. Make each button unique!', icon: 'palette', colorClass: 'bg-purple-500/10 text-purple-500' },
    { title: 'Quality Guaranteed', description: 'Durable, vibrant 3-inch buttons that last through every game and celebration.', icon: 'shield', colorClass: 'bg-blue-500/10 text-blue-500' },
    { title: 'Flexible Delivery', description: 'Local pickup in Baton Rouge or fast UPS shipping anywhere in the country.', icon: 'truck', colorClass: 'bg-orange-500/10 text-orange-500' },
  ]
}: FeaturesProps) => {
  return (
    <section className={cn("py-12 md:py-16 bg-background", className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {featuresHeading}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {featuresSubheading}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureItems.map((feature, idx) => {
            const IconComponent = getIcon(feature.icon);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="flex gap-4 p-5 rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-shadow"
              >
                <span className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl",
                  feature.colorClass
                )}>
                  <IconComponent className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { Features };
