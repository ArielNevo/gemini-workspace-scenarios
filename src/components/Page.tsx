import { useEffect, useRef, type ReactNode } from 'react';
import { siteConfig } from '../lib/content';

/** Sets the document title and moves focus to the page heading on navigation (screen readers). */
export function Page({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    document.title = title === siteConfig.siteTitle ? title : `${title} | ${siteConfig.siteTitle}`;
    // Keep the org-data banner in view: start each page at the top, then move focus without scrolling.
    window.scrollTo(0, 0);
    ref.current?.focus({ preventScroll: true });
  }, [title]);
  return (
    <div className={className}>
      <h1 ref={ref} tabIndex={-1}>
        {title}
      </h1>
      {children}
    </div>
  );
}
