import Vue from 'vue'

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

// Dummy data 用於重置
const todosDummy = [
  {
    id: 991,
    name: '範例: 記得運動 30 分鐘',
    content: '去公園慢跑',
    remarks: '記得帶水',
    time: 0.5,
    date: '2024-08-31',
    location: '公園',
    creator: 'Chin-Yang, Huang',
    isCompleted: true
  },
  {
    id: 992,
    name: '範例: 整理專案筆記',
    content: '整理 Node/Express 專案',
    remarks: null,
    time: 1,
    date: '2024-08-31',
    location: null,
    creator: 'Chin-Yang, Huang',
    isCompleted: false
  },
  {
    id: 993,
    name: '範例: 學習樂器',
    content: '練習演奏爵士鼓',
    remarks: '記得預約樂器行教室',
    time: 1,
    date: '2024-08-31',
    location: '樂器行',
    creator: 'Chin-Yang, Huang',
    isCompleted: false
  }
]

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
      Vue.set(todo, 'isCompleted', !todo.isCompleted)
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
