<template>
  <div class="todo-list">
    <div class="todo-header">
      <div class="header-content">
        <h1>我的待辦清單</h1>
        <div class="header-buttons">
          <button @click="handleImportExcel" class="import-btn"><v-icon name="upload" scale="1" /> 匯入 Excel</button>
          <button @click="handleExportExcel" class="export-btn"><v-icon name="download" scale="1" /> 匯出 Excel</button>
          <button @click="handleResetData" class="reset-btn"><v-icon name="sync" scale="1" /> 重置資料</button>
        </div>
        <div class="tips">
          <p>✨ 被新增的待辦事項會被保存在本地的設備端</p>
          <p>✨ 點選重置資料將清空本地資料並恢復成 Demo 模式</p>
          <p>✨ 可利用匯入/匯出 Excel 功能備份或還原資料</p>
        </div>
      </div>
      <button @click="showAddForm = true" class="add-btn"><span>➕</span> 新增待辦事項</button>
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

    <!-- 日期篩選器 -->
    <div class="date-filter">
      <div class="date-filter-content">
        <label for="dateFilter" class="date-label">
          <v-icon name="calendar-alt" scale="1" />
          日期篩選
        </label>
        <div class="date-input-group">
          <input
            type="date"
            id="dateFilter"
            v-model="dateFilter"
            @change="handleDateFilterChange"
            class="date-input"
            :placeholder="dateFilter ? '' : '選擇日期'"
          />
          <button v-if="dateFilter" @click="clearDateFilter" class="clear-date-btn" title="清除日期篩選">
            <v-icon name="times" scale="1" />
          </button>
        </div>
      </div>
      <div v-if="dateFilter" class="date-filter-info">
        <span>顯示 {{ dateFilter }} 之後的待辦事項</span>
      </div>
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
import * as XLSX from 'xlsx'

export default {
  name: 'TodoList',
  components: { TodoForm },
  data () {
    return {
      showAddForm: false,
      editingTodo: null,
      currentFilter: 'all',
      dateFilter: localStorage.getItem('todoDateFilter') || ''
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
      // 直接從 Vuex state 獲取原始資料，避免 getters 的排序干擾
      const allTodos = this.$store.state.todos.todos

      // 根據篩選條件篩選
      let todos = allTodos
      if (this.currentFilter === 'completed') {
        todos = allTodos.filter((todo) => todo.isCompleted)
      } else if (this.currentFilter === 'pending') {
        todos = allTodos.filter((todo) => !todo.isCompleted)
      }

      // 根據日期篩選
      if (this.dateFilter) {
        todos = todos.filter((todo) => {
          const todoDate = new Date(todo.date)
          const filterDate = new Date(this.dateFilter)
          return todoDate >= filterDate
        })
      }

      // 按照 ID 排序：ID 愈大的排在愈前面
      const sortedTodos = todos.sort((a, b) => b.id - a.id)

      return sortedTodos
    }
  },
  methods: {
    // 將 Vuex 中的 actions 映射為本地方法
    // mapActions 是 Vuex 的另一個語法糖，用來「快速將 Vuex 的 actions 映射到組件的 methods 中」，這樣你就可以直接在組件裡使用 this.addTodo() 之類的語法了，不需要自己一筆筆寫

    // 如果是模組化的情況
    // 則需要在第一個參數指定模組名稱
    // 第二個參數則是 actions 方法陣列
    ...mapActions('todos', ['addTodo', 'updateTodo', 'deleteTodo', 'toggleTodo', 'clearAllData']),

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
          id: this.editingTodo.id,
          ...todoData
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
    },

    // 重置資料
    handleResetData () {
      if (confirm('確定要重置所有資料嗎？這將會清除所有自訂的待辦事項並恢復為範例資料。')) {
        this.clearAllData()
      }
    },

    // 匯出 Excel
    handleExportExcel () {
      try {
        // 按照 ID 排序：ID 愈大的排在愈前面
        const sortedTodos = [...this.$store.state.todos.todos].sort((a, b) => b.id - a.id)

        // 準備 Excel 資料
        const excelData = sortedTodos.map((todo, index) => [
          index + 1, // 序號
          todo.date,
          todo.name,
          todo.content || '',
          todo.timeNeeded || '',
          todo.location || '',
          todo.remarks || '',
          todo.isCompleted ? '已完成' : '未完成'
        ])

        // 建立工作簿
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([['序號', '日期', '標題', '內容', '所需時間', '地點', '備註', '狀態'], ...excelData])

        // 設定欄寬
        const colWidths = [8, 12, 20, 30, 12, 15, 20, 10]
        ws['!cols'] = colWidths.map((width) => ({ width }))

        // 加入工作簿並下載
        XLSX.utils.book_append_sheet(wb, ws, '待辦清單')
        const fileName = `待辦清單_${new Date().toISOString().split('T')[0]}.xlsx`
        XLSX.writeFile(wb, fileName)

        alert('匯出成功！')
      } catch (error) {
        console.error('匯出失敗：', error)
        alert('匯出失敗，請稍後再試')
      }
    },

    // 匯入 Excel
    handleImportExcel () {
      // 創建隱藏的檔案輸入元素
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = '.xlsx,.xls'
      fileInput.style.display = 'none'

      fileInput.onchange = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            // 跳過標題行，處理資料行
            const importedTodos = jsonData.slice(1).map((row, index) => {
              // 解析狀態欄位
              const statusText = row[7] || ''
              const isCompleted = statusText === '已完成'

              return {
                id: Date.now() + (jsonData.length - 1 - index), // 顛倒 ID 順序
                date: row[1] || new Date().toISOString().split('T')[0],
                name: row[2] || '',
                content: row[3] || null,
                timeNeeded: row[4] || null,
                location: row[5] || null,
                remarks: row[6] || null,
                isCompleted: isCompleted
              }
            })

            // 確認匯入
            if (confirm(`確定要匯入 ${importedTodos.length} 個待辦事項嗎？這將會覆蓋現有的待辦清單。`)) {
              // 清除現有資料
              this.clearAllData()

              // 逐個添加匯入的待辦事項
              importedTodos.forEach((todo) => {
                // 直接傳遞包含 isCompleted 的完整 todo 物件
                this.addTodo(todo)
              })

              // 強制更新 Vue 響應式系統
              this.$forceUpdate()

              alert('匯入成功！')
            }
          } catch (error) {
            console.error('匯入失敗：', error)
            alert('匯入失敗，請檢查檔案格式是否正確')
          }
        }

        reader.readAsArrayBuffer(file)
      }

      // 觸發檔案選擇
      document.body.appendChild(fileInput)
      fileInput.click()
      document.body.removeChild(fileInput)
    },

    // 處理日期篩選變更
    handleDateFilterChange () {
      // 保存到 localStorage
      if (this.dateFilter) {
        localStorage.setItem('todoDateFilter', this.dateFilter)
      } else {
        localStorage.removeItem('todoDateFilter')
      }
    },

    // 清除日期篩選
    clearDateFilter () {
      this.dateFilter = ''
      localStorage.removeItem('todoDateFilter')
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
  align-items: flex-start;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(136, 184, 136, 0.2);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
  text-align: left;
}

