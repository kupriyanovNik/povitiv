"use client";

import { useCallback, useState } from "react";

export type LeadFields = {
  name: string;
  phone: string;
  task: string;
  consent: boolean;
  object?: string;
  comment?: string;
  company?: string; // honeypot
};

export type LeadStatus = "idle" | "sending" | "success" | "error";

export function validateLead(fields: LeadFields): string | null {
  if (fields.name.trim().length < 2) return "Укажите имя";
  const digits = fields.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15)
    return "Укажите корректный номер телефона";
  if (!fields.consent)
    return "Подтвердите согласие на обработку персональных данных";
  return null;
}

export function useLeadSubmit() {
  const [status, setStatus] = useState<LeadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (fields: LeadFields) => {
    const validation = validateLead(fields);
    if (validation) {
      setError(validation);
      setStatus("error");
      return false;
    }
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          page: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      // сервер может ответить не-JSON (например, HTML от прокси): не падаем
      const data = (await res
        .json()
        .catch(() => ({ ok: false }))) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error ??
            "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.",
        );
        setStatus("error");
        return false;
      }
      setStatus("success");
      return true;
    } catch {
      setError(
        "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.",
      );
      setStatus("error");
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { status, error, submit, reset };
}
