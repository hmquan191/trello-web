import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { useEffect, useState } from 'react'
import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI, updateBoardDetailsAPI } from '~/apis'
import { generatePlaceHolderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'

function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    const boardId = '67e124c773390f3ca27328bb'
    fetchBoardDetailsAPI(boardId).then(board => {
      // Handle empty columns with placeholder cards
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

      // Add placeholder card to new column if no cards exist
      if (isEmpty(createdColumn.cards)) {
        createdColumn.cards = [generatePlaceHolderCard(createdColumn)]
        createdColumn.cardOrderIds = [generatePlaceHolderCard(createdColumn)._id]
      }

      setBoard(prevBoard => {
        if (!prevBoard) return prevBoard

        // Explicitly add to the end of the columns array
        const updatedColumns = [...(prevBoard.columns || []), createdColumn]
        const updatedColumnOrderIds = [...(prevBoard.columOrderIds || []), createdColumn._id]

        return {
          ...prevBoard,
          columns: updatedColumns,
          columOrderIds: updatedColumnOrderIds
        }
      })

      return createdColumn
    } catch (error) {
      console.error('Error adding column:', error)
    }
  }

  const createNewCard = async (newCardData) => {
    if (!board) return

    try {
      const createdCard = await createNewCardAPI({
        ...newCardData,
        boardId: board._id
      })

      setBoard(prevBoard => {
        if (!prevBoard) return prevBoard

        // Create a new board object with updated columns
        const updatedColumns = prevBoard.columns.map(column => {
          if (column._id === createdCard.columnId) {
            // Add the new card to the end of the cards array
            const updatedCards = [...(column.cards || []), createdCard]
            const updatedCardOrderIds = [...(column.cardOrderIds || []), createdCard._id]

            return {
              ...column,
              cards: updatedCards,
              cardOrderIds: updatedCardOrderIds
            }
          }
          return column
        })

        return {
          ...prevBoard,
          columns: updatedColumns
        }
      })

      return createdCard
    } catch (error) {
      console.error('Error adding card:', error)
    }
  }

  const moveColumns = async (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    setBoard(prevBoard => ({
      ...prevBoard,
      columns: dndOrderedColumns,
      columnOrderIds: dndOrderedColumnsIds
    }))

    // Call API to update board
    await updateBoardDetailsAPI(board._id, { columnOrderIds: dndOrderedColumnsIds })
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent 
        board={board} 
        createNewColumn={createNewColumn} 
        createNewCard={createNewCard} 
        moveColumns={moveColumns}
      />
    </Container>
  )
}

export default Board