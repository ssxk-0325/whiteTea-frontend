<template>
  <div class="rewards-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>积分商城</h2>
        <p class="subtitle">答题赚积分，积分换好礼</p>

        <!-- 积分信息卡片 -->
        <div class="points-card" v-if="userStore.isLoggedIn">
          <el-card>
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
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="filterType" @change="loadRewards">
            <el-radio-button :label="null">全部类型</el-radio-button>
            <el-radio-button :label="1">实物奖品</el-radio-button>
            <el-radio-button :label="2">优惠券</el-radio-button>
            <el-radio-button :label="3">虚拟奖品</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="keyword"
            placeholder="搜索奖品"
            style="width: 300px; margin-left: 20px;"
            @keyup.enter="loadRewards"
            clearable
          >
            <template #append>
              <el-button @click="loadRewards">搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- 奖品列表 -->
        <div v-loading="loading" class="rewards-container">
          <el-empty v-if="!loading && rewards.length === 0" description="暂无奖品"></el-empty>
          <div v-else>
            <el-row :gutter="20">
              <el-col :span="8" v-for="reward in rewards" :key="reward.id">
                <el-card class="reward-card" shadow="hover">
                  <div class="reward-image reward-image-link" @click="goDetail(reward.id)">
                    <el-image :src="reward.image || DEFAULT_PRODUCT_IMAGE" fit="cover" style="width: 100%; height: 200px;" />
                  </div>
                  <div class="reward-content">
                    <h3 class="reward-name reward-name-link" @click="goDetail(reward.id)">{{ reward.name }}</h3>
                    <p class="reward-description" v-if="reward.description">
                      {{ reward.description }}
                    </p>
                    <div class="reward-footer">
                      <div class="reward-points">
                        <span class="points-label">需要积分：</span>
                        <span class="points-value">{{ reward.pointsRequired }}</span>
                      </div>
                      <div class="reward-actions">
                        <el-button @click.stop="goDetail(reward.id)">详情</el-button>
                        <el-button
                          type="primary"
                          :disabled="!userStore.isLoggedIn || (pointsInfo.currentPoints || 0) < reward.pointsRequired || (reward.stock !== null && reward.stock <= 0)"
                          @click="handleExchange(reward)"
                          :loading="exchanging[reward.id]"
                        >
                          {{ (reward.stock !== null && reward.stock <= 0) ? '已售罄' : '立即兑换' }}
                        </el-button>
                      </div>
                    </div>
                    <div class="reward-stock" v-if="reward.stock !== null">
                      库存：{{ reward.stock }}
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="loadRewards"
            style="margin-top: 20px; text-align: center;"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'Rewards',
  components: {
    Header
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const rewards = ref([])
    const currentPage = ref(1)
    const pageSize = ref(12)
    const total = ref(0)
    const filterType = ref(null)
    const keyword = ref('')
    const pointsInfo = ref({
      currentPoints: 0,
      totalExchanged: 0,
      totalPointsUsed: 0
    })
    const exchanging = ref({})

    const userStore = computed(() => ({
      isLoggedIn: store.getters['user/isLoggedIn']
    }))

    const loadRewards = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        if (filterType.value !== null) {
          params.type = filterType.value
        }
        if (keyword.value) {
          params.keyword = keyword.value
        }
        const res = await api.reward.getList(params)
        rewards.value = res.data.records || []
        total.value = res.data.total || 0
      } catch (error) {
        console.error('加载奖品失败:', error)
      } finally {
        loading.value = false
      }
    }

    const loadPointsInfo = async () => {
      if (!userStore.value.isLoggedIn) return
      try {
        const res = await api.reward.getMyPoints()
        pointsInfo.value = res.data || {}
      } catch (error) {
        console.error('加载积分信息失败:', error)
      }
    }

    const goDetail = (id) => {
      router.push(`/rewards/${id}`)
    }

    const handleExchange = async (reward) => {
      if (!userStore.value.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push('/login?redirect=/rewards')
        return
      }

      if ((pointsInfo.value.currentPoints || 0) < reward.pointsRequired) {
        ElMessage.warning(`积分不足，需要${reward.pointsRequired}积分`)
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定要用${reward.pointsRequired}积分兑换"${reward.name}"吗？`,
          '确认兑换',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        exchanging.value[reward.id] = true
        const res = await api.reward.exchange(reward.id)
        ElMessage.success('兑换成功！' + (res.data.exchangeCode ? `兑换码：${res.data.exchangeCode}` : ''))
        
        // 刷新数据
        await loadRewards()
        await loadPointsInfo()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '兑换失败')
        }
      } finally {
        exchanging.value[reward.id] = false
      }
    }

    onMounted(() => {
      loadRewards()
      loadPointsInfo()
    })

    return {
      loading,
      DEFAULT_PRODUCT_IMAGE,
      rewards,
      currentPage,
      pageSize,
      total,
      filterType,
      keyword,
      pointsInfo,
      exchanging,
      userStore,
      loadRewards,
      loadPointsInfo,
      goDetail,
      handleExchange
    }
  }
}
</script>

<style scoped>
.rewards-page {
  min-height: 100vh;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.points-card {
  margin-bottom: 20px;
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

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.rewards-container {
  min-height: 400px;
}

.reward-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.reward-card:hover {
  transform: translateY(-5px);
}

.reward-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 15px;
}

.reward-image-link {
  cursor: pointer;
}

.reward-name-link {
  cursor: pointer;
  color: #303133;
}

.reward-name-link:hover {
  color: #409eff;
}

.reward-image-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #909399;
}

.reward-content {
  padding: 0 5px;
}

.reward-name {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 50px;
}

.reward-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 40px;
}

.reward-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.reward-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.reward-points {
  display: flex;
  align-items: center;
}

.points-label {
  color: #666;
  font-size: 14px;
  margin-right: 5px;
}

.points-value {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.reward-stock {
  color: #999;
  font-size: 12px;
  text-align: right;
}
</style>

