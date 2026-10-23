import { motion } from "framer-motion";
import { KavachLogoMark } from "@/components/ui/KavachLogo";
import { APP_NAME } from "@/lib/constants";

export function MissingEnvScreen() {
  return (
    <div className="min-h-screen bg-black text-text-pure flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full rounded-2xl border border-red-500/30 bg-surface/90 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <KavachLogoMark className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display font-bold text-lg text-text-pure">{APP_NAME}</h1>
            <p className="text-xs font-mono text-red-400">CONFIGURATION ERROR</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-xs space-y-2">
          <p className="font-bold text-red-300">Supabase Connection Required</p>
          <p className="text-text-fog">
            The application is configured to run exclusively against your production Supabase database, but the environment variables are missing or unconfigured.
          </p>
        </div>

        <div className="mt-6 space-y-3 text-xs">
          <p className="text-text-fog font-medium">Please set the following in your Netlify site settings or local <code className="text-primary font-mono font-bold">.env</code> file:</p>
          <div className="p-3 rounded-lg bg-black/80 border border-border font-mono text-[11px] text-text-pure space-y-1">
            <p className="text-sky-400">VITE_SUPABASE_URL=<span className="text-text-ash">https://[your-project-id].supabase.co</span></p>
            <p className="text-emerald-400">VITE_SUPABASE_ANON_KEY=<span className="text-text-ash">[your-anon-key]</span></p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-[11px] text-text-fog">
          <span>Production-grade security mode</span>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 rounded-lg bg-primary text-black font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </motion.div>
    </div>
  );
}
