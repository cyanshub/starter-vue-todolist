import Vue from 'vue'
import { todosDummy } from './dummy.js' // Dummy data 用於重置

// 保存資料到 localStorage 的輔助函數
const saveToLocalStorage = (todos, nextId) => {
  try {
    // 過濾掉範例資料（ID 為 991, 992, 993 的資料）
    const userTodos = todos.filter(todo => ![991, 992, 993].includes(todo.id))

    localStorage.setItem('vue-todo-todos', JSON.stringify(userTodos))
    localStorage.setItem('vue-todo-nextId', nextId.toString())
  } catch (error) {
    console.error('保存到 localStorage 失敗:', error)
  }
}

export default {
  ADD_TODO (state, todo) {
    // 如果是第一次新增用戶資料，先清除範例資料
    if (state.todos.some(t => [991, 992, 993].includes(t.id))) {
      state.todos = state.todos.filter(t => ![991, 992, 993].includes(t.id))
    }

    state.todos.push(todo)
    state.nextId++
    // 保存到 localStorage
    saveToLocalStorage(state.todos, state.nextId)
  },
  UPDATE_TODO (state, updatedTodo) {
    const index = state.todos.findIndex((todo) => todo.id === updatedTodo.id)
    if (index !== -1) {
      Vue.set(state.todos, index, updatedTodo)
      // 保存到 localStorage
      saveToLocalStorage(state.todos, state.nextId)
    }
  },
  DELETE_TODO (state, id) {
    state.todos = state.todos.filter((todo) => todo.id !== id)
    // 保存到 localStorage
    saveToLocalStorage(state.todos, state.nextId)
  },
  TOGGLE_TODO (state, id) {
    const index = state.todos.findIndex((todo) => todo.id === id)
    if (index !== -1) {
      const todo = state.todos[index]
      const newCompletedState = !todo.isCompleted
      Vue.set(todo, 'isCompleted', newCompletedState)

      // 記錄完成時間
      if (newCompletedState) {
        Vue.set(todo, 'completedAt', new Date().toISOString())
      } else {
        Vue.set(todo, 'completedAt', null)
      }

      // 保存到 localStorage
      saveToLocalStorage(state.todos, state.nextId)
    }
  },
  CLEAR_ALL_DATA (state) {
    // 重置為 dummy data
    state.todos = [...todosDummy]
    state.nextId = 994
    // 清除 localStorage，不保存範例資料
    localStorage.removeItem('vue-todo-todos')
    localStorage.removeItem('vue-todo-nextId')
  }
}
