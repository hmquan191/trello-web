import React from "react";

import Box from "@mui/material/Box";

import Tooltip from "@mui/material/Tooltip";

import AddCardIcon from "@mui/icons-material/AddCard";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";

import Button from "@mui/material/Button";
import ListCards from "./ListCards/ListCards";
import { mapOrder } from "~/utils/sorts";
import { ThemeContext } from "@emotion/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Column({ column }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: column._id,
      data: { ...column },
    });

  const dndKitColumnStyles = {
    // touchAction: "none",
    // Nếu dùng transform sẽ bị lỗi kiếu tretch
    // FIX BUG BẰNG CSS.Transform.toString() THÀNH CSS.Translate như bên dưới
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // drop down menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // sap xep card
  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, "_id");
  return (
    <Box
      ref={setNodeRef}
      style={dndKitColumnStyles}
      {...attributes}
      {...listeners}
      sx={{
        minWidth: "300px",
        maxWidth: "300px",
        backgroundColor: (theme) => {
          return theme.palette.mode === "dark" ? "#333643" : "#ebecf0";
        },
        ml: 2, //margin left
        borderRadius: "6px",
        height: "fit-content", // fit theo content hien co
        maxHeight: (theme) =>
          `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
      }}
    >
      {/* Box column header */}
      <Box
        sx={{
          height: (theme) => theme.trello.columnHeaderHeight,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {column?.title}
        </Typography>
        <Box>
          <Tooltip title="More options">
            <ExpandMoreIcon
              sx={{ color: "text.primary", cusor: "pointer" }}
              id="basic-column-dropdown"
              aria-controls={open ? "basic-menu-column-dropdown" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            />
          </Tooltip>
        </Box>
      </Box>

      {/*list card */}
      <ListCards cards={orderedCards} />
      {/* Box footer */}
      <Box
        sx={{
          height: (theme) => theme.trello.columnFooterHeight,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button startIcon={<AddCardIcon />}>Add new card</Button>
        <Tooltip title="Drag to modify">
          <DragHandleIcon sx={{ cursor: "pointer" }} />
        </Tooltip>
      </Box>
    </Box>
  );
}

export default Column;
