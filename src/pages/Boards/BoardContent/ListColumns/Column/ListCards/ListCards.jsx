import Box from "@mui/material/Box";
import TrelloCard from "./Card/Card";
function ListCards({ cards }) {
  return (
    <Box
      sx={{
        p: "0 5px", // padding
        m: "0 5px", // margin
        display: "flex",
        flexDirection: "column",
        gap: 1, // = 8px
        overflowX: "hidden",
        overflowY: "auto", // hiện thanh scroll
        maxHeight: (theme) =>
          `calc(
          ${theme.trello.boardContentHeight} - 
          ${theme.spacing(5)} - 
          ${theme.trello.columnHeaderHeight} -
          ${theme.trello.columnFooterHeight}
          )`,
        "&::-webkit-scrollbar-thumb ": { backgroundColor: "ced0da" },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#bfc2cf",
        },
      }}
    >
      {cards?.map((card) => (
        <TrelloCard key={card._id} card={card} />
      ))}
    </Box>
  );
}

export default ListCards;
