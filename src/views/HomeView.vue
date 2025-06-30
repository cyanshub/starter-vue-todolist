<template>
  <div class="home">
    <p>Loading...</p>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'HomeView',
  components: {
    // 定義使用到的組件
  },
  created () {
    // 將路由導向 todos
    this.$router.push('/todos')
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%);
}
</style>
