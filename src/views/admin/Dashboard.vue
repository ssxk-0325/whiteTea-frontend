<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <h3>总用户数</h3>
            <p class="stat-value">{{ stats.userCount }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <h3>总产品数</h3>
            <p class="stat-value">{{ stats.productCount }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <h3>总订单数</h3>
            <p class="stat-value">{{ stats.orderCount }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <h3>总销售额</h3>
            <p class="stat-value">¥{{ stats.totalSales }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'

export default {
  name: 'AdminDashboard',
  setup() {
    const loading = ref(false)
    const stats = ref({
      userCount: 0,
      productCount: 0,
      orderCount: 0,
      totalSales: '0.00'
    })

    const loadStats = async () => {
      loading.value = true
      try {
        const res = await api.admin.getStats()
        if (res.data) {
          stats.value = {
            userCount: res.data.userCount || 0,
            productCount: res.data.productCount || 0,
            orderCount: res.data.orderCount || 0,
            totalSales: (res.data.totalSales || 0).toFixed(2)
          }
        }
      } catch (error) {
        // 如果接口不存在，使用默认值
        console.warn('统计接口未实现，使用默认值')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      loading,
      stats
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px !important;
  background-color: #fff !important;
  min-height: calc(100vh - 60px);
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  font-weight: 500;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
</style>
