import { todosDummy } from './dummy.js'

// 從 localStorage 讀取資料的函數
const loadTodosFromStorage = () => {
  try {
    const storedTodos = localStorage.getItem('vue-todo-todos')
    const storedNextId = localStorage.getItem('vue-todo-nextId')

    if (storedTodos && storedNextId) {
      // 如果 localStorage 有資料，解析並檢查
      const parsedTodos = JSON.parse(storedTodos)

      // 檢查是否有資料且不是空陣列
      if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
        // 確保 id 是數字類型
        const normalizedTodos = parsedTodos.map((todo) => ({
          ...todo,
          id: parseInt(todo.id)
        }))

        return {
          todos: normalizedTodos,
          nextId: parseInt(storedNextId)
        }
      } else {
        return {
          todos: todosDummy,
          nextId: 1001
        }
      }
    }
  } catch (error) {
    console.error('讀取 localStorage 失敗:', error)
  }

  // 如果 localStorage 沒有資料或讀取失敗，返回 dummy data
  return {
    todos: todosDummy,
    nextId: 1001
  }
}

const state = () => {
  return loadTodosFromStorage()
}

export default state
