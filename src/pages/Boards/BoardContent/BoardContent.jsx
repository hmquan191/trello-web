import React, { useState, useEffect, useCallback, useRef } from "react";

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
  closestCorners,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { cloneDeep, isEmpty } from "lodash";
import Column from "./ListColumns/Column/Column";
import TrelloCard from "./ListColumns/Column/ListCards/Card/Card";
import { generatePlaceHolderCard } from "~/utils/formatters";

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
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);

  // điểm va chạm cuối cùng trước đó (xử lý thuật toán phát hiện va chạm)
  const lastOverId = useRef(null);

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
  // cập nhật lại state trong trường hợp di chuyển card giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
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
        // thêm placeholder card nếu column rỗng: bị kéo hết card đi k còn cái nào
        if(isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceHolderCard(nextActiveColumn)]
        }
        // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }
      // nextOverColumn: Column mới
      if (nextOverColumn) {
        // kiểm tra xem card đang kéo có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
      }
      //phải cập nhật lại chuẩn dữ liệu columnId trong card
      // sau khi kéo card giữa 2 column khác nhau
      const rebuild_activeDraggingCardData = {
        ...activeDraggingCardData,
        columnId: nextOverColumn._id,
      };

      // tiếp theo là thêm card đang kéo vào overColumn theo vị trí index mới
      nextOverColumn.cards = nextOverColumn.cards.toSpliced(
        newCardIndex,
        0,
        rebuild_activeDraggingCardData
      );

      // xóa cái placeholder card đi nếu nó đang tồn tại
      nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)
      console.log('nextOverColumn: ', nextOverColumn)
      // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
      nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
        (card) => card._id
      );
      return nextColumns;
    });
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

    // nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id));
    }
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

    // nếu không tồn tại 1 trong 2 column thì k làm gì hết
    if (!activeColumn || !overColumn) return;

    // xử lý logic ở đây khi kéo card qua 2 column khác nhau, nếu kéo card trong chính column ban đầu của nó thì không làm gì
    // vì đây đang là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó là vấn đề khác ở handleDragEnd
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      );
    }
  };

  // Trigger khi ket thuc keo mot phan tu => hanh dong tha ra (Drop)
  const handleDragEnd = (event) => {
    // console.log("handleDragEnd: ", event);
    const { active, over } = event;

    // Kiem tra neu khong ton tai over (keo linh tinh ra ngoai thi return tranh loi)
    if (!over) return;

    // xử lý kéo thả card - đang làm
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
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
      // nếu không tồn tại 1 trong 2 column thì k làm gì hết, tránh crash web
      if (!activeColumn || !overColumn) return;

      // hành động kéo thả card giữa 2 column khác nhau
      // phải dùng tới activeDragItemData.column hoặc oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart()) chứ không phải activeData
      // trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật một lần rồi.
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        );
      } else {
        // kéo thả card trong cùng 1 cái column
        // lay vi tri cu tu thang active
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        );
        // lay vi tri moi tu thang over
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        );

        // dùng arrayMove vì kéo card trong một cái column thì tương tự với logic kéo column trong một cái board content
        const dndOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );

        setOrderedColumnsState((prevColumns) => {
          const nextColumns = cloneDeep(prevColumns);

          // tìm tới cái Column mà chúng ta đang thả
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          );

          console.log("targetColumn", targetColumn);

          // cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id);

          // trả về giá trị state mới đúng vị trí
          return nextColumns;
        });
      }
    }
    // xử lý kéo thả columns (đã xong)
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // neu vi tri co thay doi thi bat dau keo tha
      if (active.id !== over.id) {
        // lay vi tri cu tu thang active
        const oldColumnIndex = orderedColumnsState.findIndex(
          (c) => c._id === active.id
        );
        // lay vi tri moi tu thang over
        const newColumnIndex = orderedColumnsState.findIndex(
          (c) => c._id === over.id
        );
        // bien doi mang ban dau

        // mang sau khi keo tha
        // dung arrayMove cua dnd-kit de sap xep lai mang columns ban dau
        const dndOrderedColumns = arrayMove(
          orderedColumnsState,
          oldColumnIndex,
          newColumnIndex
        );
        // sau nay su dung goi API luu lai dung vi tri sau khi F5
        // const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
        // console.log("dndOrderedColumnsIds", dndOrderedColumnsIds);
        // console.log("dndOrderedColumns", dndOrderedColumns);

        // cap nhat lai state columns ban dau sau khi da keo tha
        setOrderedColumnsState(dndOrderedColumns);
      }
    }

    // những dữ liệu sau khi kéo thả luôn đưa về giá trị null ban đầu
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnWhenDraggingCard(null);
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

  // custom lại chiến lược, thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns
  // args = arguments = các đối số, tham số

  // trường hợp kéo column thì dùng thuật toán closestCorners là đúng nhất
  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }

      const pointerIntersections = pointerWithin(args);
      // !! tra ve true false han che loi
      if(!pointerIntersections?.length) return

      // const intersections = !!pointerIntersections?.length
      //   ? pointerIntersections
      //   : rectIntersection(args);

      // tìm overId đầu tiên trong pointerIntersections
      let overId = getFirstCollision(pointerIntersections, "id");
      // console.log("overId: ", overId);
      if (overId) {
        // fix cái va chạm flickering
        const checkColumn = orderedColumnsState.find(
          (column) => column._id === overId
        );

        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => {
                return (
                  container.id !== overId &&
                  checkColumn?.cardOrderIds?.includes(container.id)
                );
              }
            ),
          })[0]?.id;
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // nếu overId là null thì trả về mảng rỗng, tránh crash trang
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumnsState]
  );
  return (
    <DndContext
      sensors={sensors}
      // từ trong docs mà ra có sẵn không cần code thêm gì
      // khi dùng closestCorners sẽ bị bug flickering khi kéo sát giữa 2 columns
      // collisionDetection={closestCorners}
      // custom lại
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
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
