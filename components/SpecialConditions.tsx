"use client";

import { useTranslations } from "next-intl";

interface SpecialConditionsProps {
  value: string;
  onChange: (value: string) => void;
}

export function SpecialConditions({ value, onChange }: SpecialConditionsProps) {
  const t = useTranslations("conditions");

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full min-h-[100px] p-3 bg-card border border-border rounded-lg
                   text-foreground placeholder:text-muted resize-y
                   focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </section>
  );
}
