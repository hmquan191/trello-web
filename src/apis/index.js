import axios from 'axios'
import { API_ROOT } from '~/utils/constants'


// Boards
export const fetchBoardDetailsAPI = async(boardId) => {
  const request = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)

  // axios sẽ trả kết quả qua property của nó là data
  return request.data
}

// Columns
export const createNewColumnAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

// Cards axios la post de create
export const createNewCardAPI = async (newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}