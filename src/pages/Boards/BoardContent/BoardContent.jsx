import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "~/utils/sorts";

import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Column from "./ListColumns/Column/Column";
import TrelloCard from "./ListColumns/Column/ListCards/Card/Card";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

function BoardContent({ board }) {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  // yeu cau chuot di chuyen 10px thi moi kich hoat event, fix truong hop click bi goi event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });
  // nhan giu 250ms va dung sai cua cam ung 500px thi kich hoat event keo tha
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 },
  });
  // Ket hop 2 loai mouse va touch sensor de co trai nghiem mobile tot nhat
  // const sensors = useSensors(pointerSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  const [orderedColumnsState, setOrderedColumnsState] = useState([]);

  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);

  useEffect(() => {
    const orderedColumns = mapOrder(
      board?.columns,
      board?.columnOrderIds,
      "_id"
    );
    setOrderedColumnsState(orderedColumns);
  }, [board]); // [board] o cuoi: neu co thay doi thi cap nhat lai

  // Trigger khi bat dau keo phan tu (Drag)
  const handleDragStart = (event) => {
    // console.log("handleDragStart: ", event);
    setActiveDragItemId(event?.active?.id);
    setActiveDragItemType(
      // neu co tontai columnId thi day la Card va truong hop con lai la Column
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(event?.active?.data?.current);
  };

  // Trigger khi ket thuc keo mot phan tu => hanh dong tha ra (Drop)
  const handleDragEnd = (event) => {
    console.log("handleDragEnd: ", event);
    const { active, over } = event;

    // Kiem tra neu khong ton tai over (keo linh tinh ra ngoai thi return tranh loi)
    if (!over) return;

    // neu vi tri co thay doi thi bat dau keo tha
    if (active.id !== over.id) {
      // lay vi tri cu tu thang active
      const oldIndex = orderedColumnsState.findIndex(
        (c) => c._id === active.id
      );
      // lay vi tri moi tu thang over
      const newIndex = orderedColumnsState.findIndex((c) => c._id === over.id);
      // bien doi mang ban dau

      // mang sau khi keo tha
      // dung arrayMove cua dnd-kit de sap xep lai mang columns ban dau
      const dndOrderedColumns = arrayMove(
        orderedColumnsState,
        oldIndex,
        newIndex
      );
      // sau nay su dung goi API luu lai dung vi tri sau khi F5
      // const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
      // console.log("dndOrderedColumnsIds", dndOrderedColumnsIds);
      // console.log("dndOrderedColumns", dndOrderedColumns);

      // cap nhat lai state columns ban dau sau khi da keo tha
      setOrderedColumnsState(dndOrderedColumns);
    }

    // click vao k di chuyen nua thi tra ve null
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
  };

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };
  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <Box
        sx={{
          backgroundColor: (theme) => {
            return theme.palette.mode === "dark" ? "#34495e" : "#1976d2";
          },
          width: "100%",
          height: (theme) => theme.trello.boardContentHeight, // dung calc de tinh toan phan con lai cua Content
          p: "10px 0",
        }}
      >
        <ListColumns columns={orderedColumnsState} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <TrelloCard card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
}

export default BoardContent;
