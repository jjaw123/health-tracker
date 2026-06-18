"use client";

import { motion } from "framer-motion";
import { Sprout, Utensils, LineChart, User } from "lucide-react";

export type Tab = "home" | "food" | "analytics" | "profile";

interface Props {
  active: Tab;
  onTab: (t: Tab) => void;
}

const TABS: { key: Tab; icon: typeof Sprout; label: string }[] = [
  { key: "home", icon: Sprout, label: "Today" },
  { key: "food", icon: Utensils, label: "Meals" },
  { key: "analytics", icon: LineChart, label: "Trends" },
  { key: "profile", icon: User, label: "You" },
];

export default function Navigation({ active, onTab }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe pt-2 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-line bg-surface px-1.5 py-1.5 shadow-lg">
        {TABS.map((t) => {
          const isActive = active === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => onTab(t.key)}
              aria-label={t.label}
              aria-current={isActive ? "page" : undefined}
              className="relative flex flex-col items-center gap-1 rounded-xl px-4 py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-brand-tint"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex">
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.4 : 1.9}
                  style={{
                    color: isActive ? "var(--brand-strong)" : "var(--ink-muted)",
                    transition: "color 0.2s",
                  }}
                />
              </span>
              <span
                className="dateline relative text-[9px] font-medium uppercase tracking-[0.1em]"
                style={{
                  color: isActive ? "var(--brand-strong)" : "var(--ink-muted)",
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
