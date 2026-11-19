"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * next/link that behaves like the original's TanStack Router links: on its own
 * page it gets aria-current="page" plus `activeClassName`.
 */
export function NavLink({
  href,
  className,
  activeClassName,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  activeClassName?: string;
}) {
  const pathname = usePathname();
  const active = (pathname.replace(/\/+$/, "") || "/") === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(className, active && activeClassName)}
      {...props}
    />
  );
}
