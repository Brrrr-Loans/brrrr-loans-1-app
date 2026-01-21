"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    href?: string; // Optional href for making tabs into links
    icon?: any; // Changed from LucideIcon to any to avoid serialization issues
  }>;
  defaultTab?: string;
}

export function PageHeader({
  title,
  description,
  tabs,
  defaultTab,
}: PageHeaderProps) {
  
  // Use the first tab as fallback if defaultTab is not provided or not found
  const fallbackTab = tabs[0]?.id;
  const [activeTab, setActiveTab] = useState(defaultTab || fallbackTab);

  useEffect(() => {
    const nextTab = defaultTab || fallbackTab;

    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTab, fallbackTab]);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabClassName = cn(
              "whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors flex items-center gap-2",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            );

            // Dynamically render icon if provided
            const TabIcon = tab.icon;
            
            const TabContent = (
              <>
                {TabIcon && (
                  <TabIcon className={cn("h-4 w-4", isActive ? "" : "")} />
                )}
                {tab.label}
              </>
            );

            // If href is provided, use Link component
            if (tab.href) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={tabClassName}
                  aria-current={isActive ? "page" : undefined}
                >
                  {TabContent}
                </Link>
              );
            }

            // Otherwise, use button
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={tabClassName}
                aria-current={isActive ? "page" : undefined}
              >
                {TabContent}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{activeTabContent}</div>
    </div>
  );
}
