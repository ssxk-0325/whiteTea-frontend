<template>
  <div class="culture-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>白茶文化科普中心</h2>
        <el-empty description="文化内容功能待开发"></el-empty>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'

export default {
  name: 'Culture',
  components: {
    Header
  }
}
</script>

<style scoped>
.culture-page {
  min-height: 100vh;
}
</style>

