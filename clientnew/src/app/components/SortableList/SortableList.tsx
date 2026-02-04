import React, { useMemo, useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDispatch } from "react-redux";
import {Chip} from "@mui/material";
import { addYearForPlayer } from "@/src/store/slices/gameSlice";
import { AppDispatch } from "@/src/store/store";
import {YearValue} from "@/src/models/models";

type GapId = `gap-${number}`;



function toMs(date: YearValue): number {
  const ms = Date.parse(date);
  return Number.isNaN(ms) ? 0 : ms;
}

function DraggableYear() {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: "insert-year" });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    cursor: "grab",
    opacity: isDragging ? 0.6 : 1,
    userSelect: "none",
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Chip
        label="???"
        sx={{
          mr: 1,
          mb: 1,
        }}
      />
    </div>
  );
}

function Gap({ id }: { id: GapId }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        width: isOver ? 60 : 20,
        flexShrink: 0,
        minHeight: 30,
        borderRadius: 8,
        border: isOver ? "2px solid #1976d2" : "1px dashed #ccc",
        opacity: isOver ? 1 : 0.15,
        transition: "all 0.2s ease",
        backgroundColor: isOver ? "rgba(25, 118, 210, 0.1)" : "transparent",
      }}
    />
  );
}

function YearRow({ year }: { year: YearValue }) {
  return (
    <div
      style={{
        borderRadius: 10,
        userSelect: "none",
      }}
    >
      <Chip label={year} />
    </div>
  );
}

export default function SortibleList({
  players,
  insertYear,
  activePlayerIndex,
  setActivePlayerIndex,
}: {
  players: any[];
  insertYear: YearValue;
  activePlayerIndex: number;
  setActivePlayerIndex: (index: number | ((prev: number) => number)) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [years, setYears] = useState<YearValue[]>([]);

  useEffect(() => {
    const currentPlayer = players[activePlayerIndex];
    if (currentPlayer?.years) {
      setYears([...currentPlayer.years].sort((a: YearValue, b: YearValue) => toMs(a) - toMs(b)));
    }
  }, [activePlayerIndex, players]);

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 8 } }));

  const correctIndex = useMemo(() => {
    const insertMs = toMs(insertYear);
    const yearsMs = years.map((y) => toMs(y));

    const idx = yearsMs.findIndex((ms) => insertMs < ms);
    return idx === -1 ? yearsMs.length : idx;
  }, [years, insertYear]);

  const gapIds: GapId[] = useMemo(
    () => Array.from({ length: years.length + 1 }, (_, i) => `gap-${i}` as GapId),
    [years.length]
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    if (active.id !== "insert-year") return;

    const overId = String(over.id);
    if (!overId.startsWith("gap-")) return;

    const idx = Number(overId.replace("gap-", ""));
    if (Number.isNaN(idx)) return;

    if (idx !== correctIndex) {
      if(confirm('Wrong place! The year is actually "' + insertYear + '". do you agree?')){
        setActivePlayerIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex < players.length ? nextIndex : 0;
        });
      }

      return;
    }

    const next = [...years.slice(0, idx), insertYear, ...years.slice(idx)];
    const nextSorted = [...next].sort((a, b) => toMs(a) - toMs(b));
    setYears(nextSorted);

    const currentPlayer = players[activePlayerIndex];
    if (currentPlayer?.id) {
      dispatch(addYearForPlayer({ playerId: currentPlayer.id, year: insertYear }));
    }

    if(confirm("Correct! It is " +insertYear+ " Year added.")){
      setActivePlayerIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex < players.length ? nextIndex : 0;
      });
    }
  }
  return (
    <div style={{ display: "grid", gap: 16, padding: 16 }}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
        <div style={{ display: "flex", flexDirection:"column", alignItems: "center", gap: 25 }}>
          <DraggableYear />

          <div style={{ display: "flex", gap: 8, overflowX: "auto", width: "600px", paddingBottom: '25px' }}>
            {gapIds.map((gapId, i) => (
              <React.Fragment key={gapId}>
                <Gap id={gapId} />
                {i < years.length && <YearRow year={years[i]} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
