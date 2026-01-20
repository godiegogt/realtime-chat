import { cn } from "../../lib/cn";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-2 text-xs font-bold",
        variant === "default" && "bg-white/10 text-white border border-white/10",
        variant === "danger" && "bg-red-500 text-white",
        className
      )}
    >
      {children}
    </span>
  );
}
