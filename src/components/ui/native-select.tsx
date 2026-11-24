import * as React from "react";
import { cn } from "@/lib/utils";

const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => (
    <select
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-input bg-card px-2.5 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
