import { cn } from "../../lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm",
        "placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/40",
        className
      )}
      {...props}
    />
  );
}
