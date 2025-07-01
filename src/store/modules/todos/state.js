// Dummy data: 先用測試資料, 後續再帶入資料庫資料
const todosDummy = [
  {
    id: 991,
    name: '完成今日目標：學習 Vue.js',
    content: '閱讀 Vue.js 官方文檔，練習組件開發',
    remarks: '記得做筆記，明天要分享學習心得',
    time: 2,
    date: '2024-08-31',
    location: '家裡書房',
    creator: 'Chin-Yang, Huang',
    isCompleted: true
  },
  {
    id: 992,
    name: '運動健身：跑步 5 公里',
    content: '去河濱公園慢跑，享受戶外運動',
    remarks: '記得帶水和毛巾，注意安全',
    time: 1.5,
    date: '2024-08-31',
    location: '河濱公園',
    creator: 'Chin-Yang, Huang',
    isCompleted: false
  },
  {
    id: 993,
    name: '讀書時間：讀完《原子習慣》',
    content: '閱讀第 5-7 章，重點是習慣養成的方法',
    remarks: '準備便利貼做重點標記',
    time: 1,
    date: '2024-08-31',
    location: '咖啡廳',
    creator: 'Chin-Yang, Huang',
    isCompleted: false
  },
  {
    id: 994,
    name: '音樂時間：練習爵士鼓',
    content: '練習基本的鼓點節奏',
    remarks: '記得預約樂器行教室，帶鼓棒',
    time: 2.5,
    date: '2024-08-31',
    location: '樂器行',
    creator: 'Chin-Yang, Huang',
    isCompleted: false
  }
]

// 從 localStorage 讀取資料的函數
const loadTodosFromStorage = () => {
  try {
    const storedTodos = localStorage.getItem('vue-todo-todos')
    const storedNextId = localStorage.getItem('vue-todo-nextId')

    if (storedTodos && storedNextId) {
      // 如果 localStorage 有資料，解析並檢查
      const parsedTodos = JSON.parse(storedTodos)

      // 檢查是否有資料且不是空陣列
      if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
        return {
          todos: parsedTodos,
          nextId: parseInt(storedNextId)
        }
      } else {
        return {
          todos: todosDummy,
          nextId: 994
        }
      }
    }
  } catch (error) {
    console.error('讀取 localStorage 失敗:', error)
  }

  // 如果 localStorage 沒有資料或讀取失敗，返回 dummy data
  return {
    todos: todosDummy,
    nextId: 994
  }
}

const state = () => {
  return loadTodosFromStorage()
}

export default state
