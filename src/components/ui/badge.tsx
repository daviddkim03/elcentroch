import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-secondary text-secondary-foreground",
  good: "bg-green-100 text-green-900",
  wait: "bg-amber-100 text-amber-900",
  bad: "bg-red-100 text-red-900",
};

export function Badge({ tone = "neutral", className, ...props }: React.ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}
      {...props}
    />
  );
}
