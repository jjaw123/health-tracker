"use client";

import { useStore } from "@/lib/store";
import OnboardingForm from "@/components/onboarding-form";
import Dashboard from "@/components/dashboard";

export default function Home() {
  const onboarded = useStore((s) => s.onboarded);
  const hydrated = useStore((s) => s.hydrated);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-brand/30" />
      </div>
    );
  }

  return onboarded ? <Dashboard /> : <OnboardingForm />;
}
