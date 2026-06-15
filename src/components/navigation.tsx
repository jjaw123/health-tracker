"use client";

import { motion } from "framer-motion";
import { House, Utensils, BarChart3, User } from "lucide-react";

export type Tab = "home" | "food" | "analytics" | "profile";

interface Props {
  active: Tab;
  onTab: (t: Tab) => void;
}

const TABS: { key: Tab; icon: typeof House; label: string }[] = [
  { key: "home", icon: House, label: "Home" },
  { key: "food", icon: Utensils, label: "Food" },
  { key: "analytics", icon: BarChart3, label: "Progress" },
  { key: "profile", icon: User, label: "Profile" },
];

export default function Navigation({ active, onTab }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe pt-1 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-line bg-surface px-2 py-1.5 shadow-lg backdrop-blur-2xl">
        {TABS.map((t) => {
          const isActive = active === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => onTab(t.key)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-brand-tint"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.span
                className="relative flex"
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon
                  size={18}
                  style={{
                    color: isActive ? "var(--brand)" : "var(--ink-muted)",
                    transition: "color 0.2s",
                  }}
                />
              </motion.span>
              <span
                className="relative text-[10px] font-medium"
                style={{
                  color: isActive ? "var(--brand)" : "var(--ink-muted)",
                  transition: "color 0.2s",
                }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
