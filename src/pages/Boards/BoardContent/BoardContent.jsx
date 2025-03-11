import React from "react";

import Box from "@mui/material/Box";
import ListColumns from "./ListColumns/ListColumns";

function BoardContent() {
  return (
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
      <ListColumns />
    </Box>
  );
}

export default BoardContent;
