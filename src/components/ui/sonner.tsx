"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// shadcn/ui's sonner wrapper, configured exactly like the original site's.
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      // Clears the member area's bottom tab bar on phones.
      mobileOffset={{ bottom: 88 }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
