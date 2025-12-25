<template>
  <div class="community-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>社区</h2>
        <el-empty description="社区功能待开发"></el-empty>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'

export default {
  name: 'Community',
  components: {
    Header
  }
}
</script>

<style scoped>
.community-page {
  min-height: 100vh;
}
</style>

