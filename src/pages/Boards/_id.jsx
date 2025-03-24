// Boards Details
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'

import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'

import { fetchBoardDetailsAPI } from '~/apis'

function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    // tạm thời fix cứng boardId, flow chuẩn chỉnh sẽ học nâng cao
    const boardId = '67e124c773390f3ca27328bb'
    // call API
    fetchBoardDetailsAPI(boardId).then(board => {
      setBoard(board)
    })
  }, [])
  return (
    <div>
      <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
        <AppBar />
        <BoardBar board={board} />
        <BoardContent board={board} />
      </Container>
    </div>
  )
}

export default Board
