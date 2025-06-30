export default {
  addTodo ({ commit, state }, todoData) {
    const newTodo = {
      ...todoData,
      id: state.nextId,
      creator: 'Chin-Yang, Huang',
      isCompleted: false
    }
    commit('ADD_TODO', newTodo)
  },
  updateTodo ({ commit }, todoData) {
    commit('UPDATE_TODO', todoData)
  },
  deleteTodo ({ commit }, id) {
    commit('DELETE_TODO', id)
  },
  toggleTodo ({ commit }, id) {
    commit('TOGGLE_TODO', id)
  }
}
