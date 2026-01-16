import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NewPlanForm } from "@/components/NewPlanForm";

export default async function NewPlanPage() {
  const t = await getTranslations();

  return (
    <main className="max-w-lg mx-auto px-4 py-4 pb-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted hover:text-foreground
                   transition-colors mb-6"
      >
        <span>←</span>
        <span>{t("common.back")}</span>
      </Link>

      {/* Page title */}
      <h1 className="text-2xl font-bold mb-6">{t("newPlanPage.title")}</h1>

      {/* Form */}
      <NewPlanForm />
    </main>
  );
}
