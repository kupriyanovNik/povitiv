"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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

  // Триггер последнего открытия модалки: активный элемент на момент вызова
  // openLead. APG Dialog: «When a dialog closes, focus returns to the
  // element that invoked it». Отдаём в модалку сам ref, а не значение:
  // рестор выполняется в cleanup размонтирования ModalContent (после конца
  // exit-анимации), когда значение из рендера уже устарело бы.
  const triggerRef = useRef<HTMLElement | null>(null);

  const openLead = useCallback((t?: LeadTask) => {
    // фиксируем триггер ДО открытия; не-HTMLElement и отсутствие фокуса
    // (напр. клик мышью в Safari не фокусирует кнопку) дают null — тогда
    // рестора не будет вовсе, это допустимый фолбэк APG
    const el = document.activeElement;
    triggerRef.current = el instanceof HTMLElement ? el : null;
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
          triggerRef={triggerRef}
        />
      </LeadContext.Provider>
    </MotionConfig>
  );
}
