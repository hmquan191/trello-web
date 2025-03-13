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
import { cloneDeep } from "lodash";
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

  // tim mot cai clumn theo CardId
  const findColumnByCardId = (cardId) => {
    // đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước handle DragOvẻ
    // chúng ta sẽ làm dữ liệu co cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
    return orderedColumnsState.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    );
  };
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

  // trigget trong qua trinh keo (drag) mot phan tu
  const handleDragOver = (event) => {
    // Khong lam gi neu dang keo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

    // Card

    // Neu la card thi xu ly them de co the keo card qua lai giua cac column
    console.log("handleDragOver ", event);
    const { active, over } = event;

    // dam bao neu khong ton tai active hoac over (khi keo ra khoi pham vi container) thi khong lam gi (tranh crash trang)
    if (!active || !over) return;

    // activeDraggingCardId: la card dang duoc keo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;
    // overCard: la card dang tuong tac tren hoac duoi voi cai card duoc keo o tren
    const { id: overCardId } = over;

    // tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);

    if (!activeColumn || !overColumn) return;

    // xử lý logic ở đây khi kéo card qua 2 column khác nhau, nếu kéo card trong chính column ban đầu của nó thì không làm gì
    // vì đây đang là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó là vấn đề khác ở handleDragEnd
    if (activeColumn._id !== overColumn._id) {
      setOrderedColumnsState((prevColumns) => {
        // tim vi tri cua overCard trong column đích nơi mà activeCard được thả
        const overCardIndex = overColumn?.cards?.findIndex(
          (card) => card._id === overCardId
        );

        //
        let newCardIndex;
        const isBelowOverItem =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newCardIndex =
          overCardIndex >= 0
            ? overCardIndex + modifier
            : overColumn?.cards?.length + 1;

        const nextColumns = cloneDeep(prevColumns);
        const nextActiveColumn = nextColumns.find(
          (column) => column._id === activeColumn._id
        );
        const nextOverColumn = nextColumns.find(
          (column) => column._id === overColumn._id
        );

        // Column cũ
        if (nextActiveColumn) {
          // xóa card ở cái column active (có thể hiểu là column cũ), khi mà kéo card ra khỏi nó để sang column khác
          nextActiveColumn.cards = nextActiveColumn.cards.filter(
            (card) => card._id !== activeDraggingCardId
          );

          // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
            (card) => card._id
          );
        }
        // Column mới
        if (nextOverColumn) {
          // kiểm tra xem card đang kéo có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
          nextOverColumn.cards = nextOverColumn.cards.filter(
            (card) => card._id !== activeDraggingCardId
          );
        }

        // tiếp theo là thêm card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          activeDraggingCardData
        );
        // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
        return nextColumns;
      });
    }
  };

  // Trigger khi ket thuc keo mot phan tu => hanh dong tha ra (Drop)
  const handleDragEnd = (event) => {
    console.log("handleDragEnd: ", event);

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      return;
    }

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
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
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
