<template>
  <div class="reward-exchanges-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>我的兑换记录</h2>

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
          <el-table v-else :data="exchanges" style="width: 100%">
            <el-table-column prop="rewardName" label="奖品名称" width="200" />
            <el-table-column prop="pointsUsed" label="消耗积分" width="120" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusTag(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="exchangeCode" label="兑换码" width="200">
              <template #default="scope">
                <span v-if="scope.row.exchangeCode" class="exchange-code">
                  {{ scope.row.exchangeCode }}
                  <el-button
                    text
                    type="primary"
                    size="small"
                    @click="copyCode(scope.row.exchangeCode)"
                  >
                    复制
                  </el-button>
                </span>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
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

    const copyCode = async (code) => {
      try {
        await navigator.clipboard.writeText(code)
        ElMessage.success('兑换码已复制到剪贴板')
      } catch (error) {
        ElMessage.error('复制失败')
      }
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
      formatTime,
      copyCode
    }
  }
}
</script>

<style scoped>
.reward-exchanges-page {
  min-height: 100vh;
}

.points-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-size: 32px;
}

.points-stats {
  color: #999;
  font-size: 14px;
}

.points-stats span {
  margin-left: 20px;
}

.exchange-code {
  font-family: monospace;
  font-weight: bold;
  color: #409eff;
}

.text-muted {
  color: #999;
}
</style>

