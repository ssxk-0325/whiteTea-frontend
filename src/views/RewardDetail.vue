<template>
  <div class="reward-detail-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <el-button @click="$router.back()" style="margin-bottom: 20px;">返回</el-button>
        <el-card v-loading="loading">
          <div v-if="reward">
            <div class="reward-header">
              <div class="reward-image-large">
                <el-image
                  :src="reward.image || DEFAULT_PRODUCT_IMAGE"
                  fit="cover"
                  class="cover-img"
                  :preview-src-list="[reward.image || DEFAULT_PRODUCT_IMAGE]"
                />
              </div>
              <div class="reward-info-large">
                <h1>{{ reward.name }}</h1>
                <el-tag type="primary" size="large" style="margin-bottom: 12px;">{{ getTypeText(reward.type) }}</el-tag>
                <div class="points-row">
                  <span class="points-label">所需积分</span>
                  <span class="points-num">{{ reward.pointsRequired }}</span>
                </div>
                <div class="meta-row" v-if="userStore.isLoggedIn">
                  <span>我的积分：<strong class="my-points">{{ pointsInfo.currentPoints || 0 }}</strong></span>
                </div>
                <div class="meta-row">
                  <span v-if="reward.stock !== null">库存：{{ reward.stock }}</span>
                  <span v-if="reward.totalExchanged != null" class="exchanged">已兑：{{ reward.totalExchanged }} 件</span>
                </div>
                <div class="exchange-section">
                  <el-button
                    v-if="!userStore.isLoggedIn"
                    type="primary"
                    size="large"
                    @click="$router.push('/login?redirect=' + encodeURIComponent($route.fullPath))"
                  >
                    登录后兑换
                  </el-button>
                  <el-button
                    v-else
                    type="primary"
                    size="large"
                    :loading="exchanging"
                    :disabled="soldOut || notEnoughPoints"
                    @click="handleExchange"
                  >
                    {{ soldOut ? '已售罄' : notEnoughPoints ? '积分不足' : '立即兑换' }}
                  </el-button>
                  <el-button size="large" @click="$router.push('/rewards')">返回商城</el-button>
                </div>
              </div>
            </div>
            <el-divider />
            <div class="reward-description-block">
              <h3>奖品说明</h3>
              <p v-if="reward.description" class="desc-text">{{ reward.description }}</p>
              <el-empty v-else description="暂无详细说明" :image-size="80" />
            </div>
          </div>
          <el-empty v-else-if="!loading" description="奖品不存在或已下架" />
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'RewardDetail',
  components: { Header },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const reward = ref(null)
    const exchanging = ref(false)
    const pointsInfo = ref({
      currentPoints: 0,
      totalExchanged: 0,
      totalPointsUsed: 0
    })

    const userStore = computed(() => ({
      isLoggedIn: store.getters['user/isLoggedIn']
    }))

    const soldOut = computed(() => reward.value && reward.value.stock !== null && reward.value.stock <= 0)
    const notEnoughPoints = computed(() => {
      if (!reward.value || !userStore.value.isLoggedIn) return false
      return (pointsInfo.value.currentPoints || 0) < reward.value.pointsRequired
    })

    const getTypeText = (type) => {
      const map = { 1: '实物奖品', 2: '优惠券', 3: '虚拟奖品' }
      return map[type] || '奖品'
    }

    const loadPointsInfo = async () => {
      if (!userStore.value.isLoggedIn) return
      try {
        const res = await api.reward.getMyPoints()
        pointsInfo.value = res.data || {}
      } catch (e) {
        console.error('加载积分信息失败:', e)
      }
    }

    const loadReward = async () => {
      const id = route.params.id
      if (!id) return
      loading.value = true
      reward.value = null
      try {
        const res = await api.reward.getById(id)
        reward.value = res.data || null
      } catch (e) {
        console.error('加载奖品失败:', e)
        reward.value = null
      } finally {
        loading.value = false
      }
    }

    const handleExchange = async () => {
      const r = reward.value
      if (!r || !userStore.value.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push('/login?redirect=' + encodeURIComponent(route.fullPath))
        return
      }
      if (soldOut.value) return
      if (notEnoughPoints.value) {
        ElMessage.warning(`积分不足，需要${r.pointsRequired}积分`)
        return
      }
      try {
        await ElMessageBox.confirm(
          `确定要用${r.pointsRequired}积分兑换「${r.name}」吗？`,
          '确认兑换',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        exchanging.value = true
        const res = await api.reward.exchange(r.id)
        ElMessage.success('兑换成功！' + (res.data.exchangeCode ? `兑换码：${res.data.exchangeCode}` : ''))
        await loadReward()
        await loadPointsInfo()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '兑换失败')
        }
      } finally {
        exchanging.value = false
      }
    }

    onMounted(() => {
      loadReward()
      loadPointsInfo()
    })

    watch(
      () => route.params.id,
      () => {
        loadReward()
        loadPointsInfo()
      }
    )

    return {
      loading,
      reward,
      exchanging,
      pointsInfo,
      userStore,
      soldOut,
      notEnoughPoints,
      DEFAULT_PRODUCT_IMAGE,
      getTypeText,
      handleExchange
    }
  }
}
</script>

<style scoped>
.reward-detail-page {
  min-height: 100vh;
}

.reward-header {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: flex-start;
}

.reward-image-large {
  flex: 0 0 380px;
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
}

.cover-img {
  width: 100%;
  height: 320px;
  display: block;
}

.reward-info-large {
  flex: 1;
  min-width: 260px;
}

.reward-info-large h1 {
  margin: 0 0 12px 0;
  font-size: 26px;
  line-height: 1.3;
}

.points-row {
  margin: 16px 0 12px;
}

.points-label {
  color: #666;
  margin-right: 8px;
}

.points-num {
  color: #f56c6c;
  font-size: 28px;
  font-weight: bold;
}

.meta-row {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.meta-row .exchanged {
  margin-left: 16px;
}

.my-points {
  color: #409eff;
}

.exchange-section {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.reward-description-block h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.desc-text {
  margin: 0;
  color: #606266;
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 768px) {
  .reward-image-large {
    flex: 1 1 100%;
  }

  .cover-img {
    height: 240px;
  }
}
</style>
