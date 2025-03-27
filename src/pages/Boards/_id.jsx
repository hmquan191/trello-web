// Boards Details
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'

import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mockData } from '~/apis/mock-data'
import { useEffect, useState } from 'react'

import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI } from '~/apis'
import { generatePlaceHolderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'
function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '67e124c773390f3ca27328bb'
    fetchBoardDetailsAPI(boardId).then(board => {
      // xử lý vấn đề kéo thả column rỗng
      board.columns.forEach(column => {
        if(isEmpty(column.cards)) {
          column.cards = [generatePlaceHolderCard(column)]
          column.cardOrderIds = [generatePlaceHolderCard(column)._id]
        }
      })
      setBoard(board)
    })
  }, [])

  const createNewColumn = async (newColumnData) => {
    if (!board) return 

    try {
      const createdColumn = await createNewColumnAPI({
        ...newColumnData,
        boardId: board._id
      })

      setBoard(prevBoard => {
        if (!prevBoard) return prevBoard

        // Clone lại dữ liệu để đảm bảo không mutate trực tiếp
        const newBoard = { ...prevBoard }
        newBoard.columns = [...(prevBoard.columns || []), createdColumn]
        newBoard.columOrderIds = [...(prevBoard.columOrderIds || []), createdColumn._id]

        return newBoard
      })
    } catch (error) {
      console.error('Error adding column:', error)
    }
  }

  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })
    console.log('createdColumn:', createdCard)

    // cập nhật state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if(columnToUpdate) {
      columnToUpdate.cards.push(createdCard)
      columnToUpdate.cardOrderIds.push(createdCard)
      setBoard(newBoard)
    }
  }


  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent 
        board={board} 
        createNewColumn={createNewColumn} 
        createNewCard = {createNewCard} />
    </Container>
  )
}

export default Board
