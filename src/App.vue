<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%);
  color: #333;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

/* 自定義滾動條 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(135, 206, 235, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #87ceeb, #b0e0e6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #7bb8d4, #9fd1d9);
}

/* 動畫效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* 按鈕通用樣式 */
button {
  font-family: inherit;
}

/* 輸入框通用樣式 */
input,
textarea {
  font-family: inherit;
}

/* 響應式設計 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}
</style>
