// Boards Details
import Container from "@mui/material/Container";
import AppBar from "~/components/AppBar/AppBar";

import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { mockData } from "~/apis/mock-data";

function Board() {
  return (
    <div>
      <Container disableGutters maxWidth={false} sx={{ height: "100vh" }}>
        <AppBar />
        <BoardBar board={mockData?.board} />
        <BoardContent board={mockData?.board} />
      </Container>
    </div>
  );
}

export default Board;
