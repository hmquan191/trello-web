import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import { useState } from "react";
import Column from "./Column/Column";

function ListColumns({ columns }) {
  const [openNewColumnForm, setopenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setopenNewColumnForm(!openNewColumnForm)

  const [newColumnTitle, setNewColumnTitle] = useState('')

  const addNewColumn = () => {
    if (!newColumnTitle) {
      toast.error('Please enter COLUMN title!')
      return
    }
    // console.log(newColumnTitle)
    // goi api o day

    // dong form ban dau va clear input
    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }
  return (
    <SortableContext
      items={columns?.map((c) => c._id)}
      strategy={horizontalListSortingStrategy}
    >
      <Box
        sx={{
          bgColor: "inherit", // kế thừa của thằng cha
          width: "100%",
          height: "100%",
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar-track": { m: 2 },
        }}
      >
        {columns?.map((column) => (
          <Column key={column._id} column={column} />
        ))}

        {/* Box add new column */}
        {!openNewColumnForm
        ? <Box onClick={toggleOpenNewColumnForm}
            sx={{
              minWidth: "250px",
              maxWidth: "250px",
              mx: 2,
              borderRadius: "6px",
              height: "fit-content",
              bgcolor: "#ffffff3d",
            }}
          >
            <Button
              sx={{
                color: "white",
                width: "100%",
                justifyContent: "flex-start",
                pl: 2.5, // padding left
                py: 1
              }}
              startIcon={<NoteAddIcon />}
            >
              Add new column
            </Button>
          </Box>
        : <Box sx = {{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
        }}>        
            <TextField
              label="Enter column title..." //
              type="text"
              size="small"
              variant="outlined"
              autoFocus
              value={newColumnTitle} // lay value
              // bat su kien go y chang nhu ben duoi
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{
                "& label": { color: "white" },
                "& input": { color: "white" },
                "& label.Mui-focused": { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "white" },
                  "&:hover fieldset": { borderColor: "white" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                },
              }}
            />
            <Box sx ={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Button 
                onClick={addNewColumn}
                variant="contained" 
                color = "success" 
                size = "small"
                sx = {{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': { bgColor: (theme) => theme.palette.success.main } 
                }} 
              >Add Column</Button>
              <CloseIcon
                onClick = {toggleOpenNewColumnForm}
                fontSize="small"
                sx={{
                  color: 'white', // khi co gia tri nhap vao thi moi ra mau trang, con khong thi an
                  cursor: 'pointer',
                  '&:hover': { color: (theme) => theme.palette.warning.light }
                }}
              />
            </Box>
        </Box>
        }
      </Box>
    </SortableContext>
  );
}

export default ListColumns;
