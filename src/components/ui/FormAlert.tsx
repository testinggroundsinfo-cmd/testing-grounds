import { AlertTriangle, CheckCircle2 } from "lucide-react";

type FormAlertVariant = "success" | "error";

const styles: Record<FormAlertVariant, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  error: "border-red-500/30 bg-red-500/10 text-red-300",
};

export function FormAlert({
  variant,
  message,
}: {
  variant: FormAlertVariant;
  message: string;
}) {
  const Icon = variant === "success" ? CheckCircle2 : AlertTriangle;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${styles[variant]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
