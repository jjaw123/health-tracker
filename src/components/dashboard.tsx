"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navigation, { type Tab } from "./navigation";
import DashboardHome from "./dashboard-home";
import FoodTab from "./food-tab";
import AnalyticsTab from "./analytics-tab";
import ProfileTab from "./profile-tab";

const slideVariant = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("home");
  const [openFoodCamera, setOpenFoodCamera] = useState(false);

  const goToFoodCamera = () => {
    setTab("food");
    setOpenFoodCamera(true);
  };

  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="animate-blob-1 absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="animate-blob-2 absolute -right-20 top-2/3 h-64 w-64 rounded-full bg-sleep/15 blur-3xl" />
        <div className="animate-blob-1 absolute bottom-1/4 left-1/3 h-56 w-56 rounded-full bg-water/15 blur-3xl [animation-delay:-8s]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          variants={slideVariant}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {tab === "home" && <DashboardHome onSnapMeal={goToFoodCamera} />}
          {tab === "food" && (
            <FoodTab
              openCamera={openFoodCamera}
              onCameraOpened={() => setOpenFoodCamera(false)}
            />
          )}
          {tab === "analytics" && <AnalyticsTab />}
          {tab === "profile" && <ProfileTab />}
        </motion.div>
      </AnimatePresence>

      <Navigation active={tab} onTab={setTab} />
    </div>
  );
}
