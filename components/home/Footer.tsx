import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

import { cn } from "@/lib/utils";

const defaultSections = [
  {
    title: "Shop",
    links: [
      { name: "All Buttons", href: "/" },
      { name: "Schools", href: "/category/schools-teams-clubs" },
      { name: "Custom Request", href: "/custom-request" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "Shipping Info", href: "/shipping" },
      { name: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Our Story", href: "/about#story" },
    ],
  },
];

type FooterLink = {
  label: string;
  href: string;
}

type FooterSection = {
  sectionTitle: string;
  links?: FooterLink[];
}

interface FooterProps {
  className?: string;
  businessDescription?: string;
  footerEmail?: string;
  footerLocation?: string;
  footerNavigation?: FooterSection[];
  businessInstagram?: string;
}

const Footer = ({
  className,
  businessDescription,
  footerEmail = 'hello@lellisdesigns.com',
  footerLocation = 'Baton Rouge, LA',
  footerNavigation,
  businessInstagram = 'https://instagram.com/lellisdesigns'
}: FooterProps) => {
  // Map CMS navigation to component format
  const sections = footerNavigation?.map(section => ({
    title: section.sectionTitle,
    links: section.links?.map(link => ({ name: link.label, href: link.href })) || []
  })) || defaultSections;
  return (
    <footer className={cn("bg-primary text-primary-foreground", className)}>
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-secondary/50">
                <Image
                  src="/logo.png"
                  alt="L. Ellis Designs"
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <span className="font-bold text-xl block">L. Ellis Designs</span>
                <span className="text-sm text-primary-foreground/70">Custom Buttons for Every Occasion</span>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6 max-w-sm">
              {businessDescription || 'Handcrafted 3-inch buttons made with love in Baton Rouge. Perfect for sports teams, schools, and special celebrations.'}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{footerLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                <a href={`mailto:${footerEmail}`} className="hover:text-secondary transition-colors">
                  {footerEmail}
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a
                href={businessInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-secondary hover:text-secondary-foreground"
                aria-label="Instagram"
              >
                <FaInstagram className="size-5" />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="mb-4 font-semibold text-primary-foreground">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} L. Ellis Designs. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-secondary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
