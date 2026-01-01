import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors,} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, horizontalListSortingStrategy, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis, restrictToParentElement, } from "@dnd-kit/modifiers";

const SortableTab = ({ entry, idx, onDelete, tabWidth, currentDomain }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.domain });

const style = {
  display: "flex",
  alignItems: "center",
  padding: "6px 10px",
  background: isDragging
    ? "#a0d8ff"       // background when dragging
    : currentDomain === entry.domain
    ? "#d0f0ff"       // background for currently edited tab
    : "#f3f3f3",      // default  border: "1px solid #ccc",
  borderBottom: "none",
  borderRadius: "8px 8px 0 0",
  marginRight: "8px",
  cursor: isDragging ? "grabbing" : "grab",
  transform: CSS.Transform.toString(
    isDragging
      ? { ...transform }
      : transform
  ),
  transition: isDragging ? "none" : "transform 150ms ease", 
  zIndex: isDragging ? 999 : undefined,
  boxShadow: isDragging ? "0 10px 25px rgba(0,0,0,0.3)" : undefined, // lift shadow
  flexShrink: 0,
  width: tabWidth,
  justifyContent: "space-between",
  position: "relative",
  userSelect: "none",
};

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...listeners}
        {...attributes}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "2px 2px",
          marginRight: "8px", // leave space for delete
          whiteSpace: "nowrap",
          overflow: "hidden",
          fontWeight: "bold",
          position: "relative",
        }}
      >
        {entry.domain}
        
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "10px",
            height: "100%",
            pointerEvents: "none",
            background: `linear-gradient(to left, ${style.background}, ${style.background}77)`,
          }}
        />
      </div>
        <button
          className="tab-delete-button"
          onClick={(e) => {
            e.stopPropagation();  // prevent tab click
            onDelete();
          }}
        > {tabWidth < 175 ? "X" : "Delete"}
        </button>
      </div>
  );
};


const DomainTabs = ({
  domainEntries,
  currentDomain,
  setCurrentDomain,
  setSuccessfulBehaviors,
  setUnsuccessfulBehaviors,
  setDomainEntries,
}) => {

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 25,
        tolerance: 5, // small movement allowed
      },
    })
  );

  useEffect(() => {
    if (!domainEntries || domainEntries.length === 0) {
      setDomainEntries([
        {
          domain: "New Tab",
          sentences: [],
        },
      ]);
      setCurrentDomain("New Tab");
      setSuccessfulBehaviors([]);
      setUnsuccessfulBehaviors([]);
    }
  }, [domainEntries, setDomainEntries, setCurrentDomain, setSuccessfulBehaviors, setUnsuccessfulBehaviors]);


  // open recent tab as opposed to empty/no tab selected
  useEffect(() => {
  if (domainEntries.length > 0 && !currentDomain) {
    const last = domainEntries[domainEntries.length - 1];
    openTab(last);
  }
}, [domainEntries, currentDomain, setCurrentDomain, setSuccessfulBehaviors, setUnsuccessfulBehaviors]);


  const openTab = (tab) => {
    setCurrentDomain(tab.domain);

    setSuccessfulBehaviors(
      tab.sentences
        .filter((s) => s.did)
        .map((s) => ({ label: s.text, value: s.text }))
    );
    
    setUnsuccessfulBehaviors(
      tab.sentences
        .filter((s) => !s.did)
        .map((s) => ({ label: s.text, value: s.text }))
    );
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    // Reorder tabs
    if (active.id !== over.id) {
      const oldIndex = domainEntries.findIndex((d) => d.domain === active.id);
      const newIndex = domainEntries.findIndex((d) => d.domain === over.id);
      setDomainEntries(arrayMove(domainEntries, oldIndex, newIndex));
    }

    // Open edit page after dragging tab
    const draggedItem = domainEntries.find((d) => d.domain === active.id);
    if (draggedItem) {
      openTab(draggedItem);
    }
  };


   const handleAddDomain = () => {
    // Prevent multiple
        if (domainEntries.some((entry) => entry.domain === "New Tab")) {
        return;
        }

    setDomainEntries([
        ...domainEntries,
        {
        domain: "New Tab", // placeholder name
        sentences: [],
        },
    ]);

    setCurrentDomain("New Tab"); // switch to the new tab
    setSuccessfulBehaviors([]);
    setUnsuccessfulBehaviors([]);
};


  const numTabs = domainEntries.length;
  const tabWidth = Math.min(Math.max(1200 / (numTabs * 1.3), 142), 300);   // max() handles sizing down tabs. 142 is the smallest a tab can be. 300 is the largest

 return (
    <div className="domain-tabs-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={[...domainEntries.map((d) => d.domain), "__add__"]}
          strategy={horizontalListSortingStrategy}
        >
          <div className="tab-row">
            {domainEntries.map((entry, idx) => (
              <SortableTab
                key={entry.domain}
                entry={entry}
                idx={idx}
                tabWidth={tabWidth}
                currentDomain={currentDomain}
                onDelete={() => {
                  const domainToDelete = entry.domain;
                  setDomainEntries(domainEntries.filter((_, i) => i !== idx));

                  if (currentDomain === domainToDelete) {
                    setCurrentDomain("");
                    setSuccessfulBehaviors([]);
                    setUnsuccessfulBehaviors([]);
                  }
                }}
              />
            ))}

            <div className="tab add-tab" onClick={handleAddDomain}>
              +
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DomainTabs;
