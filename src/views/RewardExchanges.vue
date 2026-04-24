<template>
  <div class="reward-exchanges-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>我的兑换记录</h2>
        <p class="page-hint">仅保留兑换进度与时间信息，便于快速查看处理状态。</p>

        <!-- 积分信息卡片 -->
        <el-card class="points-card" style="margin-bottom: 20px;">
          <div class="points-info">
            <div class="points-value">
              <span class="label">当前积分：</span>
              <span class="value">{{ pointsInfo.currentPoints || 0 }}</span>
            </div>
            <div class="points-stats">
              <span>已兑换：{{ pointsInfo.totalExchanged || 0 }}件</span>
              <span>累计消费：{{ pointsInfo.totalPointsUsed || 0 }}积分</span>
            </div>
          </div>
        </el-card>

        <!-- 兑换记录列表 -->
        <div v-loading="loading">
          <el-empty v-if="!loading && exchanges.length === 0" description="暂无兑换记录"></el-empty>
          <el-table v-else :data="exchanges" style="width: 100%" stripe>
            <el-table-column prop="rewardName" label="奖品名称" min-width="220" show-overflow-tooltip />
            <el-table-column prop="pointsUsed" label="消耗积分" width="110" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTag(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="260" show-overflow-tooltip />
            <el-table-column prop="createTime" label="兑换时间" width="180">
              <template #default="scope">
                {{ formatTime(scope.row.createTime) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'RewardExchanges',
  components: {
    Header
  },
  setup() {
    const loading = ref(false)
    const exchanges = ref([])
    const pointsInfo = ref({
      currentPoints: 0,
      totalExchanged: 0,
      totalPointsUsed: 0
    })

    const loadExchanges = async () => {
      loading.value = true
      try {
        const res = await api.reward.getMyExchanges()
        exchanges.value = res.data || []
      } catch (error) {
        ElMessage.error(error.message || '加载兑换记录失败')
      } finally {
        loading.value = false
      }
    }

    const loadPointsInfo = async () => {
      try {
        const res = await api.reward.getMyPoints()
        pointsInfo.value = res.data || {}
      } catch (error) {
        console.error('加载积分信息失败:', error)
      }
    }

    const getStatusText = (status) => {
      const statusMap = {
        0: '待处理',
        1: '已发放',
        2: '已取消'
      }
      return statusMap[status] || '未知'
    }

    const getStatusTag = (status) => {
      const tagMap = {
        0: 'warning',
        1: 'success',
        2: 'info'
      }
      return tagMap[status] || 'info'
    }

    const formatTime = (time) => {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN')
    }

    onMounted(() => {
      loadExchanges()
      loadPointsInfo()
    })

    return {
      loading,
      exchanges,
      pointsInfo,
      loadExchanges,
      loadPointsInfo,
      getStatusText,
      getStatusTag,
      formatTime
    }
  }
}
</script>

<style scoped>
.reward-exchanges-page {
  min-height: 100vh;
}

.reward-exchanges-page h2 {
  font-size: 30px;
  margin: 0 0 12px;
}

.points-card {
  border-radius: 12px;
}

.points-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.points-value {
  font-size: 24px;
}

.points-value .label {
  color: #666;
  margin-right: 10px;
}

.points-value .value {
  color: #409eff;
  font-weight: bold;
  font-size: 36px;
}

.points-stats {
  color: #999;
  font-size: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
}

.points-stats span {
  margin-left: 0;
}

.page-hint {
  margin: -4px 0 18px;
  color: #909399;
  font-size: 15px;
  line-height: 1.6;
}

.reward-exchanges-page :deep(.el-table th.el-table__cell) {
  font-size: 15px;
  padding: 13px 0;
}

.reward-exchanges-page :deep(.el-table .el-table__cell) {
  font-size: 15px;
  padding: 12px 0;
}

.reward-exchanges-page :deep(.el-tag) {
  font-size: 13px;
  padding: 0 10px;
}
</style>

