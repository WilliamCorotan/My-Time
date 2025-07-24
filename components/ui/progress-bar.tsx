"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

export default function ProgressBar() {
  const pathname = usePathname();
  const clickedRef = useRef(false);

  // Start NProgress on link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only left click, no modifier keys, and anchor with href
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      let el = e.target as HTMLElement | null;
      while (el && el.tagName !== "A") {
        el = el.parentElement;
      }
      if (el && el.tagName === "A" && (el as HTMLAnchorElement).href) {
        clickedRef.current = true;
        NProgress.start();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Finish NProgress on route change complete
  useEffect(() => {
    if (clickedRef.current) {
      NProgress.done();
      clickedRef.current = false;
    }
  }, [pathname]);

  return null;
} 