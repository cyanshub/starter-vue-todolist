import Vue from 'vue'

export default {
  ADD_TODO (state, todo) {
    state.todos.push(todo)
    state.nextId++
  },
  UPDATE_TODO (state, updatedTodo) {
    const index = state.todos.findIndex((todo) => todo.id === updatedTodo.id)
    if (index !== -1) {
      Vue.set(state.todos, index, updatedTodo)
    }
  },
  DELETE_TODO (state, id) {
    state.todos = state.todos.filter((todo) => todo.id !== id)
  },
  TOGGLE_TODO (state, id) {
    const index = state.todos.findIndex((todo) => todo.id === id)
    if (index !== -1) {
      const todo = state.todos[index]
      Vue.set(todo, 'isCompleted', !todo.isCompleted)
    }
  }
}
