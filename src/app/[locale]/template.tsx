'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Next templates remount for route segments; keep the persistent navigation and
// authorization shell outside the animated content. No hidden initial SSR text.
export default function RouteTemplate({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={reduced ? false : { opacity: 0.82, y: 4 }}
    animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
    className="min-w-0">{children}</motion.div>;
}
