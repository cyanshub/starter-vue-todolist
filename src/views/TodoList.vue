<template>
  <div class="todo-list">
    <div class="todo-header">
      <h1>我的待辦清單</h1>
      <button @click="showAddForm = true" class="add-btn"><span>➕</span> 新增待辦</button>
    </div>

    <!-- 統計資訊 -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-number">{{ pendingTodos.length }}</span>
        <span class="stat-label">待完成</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ completedTodos.length }}</span>
        <span class="stat-label">已完成</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ allTodos.length }}</span>
        <span class="stat-label">總計</span>
      </div>
    </div>

    <!-- 篩選器 -->
    <div class="filter-tabs">
      <button @click="currentFilter = 'all'" :class="{ active: currentFilter === 'all' }" class="filter-btn">全部</button>
      <button @click="currentFilter = 'pending'" :class="{ active: currentFilter === 'pending' }" class="filter-btn">待完成</button>
      <button @click="currentFilter = 'completed'" :class="{ active: currentFilter === 'completed' }" class="filter-btn">已完成</button>
    </div>

    <!-- Todo 列表 -->
    <div class="todos-container">
      <div v-for="todo in filteredTodos" :key="todo.id" class="todo-item" :class="{ completed: todo.isCompleted }">
        <div class="todo-content">
          <div class="todo-header-row">
            <div class="todo-title">
              <input type="checkbox" :checked="todo.isCompleted" @change="toggleTodo(todo.id)" class="todo-checkbox" />
              <h3>{{ todo.name }}</h3>
            </div>
            <div class="todo-actions">
              <button @click="editTodo(todo)" class="action-btn edit-btn">
                <v-icon name="edit" scale="1.2" />
              </button>
              <button @click="handleDeleteTodo(todo.id)" class="action-btn delete-btn">
                <v-icon name="trash-alt" scale="1.2" />
              </button>
            </div>
          </div>

          <p class="todo-description">{{ todo.content }}</p>

          <div class="todo-details">
            <div class="detail-item">
              <span class="detail-icon"><v-icon name="calendar-alt" scale="1" /></span>
              <span>{{ todo.date }}</span>
            </div>
            <div class="detail-item" v-if="todo.time">
              <span class="detail-icon"><v-icon name="clock" scale="1" /></span>
              <span>{{ todo.time }} 小時</span>
            </div>
            <div class="detail-item" v-if="todo.location">
              <span class="detail-icon"><v-icon name="map-marker-alt" scale="1" /></span>
              <span>{{ todo.location }}</span>
            </div>
          </div>

          <div class="todo-remarks" v-if="todo.remarks">
            <span class="detail-icon"><v-icon name="sticky-note" scale="1" /></span>
            <span>{{ todo.remarks }}</span>
          </div>
        </div>
      </div>

      <div v-if="filteredTodos.length === 0" class="empty-state">
        <div class="empty-icon"><v-icon name="clipboard" scale="2" /></div>
        <p>目前沒有待辦事項</p>
        <button @click="showAddForm = true" class="add-first-btn">新增第一個待辦事項</button>
      </div>
    </div>

    <!-- 新增/編輯表單 -->
    <TodoForm v-if="showAddForm || editingTodo" :todo="editingTodo" @close="closeForm" @save="saveTodo" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import TodoForm from '../components/TodoForm.vue'

