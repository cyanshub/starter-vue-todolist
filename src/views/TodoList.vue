<template>
  <div class="todo-list">
    <div class="todo-header">
      <div class="header-content">
        <h1>今日待辦帖</h1>
        <div class="header-buttons">
          <button @click="handleImportExcel" class="import-btn"><v-icon name="download" scale="1" /> 匯入 Excel</button>
          <button @click="handleExportExcel" class="export-btn"><v-icon name="upload" scale="1" /> 匯出 Excel</button>
          <button @click="handleResetData" class="reset-btn"><v-icon name="sync" scale="1" /> 重置資料</button>
        </div>
        <div class="tips">
          <p>✨ 只要貼上圖片網址，就能在待辦事項中顯示圖片！</p>
          <p>✨ 資料存放在用戶端，只有同一台裝置與瀏覽器才看得見！</p>
          <p>✨ 支援匯出/匯入、自訂標籤、重置為 Demo 模式等功能！</p>
        </div>
      </div>
      <button @click="showAddForm = true" class="add-btn">
        <span>➕</span> {{ filteredTodos.length === 0 ? '新增第一個待辦事項' : '新增待辦事項' }}
      </button>
    </div>

    <!-- 統計資訊 -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-number">{{ filteredTodos.length }}</span>
        <span class="stat-label">總計</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ filteredPendingTodos.length }}</span>
        <span class="stat-label">待完成</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ filteredCompletedTodos.length }}</span>
        <span class="stat-label">已完成</span>
      </div>
    </div>

    <!-- 篩選器 -->
    <div class="filter-section">
      <div class="tag-filter">
        <div class="tag-select-container">
          <select v-model="selectedTag" @change="handleTagFilterChange" class="tag-select">
            <option value="">所有標籤</option>
            <option v-for="tag in availableTags" :key="tag" :value="tag">{{ truncateTag(tag) }}</option>
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
    <div class="date-filter" :class="{ 'has-date': dateFilter }">
      <div class="date-filter-content">
        <label @click="showDatePicker = true" class="date-label clickable">
          <v-icon name="calendar-alt" scale="1" />
          {{ dateFilter ? '從這天開始顯示' : '選擇從哪一天開始顯示' }}
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
            placeholder="選擇起始日期"
          />
          <button v-if="dateFilter" @click="clearDateFilter" class="clear-date-btn" title="清除日期篩選">
            <v-icon name="times" scale="1" />
          </button>
        </div>
      </div>
      <div v-if="dateFilter" class="date-filter-info">
        <span>目前只顯示 {{ dateFilter }} 之後的待辦事項</span>
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
    <button @click="showAddForm = true" class="add-btn mobile-add-btn">
      <span>➕</span> {{ filteredTodos.length === 0 ? '新增第一個待辦事項' : '新增待辦事項' }}
    </button>

    <!-- Todo 列表 -->
    <div class="todos-container">
      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="todo-item"
        :class="{ completed: todo.isCompleted, collapsed: isCollapsed(todo.id) }"
        :data-todo-id="todo.id"
      >
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
          <div class="collapse-row" v-if="collapsedEligible[todo.id]">
            <button class="collapse-button" @click="toggleCollapse(todo.id)">
              <v-icon :name="isCollapsed(todo.id) ? 'plus-circle' : 'minus-circle'" scale="1" />
              <span>{{ isCollapsed(todo.id) ? '查看更多' : '收合內容' }}</span>
            </button>
          </div>
          <div class="todo-body">
            <!-- 只摺疊描述內容 -->
            <div v-if="todo.content" class="todo-description-wrapper" :class="{ collapsed: isCollapsed(todo.id) }">
              <p class="todo-description" v-html="formatContent(todo.content)"></p>
            </div>
          </div>
          <!-- 以下資訊永遠顯示，移到 todo-body 外面 -->
          <div class="todo-details">
            <div class="detail-item" v-if="todo.date">
              <span class="detail-icon"><v-icon name="calendar-alt" scale="1" /></span>
              <span>{{ todo.date }}</span>
            </div>
            <div class="detail-item" v-if="todo.time">
              <span class="detail-icon"><v-icon name="clock" scale="1" /></span>
              <span>{{ todo.time }} 小時</span>
            </div>
            <div class="detail-item" v-if="todo.location">
              <span class="detail-icon"><v-icon name="map-marker-alt" scale="1" /></span>
              <span v-html="formatContent(todo.location, false)"></span>
            </div>
          </div>
          <div class="todo-remarks" v-if="todo.remarks">
            <span class="detail-icon"><v-icon name="sticky-note" scale="1" /></span>
            <span>{{ todo.remarks }}</span>
          </div>
          <div class="todo-tags" v-if="todo.tag">
            <span class="detail-icon"><v-icon name="tags" scale="1" /></span>
            <div class="tags-container">
              <span v-for="tag in todo.tag.split(' ').filter((t) => t.trim())" :key="tag" class="tag-item">{{ truncateTag(tag) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredTodos.length === 0" class="empty-state">
        <div class="empty-icon"><v-icon name="clipboard" scale="2" /></div>
        <p>目前沒有待辦事項</p>
      </div>
    </div>

    <!-- 新增/編輯表單 -->
    <TodoForm v-if="showAddForm || editingTodo" :todo="editingTodo" :filtered-tags="availableTags" @close="closeForm" @save="saveTodo" />
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
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      collapsedTodos: {},
      collapsedEligible: {}
    }
  },
  computed: {
    // 將 Vuex 中的 getters 映射為 computed 屬性
    // mapGetters 是 Vuex 的一個語法糖，用來「快速將 Vuex 的 getters 映射到組件的 computed 屬性中」
    // 如果是模組化的情況
    // 副屬需要傳 module 名稱
    // 副屬還是要傳 getters 方法數列
    ...mapGetters('todos', ['allTodos', 'completedTodos', 'pendingTodos']),

    // 根據篩選條件回傳對應的待辦清單
    filteredTodos () {
      // 直接從 Vuex state 讀取原始資料，避免 getters 的排序干擾
      const allTodos = this.$store.state.todos.todos
      // 根據篩選條件篩選
      let todos = allTodos
      if (this.currentFilter === 'completed') {
        // 只顯示已完成
        todos = allTodos.filter((todo) => todo.isCompleted)
      } else if (this.currentFilter === 'pending') {
        // 只顯示未完成
        todos = allTodos.filter((todo) => !todo.isCompleted)
      }
      // 日期篩選（只顯示指定日期之後的待辦）
      if (this.dateFilter) {
        todos = todos.filter((todo) => {
          const todoDate = new Date(todo.date)
          const filterDate = new Date(this.dateFilter)
          return todoDate >= filterDate
        })
      }
      // 標籤篩選（只顯示包含指定標籤的待辦）
      if (this.selectedTag) {
        todos = todos.filter((todo) => {
          if (!todo.tag) return false
          // 支援多標籤分割
          const tags = todo.tag.split(' ').map((tag) => tag.trim())
          return tags.includes(this.selectedTag)
        })
      }
      // 先依 id 再依日期排序（新到舊，日期新者優先）
      const sortedTodos = todos.sort((a, b) => b.id - a.id).sort((a, b) => new Date(b.date) - new Date(a.date))
      return sortedTodos
    },
    // 篩選出未完成的待辦清單（僅顯示未完成）
    filteredPendingTodos () {
      return this.filteredTodos.filter((todo) => !todo.isCompleted)
    },
    // 篩選出已完成的待辦清單（僅顯示已完成）
    filteredCompletedTodos () {
      return this.filteredTodos.filter((todo) => todo.isCompleted)
    },
    // 目前顯示的年月（給日期選擇器用，格式：2024年7月）
    currentMonthYear () {
      return `${this.currentDate.getFullYear()}年${this.currentDate.getMonth() + 1}月`
    },
    // 產生日曆格子資料（含本月與前後補齊的日期，支援選取與高亮今日）
    calendarDays () {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const startDate = new Date(firstDay)
      // 以本月第一天為基準，往前補到本週日
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const days = []
      const today = new Date()

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        // 使用本地日期格式，避免時區問題
        const localDateString = this.formatDateToLocalString(date)

        // 判斷是否為本月、是否選取、是否為今日
        const isOtherMonth = date.getMonth() !== month
        const isSelected = this.dateFilter && localDateString === this.dateFilter
        const isToday = date.toDateString() === today.toDateString()

        days.push({
          key: date.toISOString(),
          day: date.getDate(),
          date: localDateString,
          otherMonth: isOtherMonth,
          selected: isSelected,
          today: isToday
        })
      }

      return days
    },
    // 目前所有可用的標籤（依據篩選後的清單動態產生，去重排序）
    availableTags () {
      const filteredTodos = this.filteredTodos
      const tagSet = new Set()

      filteredTodos.forEach((todo) => {
        if (todo.tag) {
          // 支援多標籤分割與去除空白
          const tags = todo.tag.split(' ').filter((tag) => tag.trim() !== '')
          tags.forEach((tag) => tagSet.add(tag.trim()))
        }
      })

      // 轉為陣列並排序
      return Array.from(tagSet).sort()
    }
  },
  methods: {
    // 將 Vuex 中的 actions 映射為本地方法
    // mapActions 是 Vuex 的另一個語法糖，用來「快速將 Vuex 的 actions 映射到組件的 methods 中」
    // 如果是模組化的情況
    // 副屬需要傳 module 名稱
    // 副屬需要傳參數或直接複製名稱
    // 副屬需要傳 actions 方法或數列
    ...mapActions('todos', ['addTodo', 'updateTodo', 'deleteTodo', 'toggleTodo', 'clearAllData']),

    // 格式化內容，將 URL 轉換為可點擊連結或圖片
    formatContent (content, allowImages = true) {
      if (!content) return ''
      // 正則表達式匹配 http/https URL（包含以 @ 開頭的格式）和 Base64 圖片格式
      const urlRegex = /(@?https?:\/\/[^\s]+|data:image\/[^;]+;base64,[^\s]+)/g
      // 圖片格式的正則表達式，支援帶有 query 參數的 URL 和 Base64 格式
      const imageExtensions =
        /(\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif|ico)(\?.*)?$|^data:image\/(png|jpeg|jpg|gif|bmp|webp|svg|tiff|tif|ico);base64,)/i
      // 例外規則：只要網址 path 結尾是 /image 或 /images（不論有無 query/hash）
      const imageApiPattern = /\/images?(\?|#|$)/i
      // 逐一替換網址
      return content.replace(urlRegex, (url) => {
        if ((imageExtensions.test(url) || imageApiPattern.test(url)) && allowImages) {
          // 轉為圖片
          return `<img src="${url}" alt="圖片" style="
            width: 100%;
            height: auto;
            max-width: 100%;
            border-radius: 8px;
            margin: 8px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          " onerror="this.style.display='none';" />`
        } else {
          // 轉為超連結，過長自動截斷
          const displayText = url.length > 50 ? url.substring(0, 50) + '...' : url
          return `<a href="${url}" target="_blank" rel="noopener noreferrer"
            style="
              color: #5fb4d3;
              text-decoration: none;
              transition: all 0.3s ease;
              white-space: nowrap;
            "
            onmouseover="this.style.color='#0f172a'; this.style.textDecoration='underline';"
            onmouseout="this.style.color='#5fb4d3'; this.style.textDecoration='none';"
            onfocus="this.style.outline='2px solid #cceffc';"
            onblur="this.style.outline='none';"
            onmousedown="this.style.color='#1e3a8a';"
            onmouseup="this.style.color='#0f172a';"
            title="${url}"
          >${displayText}</a>`
        }
      })
    },

    // 標籤過長時自動截斷顯示（最多 13 字）
    truncateTag (tag) {
      if (!tag) return ''
      return tag.length > 13 ? tag.substring(0, 13) + '...' : tag
    },

    // 複製一筆待辦事項，日期設為今天、id 重新產生
    copyTodo (todo) {
      const today = this.getTaipeiDateString()
      // 產生新物件，id undefined 讓 store 自動分配
      const copiedTodo = {
        ...todo,
        id: undefined,
        date: today,
        isCompleted: false
      }
      if (confirm('確定要複製這個待辦事項嗎？')) {
        this.addTodo(copiedTodo)
      }
    },

    // 編輯待辦事項
    editTodo (todo) {
      this.editingTodo = { ...todo }
    },

    // 關閉表單
    closeForm () {
      this.showAddForm = false
      this.editingTodo = null
    },

    // 儲存待辦事項（新增或編輯）
    saveTodo (todoData) {
      if (this.editingTodo) {
        this.updateTodo({ ...this.editingTodo, ...todoData })
      } else {
        this.addTodo(todoData)
      }
      this.closeForm()
      this.checkAllTodoHeights()
    },

    // 更新待辦事項
    updateTodo (todoData) {
      this.$store.dispatch('todos/updateTodo', todoData)
      this.checkAllTodoHeights()
    },

    // 刪除待辦事項
    async handleDeleteTodo (id) {
      if (confirm('確定要刪除這個待辦事項嗎？')) {
        this.deleteTodo(id)
      }
    },

    // 重置所有資料
    handleResetData () {
      if (confirm('確定要重置所有資料嗎？這將會清除所有自訂的待辦事項並恢復為範例資料。')) {
        this.clearAllData()
        // 重置日期篩選
        this.dateFilter = ''
        this.selectedTag = ''
        // 強制更新 Vue 的 UI 顯示
        this.$nextTick(() => {
          this.$forceUpdate()
        })
      }
    },

    // 取得台北時間日期字串 (YYYY-MM-DD)
    getTaipeiDateString () {
      const now = new Date()
      // 轉換為 UTC+8
      const taipeiTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
      return taipeiTime.toISOString().split('T')[0]
    },

    // 格式化日期為本地字串 (YYYY-MM-DD)，避免時區問題
    formatDateToLocalString (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // 匯出 Excel
    handleExportExcel () {
      try {
        // 先按 ID 再按日期排序
        const sortedTodos = [...this.$store.state.todos.todos]
          .sort((a, b) => b.id - a.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))

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

        // 新增工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '待辦清單')
        const fileName = `今日待辦帖_${this.getTaipeiDateString()}.xlsx`
        XLSX.writeFile(wb, fileName)

        alert('匯出成功！')
      } catch (error) {
        console.error('匯出失敗：', error)
        alert('匯出失敗，請稍後再試')
      }
    },

    // 匯入 Excel
    handleImportExcel () {
      // 建立檔案選擇器
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

            // 轉換資料格式
            const importedTodos = jsonData.slice(1).map((row, index) => {
              // 檢查狀態欄位的完成狀態
              const statusText = row[8] || ''
              const isCompleted = statusText === '已完成'

              return {
                id: Date.now() + (jsonData.length - 1 - index), // 生成唯一 ID
                date: row[1] || this.getTaipeiDateString(),
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

              // 逐一新增匯入的待辦事項
              importedTodos.forEach((todo) => {
                // 確保 isCompleted 狀態正確傳遞
                this.addTodo(todo)
              })

              // 強制更新 Vue 的 UI 顯示
              this.$forceUpdate()
            }
          } catch (error) {
            console.error('匯入失敗：', error)
            alert('匯入失敗，請檢查檔案格式是否正確')
          }
        }

        reader.readAsArrayBuffer(file)
      }

      // 觸發檔案選擇器
      document.body.appendChild(fileInput)
      fileInput.click()
      document.body.removeChild(fileInput)
    },

    // 處理日期篩選變更
    handleDateFilterChange () {
      // 儲存到 localStorage
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

    // 選擇日期
    selectDate (day) {
      if (day.otherMonth) return
      this.dateFilter = day.date
      this.handleDateFilterChange()
      this.closeDatePicker()
    },

    // 選擇今天
    selectToday () {
      const today = this.getTaipeiDateString()
      this.dateFilter = today
      this.handleDateFilterChange()
      this.closeDatePicker()
    },

    // 清除日期
    clearDate () {
      this.dateFilter = ''
      localStorage.removeItem('todoDateFilter')
      this.closeDatePicker()
    },

    // 上個月
    previousMonth () {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },

    // 下個月
    nextMonth () {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },

    // 關閉日期選擇器
    closeDatePicker () {
      this.showDatePicker = false
    },

    // 處理標籤篩選變更
    handleTagFilterChange () {
      // 儲存到 localStorage
      if (this.selectedTag) {
        localStorage.setItem('todoSelectedTag', this.selectedTag)
      } else {
        localStorage.removeItem('todoSelectedTag')
      }
    },

    // 清除標籤篩選
    clearTagFilter () {
      this.selectedTag = ''
      localStorage.removeItem('todoSelectedTag')
    },

    checkAllTodoHeights () {
      this.$nextTick(() => {
        this.filteredTodos.forEach((todo) => {
          const todoElement = document.querySelector(`[data-todo-id="${todo.id}"]`)
          if (todoElement) {
            const descWrapper = todoElement.querySelector('.todo-description-wrapper')
            if (descWrapper) {
              descWrapper.querySelectorAll('img').forEach((img) => {
                img.onload = () => this.checkAllTodoHeights()
              })
              const scrollHeight = descWrapper.scrollHeight
              this.$set(this.collapsedEligible, todo.id, scrollHeight > 600)
              if (scrollHeight > 600) {
                this.$set(this.collapsedTodos, todo.id, true)
              }
            }
          }
        })
      })
    },

    toggleCollapse (todoId) {
      this.$set(this.collapsedTodos, todoId, !this.isCollapsed(todoId))
    },

    isCollapsed (todoId) {
      return !!this.collapsedTodos[todoId]
    },

    shouldShowCollapseButton (todoId) {
      return this.isCollapsed(todoId) || this.collapsedTodos.has(todoId)
    }
  },
  mounted () {
    this.checkAllTodoHeights()
    setTimeout(() => this.checkAllTodoHeights(), 300)
    setTimeout(() => this.checkAllTodoHeights(), 1000)
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
  transition: all 0.3s ease;
}

