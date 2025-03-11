// Boards Details
import Container from "@mui/material/Container";
import AppBar from "~/components/AppBar/AppBar";

import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";

function Board() {
  return (
    <div>
      <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
        <AppBar />
        <BoardBar />
        <BoardContent />
      </Container>
    </div>
  );
}

export default Board;
