import { Link } from "react-router-dom";
import { KavachLogo } from "@/components/ui/KavachLogo";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface/50 backdrop-blur-md mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border">
          <div>
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <KavachLogo size="sm" subtitle={APP_TAGLINE} />
            </Link>
            <p className="mt-2 text-xs text-text-fog max-w-md leading-relaxed">
              Empowering individuals and teams to build practical digital safety reflexes through interactive, zero-risk scam simulations and real-time threat intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-text-fog">
            <Link to="/topics" className="hover:text-text-pure transition-colors font-medium">
              Topics
            </Link>
            <Link to="/features" className="hover:text-text-pure transition-colors font-medium">
              Features
            </Link>
            <Link to="/how-it-works" className="hover:text-text-pure transition-colors font-medium">
              How It Works
            </Link>
            <Link to="/about" className="hover:text-text-pure transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="hover:text-text-pure transition-colors font-medium">
              Contact
            </Link>
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign In &rarr;
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-ash">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} {APP_NAME}. Built for community digital safety.</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] font-mono text-text-fog">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Cyber Helpline: 1930
            </span>
            <span className="text-[11px] font-mono text-text-ash">
              v2.6 Precision
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