.date-filter:not(.has-date) {
  padding: 15px 20px;
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

  .date-filter:not(.has-date) {
    padding: 12px 15px;
  }

  .date-filter-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .date-filter:not(.has-date) .date-filter-content {
    gap: 0;
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
  position: relative;
}

.todo-item.completed {
  opacity: 0.7;
  background: rgba(135, 206, 235, 0.15);
  border-color: rgba(135, 206, 235, 0.3);
  /* 移除 transform: scale(0.98) 避免影響高度和間距 */
  /* 用 filter 來增加視覺差異，但不會影響佈局 */
  filter: grayscale(0.3);
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
  margin-bottom: 0;
  color: #666;
  line-height: 1.5;
  white-space: pre-line;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-all;
}
.todo-body,
.todo-content {
  margin-bottom: 0;
  padding-bottom: 0;
}

.todo-description a {
  word-break: break-all;
  overflow-wrap: break-word;
  max-width: 100%;
  display: block;
  max-height: 3em;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-details,
.todo-remarks,
.todo-tags {
  margin-top: 0;
  padding-top: 0;
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
  flex-wrap: wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.detail-item span {
  word-break: break-all;
  overflow-wrap: break-word;
  max-width: 100%;
}

.detail-item a {
  word-break: break-all;
  overflow-wrap: break-word;
  max-width: 100%;
  display: block;
  max-height: 3em;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

  .date-filter:not(.has-date) {
    padding: 12px 15px;
  }

  .date-filter-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .date-filter:not(.has-date) .date-filter-content {
    gap: 0;
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

/* 只摺疊內容，不摺疊按鈕 */
.todo-item .todo-body {
  transition: max-height 0.3s;
}
.todo-item.collapsed .todo-body {
  max-height: 300px !important;
  overflow: hidden !important;
  position: relative;
}
.todo-item.collapsed .todo-body::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 100%);
  pointer-events: none;
  z-index: 1;
}

/* collapse-button 調整為 action-btn 風格 */
.collapse-button {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #87ceeb;
  font-size: 1rem;
  background: none;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background 0.2s, color 0.2s;
  user-select: none;
  box-shadow: 0 2px 8px rgba(135, 206, 235, 0.08);
}
.collapse-button:hover {
  background: rgba(135, 206, 235, 0.18);
  color: #b0c4de;
}

.collapse-row {
  position: absolute;
  top: 42px;
  right: 8px;
  z-index: 2;
  margin: 0;
  padding: 0;
  background: none;
  pointer-events: auto;
}

/* 只摺疊描述內容 */
.todo-description-wrapper {
  margin-bottom: 8px;
}
.todo-description-wrapper.collapsed {
  max-height: 300px;
  overflow: hidden;
  position: relative;
  margin-bottom: 8px;
}
.todo-description-wrapper.collapsed::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 100%);
  pointer-events: none;
  z-index: 1;
}
</style>
