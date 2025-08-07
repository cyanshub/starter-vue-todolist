// API 基礎設定
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.cyanstatic.site'
  : 'http://localhost:4000'

// 發送加密檔案到 Email
export const sendEncryptedTodosEmail = async (encryptedFile, emailTo, fileName) => {
  try {
    const formData = new FormData()
    formData.append('encryptedFile', encryptedFile, fileName)
    formData.append('emailTo', emailTo)
    formData.append('fileName', fileName)

    const response = await fetch(`${API_BASE_URL}/api/todos/encrypt-todos`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '發送失敗')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('API 發送失敗:', error)
    throw new Error('無法發送檔案: ' + error.message)
  }
}

// 其他 todo 相關 API 可以放在這裡
export const todoAPI = {
  sendEncryptedTodosEmail
}
