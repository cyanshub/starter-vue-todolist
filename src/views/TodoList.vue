<template>
  <div class="todo-list">
    <div class="todo-header">
      <div class="header-content">
        <h1>我的行動清單</h1>
        <div class="header-buttons">
          <button @click="handleImportExcel" class="import-btn"><v-icon name="download" scale="1" /> 匯入 Excel</button>
          <button @click="handleExportExcel" class="export-btn"><v-icon name="upload" scale="1" /> 匯出 Excel</button>
          <button @click="handleResetData" class="reset-btn"><v-icon name="sync" scale="1" /> 重置資料</button>
        </div>
        <div class="tips">
          <p>✨ 待辦事項僅儲存於您的設備，無後端資料庫</p>
          <p>✨ 點選重置資料將清空本地資料並恢復成 Demo 模式</p>
          <p>✨ 可利用匯入/匯出 Excel 功能備份或還原資料</p>
          <p>✨ 可自定義標籤，並選擇標籤決定要列出的事項</p>
        </div>
      </div>
      <button @click="showAddForm = true" class="add-btn"><span>➕</span> 新增待辦事項</button>
    </div>

    <!-- 統計資訊 -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-number">{{ filteredPendingTodos.length }}</span>
        <span class="stat-label">待完成</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ filteredCompletedTodos.length }}</span>
        <span class="stat-label">已完成</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ filteredTodos.length }}</span>
        <span class="stat-label">總計</span>
      </div>
    </div>

    <!-- 篩選器 -->
    <div class="filter-section">
      <div class="tag-filter">
        <div class="tag-select-container">
          <select v-model="selectedTag" @change="handleTagFilterChange" class="tag-select">
            <option value="">所有標籤</option>
            <option v-for="tag in availableTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>
      </div>

      <div class="filter-tabs">
        <button @click="currentFilter = 'all'" :class="{ active: currentFilter === 'all' }" class="filter-btn">全部</button>
        <button @click="currentFilter = 'pending'" :class="{ active: currentFilter === 'pending' }" class="filter-btn">待完成</button>
        <button @click="currentFilter = 'completed'" :class="{ active: currentFilter === 'completed' }" class="filter-btn">已完成</button>
      </div>
    </div>

    <!-- 日期篩選器 -->
    <div class="date-filter">
      <div class="date-filter-content">
        <label @click="showDatePicker = true" class="date-label clickable">
          <v-icon name="calendar-alt" scale="1" />
          日期篩選
        </label>
        <div class="date-input-group">
          <input
            v-if="dateFilter"
            type="date"
            id="dateFilter"
            style="color: #555"
            v-model="dateFilter"
            @change="handleDateFilterChange"
            class="date-input"
            placeholder="選擇指定日期之後的待辦事項"
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

    <!-- 日期選擇器彈窗 -->
    <div v-if="showDatePicker" class="date-picker-overlay" @click="closeDatePicker">
      <div class="date-picker-modal" @click.stop>
        <div class="date-picker-header">
          <h3>選擇日期</h3>
          <button @click="closeDatePicker" class="close-btn">
            <v-icon name="times" scale="1.2" />
          </button>
        </div>

        <div class="date-picker-content">
          <div class="month-navigation">
            <button @click="previousMonth" class="nav-btn">
              <v-icon name="chevron-left" scale="1" />
            </button>
            <span class="current-month">{{ currentMonthYear }}</span>
            <button @click="nextMonth" class="nav-btn">
              <v-icon name="chevron-right" scale="1" />
            </button>
          </div>

          <div class="calendar-grid">
            <div class="weekdays">
              <span v-for="day in weekdays" :key="day" class="weekday">{{ day }}</span>
            </div>
            <div class="days">
              <span
                v-for="day in calendarDays"
                :key="day.key"
                :class="['day', { 'other-month': day.otherMonth }, { selected: day.selected }, { today: day.today }]"
                @click="selectDate(day)"
              >
                {{ day.day }}
              </span>
            </div>
          </div>
        </div>

        <div class="date-picker-footer">
          <button @click="clearDate" class="clear-btn">清除</button>
          <button @click="selectToday" class="today-btn">今天</button>
        </div>
      </div>
    </div>

    <!-- 手機版新增按鈕 -->
    <button @click="showAddForm = true" class="add-btn mobile-add-btn"><span>➕</span> 新增待辦事項</button>

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
              <button @click="copyTodo(todo)" class="action-btn copy-btn" title="複製待辦事項">
                <v-icon name="copy" scale="1.2" />
              </button>
              <button @click="editTodo(todo)" class="action-btn edit-btn" title="編輯待辦事項">
                <v-icon name="edit" scale="1.2" />
              </button>
              <button @click="handleDeleteTodo(todo.id)" class="action-btn delete-btn" title="刪除待辦事項">
                <v-icon name="trash-alt" scale="1.2" />
              </button>
            </div>
          </div>

          <p class="todo-description" v-if="todo.content" v-html="formatContent(todo.content)"></p>

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

          <div class="todo-tags" v-if="todo.tag">
            <span class="detail-icon"><v-icon name="tags" scale="1" /></span>
            <div class="tags-container">
              <span v-for="tag in todo.tag.split(' ').filter((t) => t.trim())" :key="tag" class="tag-item">{{ tag }}</span>
            </div>
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
      dateFilter: localStorage.getItem('todoDateFilter') || '',
      selectedTag: localStorage.getItem('todoSelectedTag') || '',
      showDatePicker: false,
      currentDate: new Date(),
      weekdays: ['日', '一', '二', '三', '四', '五', '六']
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

      // 根據標籤篩選
      if (this.selectedTag) {
        todos = todos.filter((todo) => {
          if (!todo.tag) return false
          const tags = todo.tag.split(' ').map((tag) => tag.trim())
          return tags.includes(this.selectedTag)
        })
      }

      // 按照 ID 排序：ID 愈大的排在愈前面
      const sortedTodos = todos.sort((a, b) => b.id - a.id)

      return sortedTodos
    },
    // 篩選後的待完成項目
    filteredPendingTodos () {
      return this.filteredTodos.filter((todo) => !todo.isCompleted)
    },
    // 篩選後的已完成項目
    filteredCompletedTodos () {
      return this.filteredTodos.filter((todo) => todo.isCompleted)
    },
    currentMonthYear () {
      return `${this.currentDate.getFullYear()}年${this.currentDate.getMonth() + 1}月`
    },
    calendarDays () {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      const today = new Date()

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const isOtherMonth = date.getMonth() !== month
        const isSelected = this.dateFilter && date.toISOString().split('T')[0] === this.dateFilter
        const isToday = date.toDateString() === today.toDateString()

        days.push({
          key: date.toISOString(),
          day: date.getDate(),
          date: date.toISOString().split('T')[0],
          otherMonth: isOtherMonth,
          selected: isSelected,
          today: isToday
        })
      }

      return days
    },
    // 可用的標籤列表
    availableTags () {
      // 使用當前篩選後的待辦事項來提取標籤
      const filteredTodos = this.filteredTodos
      const tagSet = new Set()

      filteredTodos.forEach((todo) => {
        if (todo.tag) {
          // 分割標籤並清理空白
          const tags = todo.tag.split(' ').filter((tag) => tag.trim() !== '')
          tags.forEach((tag) => tagSet.add(tag.trim()))
        }
      })

      // 轉換為陣列並排序
      return Array.from(tagSet).sort()
    }
  },
  methods: {
    // 將 Vuex 中的 actions 映射為本地方法
    // mapActions 是 Vuex 的另一個語法糖，用來「快速將 Vuex 的 actions 映射到組件的 methods 中」，這樣你就可以直接在組件裡使用 this.addTodo() 之類的語法了，不需要自己一筆筆寫

    // 如果是模組化的情況
    // 則需要在第一個參數指定模組名稱
    // 第二個參數則是 actions 方法陣列
    ...mapActions('todos', ['addTodo', 'updateTodo', 'deleteTodo', 'toggleTodo', 'clearAllData']),

    // 格式化內容，將 URL 轉換為可點擊的連結
    formatContent (content) {
      if (!content) return ''

      // 正則表達式匹配 http/https URL
      const urlRegex = /(https?:\/\/[^\s]+)/g

      // 將 URL 替換為 HTML 連結，使用內嵌樣式定義暗藍色
      return content.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1e3a8a; text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.color='#0f172a'; this.style.textDecoration='underline';" onmouseout="this.style.color='#1e3a8a'; this.style.textDecoration='none';">${url}</a>`
      })
    },

    // 複製待辦事項
    copyTodo (todo) {
      // 獲取當前日期
      const today = new Date().toISOString().split('T')[0]

      // 創建複製的待辦事項，移除 id 並設定新的屬性
      const copiedTodo = {
        ...todo,
        id: undefined, // 移除 id，讓系統自動生成新的 id
        date: today, // 設定為今天的日期
        isCompleted: false // 設定為未完成狀態
      }

      // 添加新的待辦事項
      this.addTodo(copiedTodo)
    },

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
          todo.tag || '',
          todo.isCompleted ? '已完成' : '未完成'
        ])

        // 建立工作簿
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.aoa_to_sheet([['序號', '日期', '標題', '內容', '所需時間', '地點', '備註', '標籤', '狀態'], ...excelData])

        // 設定欄寬
        const colWidths = [8, 12, 20, 30, 12, 15, 20, 15, 10]
        ws['!cols'] = colWidths.map((width) => ({ width }))

        // 加入工作簿並下載
        XLSX.utils.book_append_sheet(wb, ws, '待辦清單')
        const fileName = `行動清單_${new Date().toISOString().split('T')[0]}.xlsx`
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
              // 解析狀態欄位（標籤欄位後移一位）
              const statusText = row[8] || ''
              const isCompleted = statusText === '已完成'

              return {
                id: Date.now() + (jsonData.length - 1 - index), // 顛倒 ID 順序
                date: row[1] || new Date().toISOString().split('T')[0],
                name: row[2] || '',
                content: row[3] || null,
                timeNeeded: row[4] || null,
                location: row[5] || null,
                remarks: row[6] || null,
                tag: row[7] || null,
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
    },

    // 日期選擇器方法
    selectDate (day) {
      if (day.otherMonth) return
      this.dateFilter = day.date
      this.handleDateFilterChange()
      this.closeDatePicker()
    },

    selectToday () {
      const today = new Date().toISOString().split('T')[0]
      this.dateFilter = today
      this.handleDateFilterChange()
      this.closeDatePicker()
    },

    clearDate () {
      this.dateFilter = ''
      localStorage.removeItem('todoDateFilter')
      this.closeDatePicker()
    },

    previousMonth () {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },

    nextMonth () {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },

    closeDatePicker () {
      this.showDatePicker = false
    },

    // 處理標籤篩選變更
    handleTagFilterChange () {
      // 保存到 localStorage
      if (this.selectedTag) {
        localStorage.setItem('todoSelectedTag', this.selectedTag)
      } else {
        localStorage.removeItem('todoSelectedTag')
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

/* 手機版新增按鈕 - 預設隱藏 */
.mobile-add-btn {
  display: none;
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

.filter-section {
  display: flex;
  flex-direction: row;
  gap: 15px;
  margin-bottom: 30px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
}

.filter-tabs {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex: 1;
  min-width: 180px;
  margin-left: 20px;
}

.tag-filter {
  display: flex;
  justify-content: flex-start;
  flex: 1;
  min-width: 180px;
  margin-right: 20px;
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

.tag-select-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tag-select {
  padding: 10px 15px;
  border: 1px solid rgba(135, 206, 235, 0.3);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 200px;
  width: 100%;
}

.tag-select:focus {
  outline: none;
  border-color: #87ceeb;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.1);
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

.date-label.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.date-label.clickable:hover {
  color: #87ceeb;
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
  border: 1px solid rgba(135, 206, 235, 0.1);
  background-color: #87ceeb1a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-date-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  transform: scale(1.05);
}

/* 日期選擇器彈窗樣式 */
.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.date-picker-modal {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 350px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.date-picker-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.date-picker-content {
  padding: 20px;
}

.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #87ceeb;
  padding: 8px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(135, 206, 235, 0.1);
}

.current-month {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.calendar-grid {
  display: grid;
  gap: 5px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
  padding: 8px 0;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  text-align: center;
  padding: 10px 5px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.day:hover:not(.other-month) {
  background: rgba(135, 206, 235, 0.1);
}

.day.other-month {
  color: #ccc;
  cursor: default;
}

.day.selected {
  background: #87ceeb;
  color: white;
  font-weight: 600;
}

.day.today {
  background: rgba(135, 206, 235, 0.2);
  font-weight: 600;
}

.day.today.selected {
  background: #87ceeb;
  color: white;
}

.date-picker-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.today-btn,
.clear-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.today-btn {
  background: #87ceeb;
  color: white;
}

.today-btn:hover {
  background: #7bb8d9;
}

.clear-btn {
  background: rgba(135, 206, 235, 0.1);
  color: #87ceeb;
  border: 1px solid rgba(135, 206, 235, 0.3);
}

.clear-btn:hover {
  background: rgba(135, 206, 235, 0.2);
  border-color: #87ceeb;
}

@media (max-width: 768px) {
  .date-picker-modal {
    width: 95%;
    max-width: 320px;
    max-height: 80vh;
  }

  .date-picker-header {
    padding: 15px;
  }

  .date-picker-content {
    padding: 15px;
  }

  .date-picker-footer {
    padding: 15px;
  }

  .day {
    padding: 8px 3px;
    font-size: 0.85rem;
  }

  .filter-section {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .filter-tabs {
    margin-right: 0;
    min-width: 0;
    width: 100%;
    justify-content: center;
  }

  .tag-filter {
    margin-left: 0;
    min-width: 0;
    width: 100%;
    justify-content: center;
  }

  .filter-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .tag-select-container {
    width: 100%;
  }

  .tag-select {
    min-width: 100%;
    font-size: 0.9rem;
    padding: 8px 12px;
    width: 100%;
  }

  .tag-select-hint {
    font-size: 0.6rem;
    text-align: right;
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

/* 手機橫放時的樣式 */
@media (max-width: 768px) and (orientation: landscape) {
  .date-picker-overlay {
    align-items: flex-start;
    padding: 10px;
  }

  .date-picker-modal {
    width: 95%;
    max-width: 350px;
    max-height: 60vh;
    margin-top: 20px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .date-picker-header {
    padding: 8px 12px;
  }

  .date-picker-header h3 {
    font-size: 1rem;
  }

  .date-picker-content {
    padding: 8px 12px;
  }

  .date-picker-footer {
    padding: 8px 12px;
  }

  .day {
    padding: 4px 1px;
    font-size: 0.75rem;
  }

  .weekday {
    font-size: 0.75rem;
    padding: 4px 0;
  }

  .current-month {
    font-size: 0.9rem;
  }

  .nav-btn {
    padding: 4px;
    font-size: 0.8rem;
  }

  .today-btn,
  .clear-btn {
    padding: 8px;
    font-size: 0.9rem;
  }
}

/* 極小螢幕的額外調整 */
@media (max-width: 480px) and (orientation: landscape) {
  .date-picker-overlay {
    padding: 5px;
  }

  .date-picker-modal {
    width: 98%;
    max-width: 300px;
    max-height: 50vh;
    margin-top: 10px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .date-picker-header {
    padding: 6px 10px;
  }

  .date-picker-header h3 {
    font-size: 0.9rem;
  }

  .date-picker-content {
    padding: 6px 10px;
  }

  .date-picker-footer {
    padding: 6px 10px;
  }

  .day {
    padding: 3px 1px;
    font-size: 0.7rem;
  }

  .weekday {
    font-size: 0.7rem;
    padding: 3px 0;
  }

  .current-month {
    font-size: 0.8rem;
  }

  .nav-btn {
    padding: 3px;
    font-size: 0.7rem;
  }

  .today-btn,
  .clear-btn {
    padding: 6px;
    font-size: 0.8rem;
  }
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

.copy-btn:hover {
  background: rgba(33, 150, 243, 0.2);
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
  white-space: pre-wrap;
  word-wrap: break-word;
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

.todo-tags {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
}

.todo-tags .detail-icon {
  color: #ffc107;
  flex-shrink: 0;
  margin-top: 1px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag-item {
  background: rgba(255, 193, 7, 0.2);
  color: #b8860b;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid rgba(255, 193, 7, 0.3);
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

  /* 隱藏桌面版新增按鈕 */
  .todo-header .add-btn {
    display: none;
  }

  /* 顯示手機版新增按鈕 */
  .mobile-add-btn {
    display: flex !important;
    width: 100%;
    justify-content: center;
    padding: 15px 24px;
    margin-bottom: 20px;
  }

  .stats {
    flex-direction: column;
    gap: 15px;
  }

  .stat-item {
    padding: 15px;
  }

  .filter-section {
    gap: 12px;
    flex-direction: column;
  }

  .filter-tabs {
    flex-wrap: wrap;
    gap: 8px;
    order: 1;
  }

  .tag-filter {
    order: 2;
  }

  .filter-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .tag-select-container {
    width: 100%;
  }

  .tag-select {
    min-width: 100%;
    font-size: 0.9rem;
    padding: 8px 12px;
    width: 100%;
  }

  .tag-select-hint {
    font-size: 0.6rem;
    text-align: right;
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
