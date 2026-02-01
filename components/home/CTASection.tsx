import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  className?: string;
  homepageCtaHeading?: string;
  homepageCtaSubtext?: string;
  homepageCtaButton1Text?: string;
  homepageCtaButton2Text?: string;
}

const CTASection = ({
  className,
  homepageCtaHeading = 'Have a Special Design in Mind?',
  homepageCtaSubtext = 'We love bringing your ideas to life! Whether it\'s custom names, photos, or unique designs - we\'re here to help create something special.',
  homepageCtaButton1Text = 'Request Custom Design',
  homepageCtaButton2Text = 'Browse Existing Designs',
}: CTASectionProps) => {
  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }} />
          </div>

          {/* Two-column layout */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text Column */}
            <div className="flex-1 p-8 md:p-12 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Custom Designs Available</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {homepageCtaHeading}
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                {homepageCtaSubtext}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg"
                >
                  <Link href="/custom-request" className="flex items-center gap-2">
                    {homepageCtaButton1Text}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Link href="#categories">
                    {homepageCtaButton2Text}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Visual Column - Button Grid Preview */}
            <div className="relative w-full lg:w-1/2 p-8 lg:p-12">
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {/* Sample button design mockup */}
                <div className="aspect-square rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20" />
                </div>
                <div className="aspect-square rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20" />
                </div>
                <div className="aspect-square rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20" />
                </div>
                <div className="aspect-square rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20" />
                </div>
                <div className="aspect-square rounded-full bg-white/30 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center shadow-lg scale-110">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/60 to-white/30" />
                </div>
                <div className="aspect-square rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20" />
                </div>
                <div className="aspect-square rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20" />
                </div>
                <div className="aspect-square rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20" />
                </div>
                <div className="aspect-square rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { CTASection };