.header-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
}

.todo-header h1 {
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(45deg, #87ceeb, #b0e0e6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.reset-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 5px 0;
  border-radius: 5px;
  transition: all 0.3s ease;
  color: #666;
  margin-left: 0;
  align-self: flex-start;
}

.reset-btn:hover {
  background: rgba(255, 193, 7, 0.2);
}

.export-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 5px 0;
  border-radius: 5px;
  transition: all 0.3s ease;
  color: #666;
  margin-left: 0;
  align-self: flex-start;
}

.export-btn:hover {
  background: rgba(76, 175, 80, 0.2);
}

.import-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 5px 0;
  border-radius: 5px;
  transition: all 0.3s ease;
  color: #666;
  margin-left: 0;
  align-self: flex-start;
}

.import-btn:hover {
  background: rgba(33, 150, 243, 0.2);
}

.tips {
  margin-top: 2px;
}

.tips p {
  margin: 2px 0;
  font-size: 0.8rem;
  color: #888;
  line-height: 1.4;
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
  margin-top: 0;
  align-self: flex-start;
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

.date-filter {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(135, 206, 235, 0.2);
}

.date-filter-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.date-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
  font-size: 1rem;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {
  padding: 10px 15px;
  border: 1px solid rgba(135, 206, 235, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #333;
  transition: all 0.3s ease;
}

.date-input:focus {
  outline: none;
  border-color: #87ceeb;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.1);
}

.clear-date-btn {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #f44336;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-date-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  transform: scale(1.05);
}

.date-filter-info {
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #87ceeb;
  border-left: 3px solid #87ceeb;
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
  .todo-list {
    padding: 15px;
  }

  .todo-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .header-content {
    align-items: flex-start;
    text-align: left;
  }

  .header-buttons {
    flex-direction: row;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .todo-header h1 {
    font-size: 1.5rem;
  }

  .import-btn,
  .export-btn,
  .reset-btn {
    font-size: 0.8rem;
    padding: 4px 0;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
    padding: 15px 24px;
  }

  .stats {
    flex-direction: column;
    gap: 15px;
  }

  .stat-item {
    padding: 15px;
  }

  .filter-tabs {
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .date-filter {
    padding: 15px;
  }

  .date-filter-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .date-input-group {
    width: 100%;
  }

  .date-input {
    flex: 1;
    font-size: 0.9rem;
    padding: 8px 12px;
  }

  .date-label {
    font-size: 0.9rem;
  }

  .todo-item {
    padding: 15px;
  }

  .todo-header-row {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .todo-title {
    flex: 1;
    justify-content: flex-start;
    gap: 8px;
  }

  .todo-actions {
    flex-shrink: 0;
  }

  .todo-details {
    flex-direction: column;
    gap: 8px;
  }

  .detail-item {
    font-size: 0.85rem;
  }

  .todo-remarks {
    font-size: 0.85rem;
    padding: 8px;
  }

  .empty-state {
    padding: 40px 15px;
  }

  .empty-icon {
    font-size: 3rem;
  }
}
</style>
