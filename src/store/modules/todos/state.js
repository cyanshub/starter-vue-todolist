// Dummy data: 先用測試資料, 後續再帶入資料庫資料
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

const state = () => {
  return {
    todos: todosDummy,
    nextId: 994
  }
}

export default state
