import { cn } from "../../lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({ variant = "outline", className, ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-violet-600 text-white hover:bg-violet-500",
        variant === "ghost" &&
          "bg-transparent hover:bg-white/10 border border-transparent",
        variant === "outline" &&
          "border border-white/10 bg-white/5 hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
