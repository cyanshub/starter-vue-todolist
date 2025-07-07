<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? '編輯待辦事項' : '新增待辦事項' }}</h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="todo-form">
        <div class="form-group">
          <label for="name">標題 *</label>
          <input id="name" v-model="form.name" type="text" required placeholder="輸入待辦事項標題" class="form-input" />
        </div>

        <div class="form-group">
          <label for="content">內容描述</label>
          <textarea
            id="content"
            v-model="form.content"
            placeholder="詳細描述這個待辦事項（可選）"
            rows="10"
            class="form-textarea"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="date">日期 *</label>
            <input id="date" v-model="form.date" type="date" required class="form-input" />
          </div>

          <div class="form-group">
            <label for="time">需要時間 [hr]</label>
            <input
              id="time"
              v-model.number="form.time"
              type="number"
              min="0"
              step="0.5"
              placeholder="時間接受小數點 (可選)"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="location">地點</label>
          <input id="location" v-model="form.location" type="text" placeholder="要在哪裡做這件事?（可選）" class="form-input" />
        </div>

        <div class="form-group">
          <label for="remarks">備註</label>
          <textarea id="remarks" v-model="form.remarks" placeholder="額外的提醒或備註（可選）" rows="2" class="form-textarea"></textarea>
        </div>

        <div class="form-group">
          <label>處理時機</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="form.isLater" :value="false" class="radio-input" />
              <span class="radio-text">列入排程</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.isLater" :value="true" class="radio-input" />
              <span class="radio-text">晚點再說</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <div class="tag-label-container">
            <span class="tag-label">標籤</span>
            <div v-if="filteredTags && filteredTags.length > 0" class="filtered-tags">
              <span v-for="tag in limitedTags" :key="tag" @click="addTagToInput(tag)" class="filtered-tag" :title="`點擊加入 ${tag}`">
                {{ tag }}
              </span>
              <span
                v-if="!showAllTags && remainingTagsCount > 0"
                class="more-tags-indicator"
                :title="`還有 ${remainingTagsCount} 個標籤`"
                @click="showAllTags = true"
                style="cursor: pointer"
              >
                +{{ remainingTagsCount }}
              </span>
              <span
                v-if="showAllTags && filteredTags.length > 12"
                class="collapse-tags-indicator"
                @click="showAllTags = false"
                style="cursor: pointer; color: #87ceeb; margin-left: 8px; font-size: 0.9em"
              >
                收合
              </span>
            </div>
          </div>
          <input id="tag" v-model="form.tag" type="text" placeholder="例如：#運動 #彈鋼琴 #練吉他 #爵士鼓（可選）" class="form-input" />
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary btn-cancel">取消</button>
          <button type="submit" class="btn btn-primary btn-submit">
            {{ isEditing ? '更新' : '新增' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoForm',
  props: {
    todo: {
      type: Object,
      default: null
    },
    filteredTags: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: {
        name: '',
        content: '',
        date: '',
        time: '1',
        location: '',
        remarks: '',
        tag: '',
        isLater: false
      },
      showAllTags: false
    }
  },
  computed: {
    isEditing() {
      return !!this.todo
    },
    limitedTags() {
      if (this.showAllTags) {
        return this.filteredTags || []
      }
      return this.filteredTags ? this.filteredTags.slice(0, 12) : []
    },
    remainingTagsCount() {
      return this.filteredTags ? Math.max(0, this.filteredTags.length - 12) : 0
    }
  },
  watch: {
    todo: {
      handler(newTodo) {
        if (newTodo) {
          this.form = { ...newTodo }
        } else {
          this.resetForm()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 獲取台北時間的日期格式 (YYYY-MM-DD)
    getTaipeiDateString() {
      const now = new Date()
      // 台北時區是 UTC+8
      const taipeiTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
      return taipeiTime.toISOString().split('T')[0]
    },

    resetForm() {
      this.form = {
        name: '',
        content: '',
        date: this.getTaipeiDateString(),
        time: '1',
        location: '',
        remarks: '',
        tag: '',
        isLater: false
      }
    },

    handleSubmit() {
      const todoData = {
        name: (this.form.name || '').trim(),
        content: (this.form.content || '').trim() || null,
        date: this.form.date,
        time: this.form.time || null,
        location: (this.form.location || '').trim() || null,
        remarks: (this.form.remarks || '').trim() || null,
        tag: (this.form.tag || '').trim() || null,
        isLater: this.form.isLater
      }

      if (this.isEditing && this.todo) {
        todoData.isCompleted = this.todo.isCompleted
      }

      this.$emit('save', todoData)
    },

    closeModal(event) {
      if (event.target.classList.contains('modal-overlay')) {
        this.$emit('close')
      }
    },

    addTagToInput(tag) {
      const tags = (this.form.tag || '').split(' ').filter((t) => t.trim() !== '')
      const idx = tags.indexOf(tag)
      if (idx !== -1) {
        // 已存在，移除
        tags.splice(idx, 1)
      } else {
        // 不存在，加上
        tags.push(tag)
      }
      this.form.tag = tags.join(' ')
    }
  },

  mounted() {
    if (!this.todo) {
      this.resetForm()
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #f8fbff 0%, #f0f8ff 100%);
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(135, 206, 235, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid rgba(135, 206, 235, 0.2);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px 20px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
  background: linear-gradient(45deg, #87ceeb, #b0e0e6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  color: #333;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(135, 206, 235, 0.1);
}

.todo-form {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid rgba(135, 206, 235, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #87ceeb;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.2);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(102, 102, 102, 0.5);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-help {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 0.8rem;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(135, 206, 235, 0.2);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(45deg, #87ceeb, #b0e0e6);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  border: 1px solid rgba(135, 206, 235, 0.3);
}

.btn-secondary:hover {
  background: rgba(135, 206, 235, 0.1);
}

/* 桌面預設順序 */
.btn-submit {
  order: 2;
}
.btn-cancel {
  order: 1;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .btn-submit {
    order: 1;
  }

  .btn-cancel {
    order: 2;
  }
}

.tag-label-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.tag-label {
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.filtered-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filtered-tag {
  background: rgba(255, 193, 7, 0.2);
  color: #b8860b;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 193, 7, 0.3);
  font-weight: 500;
}

.filtered-tag:hover {
  transform: translateY(-1px);
  background: rgba(255, 193, 7, 0.3);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.2);
}

.filtered-tag:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.1);
}

.more-tags-indicator {
  background: rgba(135, 206, 235, 0.2);
  color: #87ceeb;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(135, 206, 235, 0.3);
  cursor: default;
  opacity: 0.8;
}

.form-textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.radio-input {
  margin-right: 8px;
  cursor: pointer;
  accent-color: #87ceeb;
  /* 確保選中狀態時圓圈中間是白色 */
  appearance: none;
  width: 12px;
  height: 12px;
  border: 2px solid #ccc;
  border-radius: 50%;
  background: white;
  position: relative;
}

.radio-input:checked {
  border-color: #87ceeb;
  background: white;
}

.radio-input:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #87ceeb;
}

.radio-text {
  font-size: 14px;
  color: #333;
}

/* 新增收合按鈕樣式 */
.collapse-tags-indicator {
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(135, 206, 235, 0.08);
  color: #87ceeb;
  font-weight: 500;
  border: 1px solid rgba(135, 206, 235, 0.15);
  cursor: pointer;
  margin-left: 8px;
  transition: background 0.2s;
}
.collapse-tags-indicator:hover {
  background: rgba(135, 206, 235, 0.18);
}
.more-tags-indicator {
  cursor: pointer;
}
</style>
