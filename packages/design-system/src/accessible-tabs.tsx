"use client";

import { type KeyboardEvent, type ReactNode, useState } from "react";

export type AccessibleTab = {
  id: string;
  label: string;
  panel: ReactNode;
};

export function AccessibleTabs({
  activeId,
  tabs
}: {
  tabs: AccessibleTab[];
  activeId: string;
}) {
  const [selectedId, setSelectedId] = useState(activeId);

  function focusTab(index: number) {
    const nextTab = tabs[index];

    if (!nextTab) {
      return;
    }

    setSelectedId(nextTab.id);
    document.getElementById(`${nextTab.id}-tab`)?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = tabs.length - 1;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(index === lastIndex ? 0 : index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(index === 0 ? lastIndex : index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(lastIndex);
    }
  }

  return (
    <div className="il-tabs">
      <div aria-label="Section tabs" className="il-tabs__list" role="tablist">
        {tabs.map((tab, index) => (
          <button
            aria-controls={`${tab.id}-panel`}
            aria-selected={tab.id === selectedId}
            className="il-tabs__tab"
            id={`${tab.id}-tab`}
            key={tab.id}
            onClick={() => setSelectedId(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            role="tab"
            tabIndex={tab.id === selectedId ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <section
          aria-labelledby={`${tab.id}-tab`}
          hidden={tab.id !== selectedId}
          id={`${tab.id}-panel`}
          key={tab.id}
          role="tabpanel"
        >
          {tab.panel}
        </section>
      ))}
    </div>
  );
}
