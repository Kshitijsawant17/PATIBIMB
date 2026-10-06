"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its children once when they scroll into view.
 *
 * Uses a single IntersectionObserver per instance and disconnects after the
 * first reveal, so scrolling back up does not replay the animation. Falls back
 * to visible immediately when IntersectionObserver is unavailable, and honours
 * `prefers-reduced-motion` via the global CSS rule.
 */
export default function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Milliseconds. Kept small so a column of items never feels sluggish. */
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out will-change-[opacity,transform]",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
        className
      )}
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}