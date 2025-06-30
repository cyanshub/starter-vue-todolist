export default {
  allTodos: state => {
    return [...state.todos].sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  completedTodos: state => {
    return state.todos
      .filter(todo => todo.isCompleted)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  pendingTodos: state => {
    return state.todos
      .filter(todo => !todo.isCompleted)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  },
  getTodoById: (state) => (id) => {
    return state.todos.find(todo => todo.id === id)
  }
}
