export default {
  addTodo ({ commit, state }, todoData) {
    // 如果有傳入 id（匯入），就用傳入的 id，否則用 nextId
    const newTodo = {
      ...todoData,
      id: typeof todoData.id === 'number' ? todoData.id : state.nextId,
      // 保留傳入的 isCompleted 狀態，如果沒有則預設為 false
      isCompleted: todoData.isCompleted !== undefined ? todoData.isCompleted : false
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
  },
  // 清除所有資料並重置為 dummy data
  clearAllData ({ commit }) {
    commit('CLEAR_ALL_DATA')
  }
}