export default {
  name: 'TodoList',
  components: { TodoForm },
  data () {
    return {
      showAddForm: false,
      editingTodo: null,
      currentFilter: 'all'
    }
  },
  computed: {
    // 將 Vuex 中的 getters 映射為 computed 屬性
    // mapGetters 是 Vuex 的一個語法糖，用來「快速將 Vuex 的 getters 映射到組件的 computed 屬性中」，這樣你就可以直接在組件裡使用 this.allTodos 之類的語法了，不需要自己一筆筆寫

    // 如果是模組化的情況
    // 則需要在第一個參數指定模組名稱
    // 第二個參數則是 getters 方法陣列
    ...mapGetters('todos', ['allTodos', 'completedTodos', 'pendingTodos']),

    // 根據篩選條件回傳對應的待辦清單
    filteredTodos () {
      switch (this.currentFilter) {
        case 'completed':
          return this.completedTodos
        case 'pending':
          return this.pendingTodos
        default:
          return this.allTodos
      }
    }
  },
  methods: {
    // 將 Vuex 中的 actions 映射為本地方法
    // mapActions 是 Vuex 的另一個語法糖，用來「快速將 Vuex 的 actions 映射到組件的 methods 中」，這樣你就可以直接在組件裡使用 this.addTodo() 之類的語法了，不需要自己一筆筆寫

    // 如果是模組化的情況
    // 則需要在第一個參數指定模組名稱
    // 第二個參數則是 actions 方法陣列
    ...mapActions('todos', ['addTodo', 'updateTodo', 'deleteTodo', 'toggleTodo']),

    // 開啟編輯模式
    editTodo (todo) {
      this.editingTodo = { ...todo }
    },

    // 關閉表單
    closeForm () {
      this.showAddForm = false
      this.editingTodo = null
    },

    // 儲存待辦（新增或編輯）
    saveTodo (todoData) {
      if (this.editingTodo) {
        this.updateTodo({
          ...todoData,
          id: this.editingTodo.id,
          isCompleted: this.editingTodo.isCompleted
        })
      } else {
        this.addTodo(todoData)
      }
      this.closeForm()
    },

    // 刪除待辦
    async handleDeleteTodo (id) {
      if (confirm('確定要刪除這個待辦事項嗎？')) {
        this.deleteTodo(id)
      }
    }
  }
}
</script>

<style scoped>
.todo-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  color: #333;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(136, 184, 136, 0.2);
}

.todo-header h1 {
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(45deg, #87ceeb, #b0e0e6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.add-btn {
  background: linear-gradient(45deg, #87ceeb, #b0e0e6);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  gap: 20px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  flex: 1;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(136, 184, 136, 0.2);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #87ceeb;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(135, 206, 235, 0.3);
  padding: 10px 20px;
  border-radius: 20px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: linear-gradient(45deg, #87ceeb, #b0e0e6);
  border-color: transparent;
}

.todos-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.todo-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(135, 206, 235, 0.2);
  transition: all 0.3s ease;
}

.todo-item.completed {
  opacity: 0.7;
  background: rgba(135, 206, 235, 0.15);
  border-color: rgba(135, 206, 235, 0.3);
  transform: scale(0.98);
}

.todo-item.completed .todo-description {
  color: #999;
}

.todo-item.completed .detail-item {
  color: #777;
}

.todo-item.completed .todo-remarks {
  color: #87ceeb;
  background: rgba(135, 206, 235, 0.1);
}

.todo-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.todo-title {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #87ceeb;
}

.todo-title h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.todo-item.completed .todo-title h3 {
  text-decoration: line-through;
  color: #888;
}

.todo-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
  color: #333;
}

.action-btn svg {
  fill: currentColor;
  stroke: currentColor;
}

.edit-btn:hover {
  background: rgba(255, 193, 7, 0.2);
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.2);
}

.todo-description {
  margin: 10px 0;
  color: #666;
  line-height: 1.5;
}

.todo-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 15px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #666;
}

.detail-item svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.detail-icon {
  font-size: 1rem;
  color: #666;
  display: flex;
  align-items: center;
}

.detail-icon svg {
  fill: currentColor;
  stroke: currentColor;
}

.todo-remarks {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  padding: 10px;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #87ceeb;
}

.todo-remarks .detail-icon {
  color: #87ceeb;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #87ceeb;
}

.empty-icon svg {
  fill: currentColor;
  stroke: currentColor;
}

.add-first-btn {
  background: linear-gradient(45deg, #87ceeb, #b0e0e6);
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.add-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
}

@media (max-width: 768px) {
  .todo-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .todo-header h1 {
    font-size: 1.5rem;
  }

  .stats {
    flex-direction: column;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .todo-details {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
