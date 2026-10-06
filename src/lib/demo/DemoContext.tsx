"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type DemoStep =
  | "input"
  | "investigate"
  | "understand"
  | "replay"
  | "learn";

interface DemoContextType {
  isDemoMode: boolean;
  currentStep: DemoStep;
  startDemo: () => void;
  stopDemo: () => void;
  goToStep: (step: DemoStep) => void;
  nextStep: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const stepOrder: DemoStep[] = ["input", "investigate", "understand", "replay", "learn"];

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentStep, setCurrentStep] = useState<DemoStep>("input");

  const startDemo = useCallback(() => {
    setIsDemoMode(true);
    setCurrentStep("input");
  }, []);

  const stopDemo = useCallback(() => {
    setIsDemoMode(false);
    setCurrentStep("input");
  }, []);

  const goToStep = useCallback((step: DemoStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep]);

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        currentStep,
        startDemo,
        stopDemo,
        goToStep,
        nextStep,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
