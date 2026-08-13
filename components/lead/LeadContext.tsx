"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import type { LeadTask } from "@/lib/site";
import { LeadModal } from "./LeadModal";

type LeadContextValue = {
  openLead: (task?: LeadTask) => void;
};

const LeadContext = createContext<LeadContextValue | null>(null);

export function useLead(): LeadContextValue {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error("useLead must be used within LeadProvider");
  return ctx;
}

export function LeadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<LeadTask | undefined>(undefined);

  const openLead = useCallback((t?: LeadTask) => {
    setTask(t);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openLead }), [openLead]);

  return (
    <MotionConfig reducedMotion="user">
      <LeadContext.Provider value={value}>
        {children}
        <LeadModal
          open={open}
          initialTask={task}
          onClose={() => setOpen(false)}
        />
      </LeadContext.Provider>
    </MotionConfig>
  );
}
