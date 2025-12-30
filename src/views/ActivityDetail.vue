<template>
  <div class="activity-detail-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <el-button @click="$router.back()" style="margin-bottom: 20px;">返回</el-button>
        <el-card v-loading="loading">
          <div v-if="activity">
            <div class="activity-header">
              <div class="activity-image-large">
                <img v-if="activity.image" :src="activity.image" :alt="activity.name" />
                <div v-else class="default-image-large">
                  <el-icon><Calendar /></el-icon>
                </div>
              </div>
              <div class="activity-info-large">
                <h1>{{ activity.name }}</h1>
                <el-tag :type="getTypeTag(activity.type)" size="large" style="margin-bottom: 15px;">
                  {{ getTypeText(activity.type) }}
                </el-tag>
                <div class="activity-details">
                  <div class="detail-item">
                    <el-icon><Clock /></el-icon>
                    <span>活动时间：{{ formatDateTime(activity.startTime) }} - {{ formatDateTime(activity.endTime) }}</span>
                  </div>
                  <div class="detail-item" v-if="activity.couponStartTime">
                    <el-icon><Ticket /></el-icon>
                    <span>抢券时间：{{ formatDateTime(activity.couponStartTime) }} - {{ formatDateTime(activity.couponEndTime) }}</span>
                  </div>
                  <div class="detail-item" v-if="activity.totalCoupons > 0">
                    <el-icon><Star /></el-icon>
                    <span>剩余券数：{{ activity.totalCoupons - activity.issuedCoupons }}/{{ activity.totalCoupons }}</span>
                  </div>
                </div>
                <div class="grab-section">
                  <el-button
                    v-if="canGrab"
                    type="primary"
                    size="large"
                    :loading="grabbing"
                    @click="handleGrab"
                    style="width: 200px;"
                  >
                    <el-icon><Star /></el-icon>
                    立即抢券
                  </el-button>
                  <el-button
                    v-else-if="hasGrabbed"
                    type="success"
                    size="large"
                    disabled
                    style="width: 200px;"
                  >
                    <el-icon><Check /></el-icon>
                    已抢到券
                  </el-button>
                  <el-button
                    v-else-if="!isLoggedIn"
                    type="primary"
                    size="large"
                    @click="$router.push('/login')"
                    style="width: 200px;"
                  >
                    登录后抢券
                  </el-button>
                  <el-tag v-else type="info" size="large">暂不可抢</el-tag>
                </div>
              </div>
            </div>
            <el-divider />
            <div class="activity-description">
              <h3>活动详情</h3>
              <div v-html="activity.description"></div>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Calendar, Clock, Ticket, Star, Check } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'ActivityDetail',
  components: {
    Header,
    Calendar,
    Clock,
    Ticket,
    Star,
    Check
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const grabbing = ref(false)
    const activity = ref(null)
    const hasGrabbed = ref(false)

    const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])

    const loadActivity = async () => {
      loading.value = true
      try {
        const res = await api.activity.getById(route.params.id)
        activity.value = res.data
        if (isLoggedIn.value) {
          checkGrabbed()
        }
      } catch (error) {
        ElMessage.error('加载活动失败')
        router.push('/activity')
      } finally {
        loading.value = false
      }
    }

    const checkGrabbed = async () => {
      try {
        const res = await api.activity.checkGrabbed(route.params.id)
        hasGrabbed.value = res.data.hasGrabbed
      } catch (error) {
        // 忽略错误
      }
    }

    const canGrab = computed(() => {
      if (!activity.value || !isLoggedIn.value || hasGrabbed.value) {
        return false
      }
      const now = new Date()
      const couponStart = activity.value.couponStartTime ? new Date(activity.value.couponStartTime) : null
      const couponEnd = activity.value.couponEndTime ? new Date(activity.value.couponEndTime) : null
      
      if (couponStart && now < couponStart) {
        return false
      }
      if (couponEnd && now > couponEnd) {
        return false
      }
      if (activity.value.issuedCoupons >= activity.value.totalCoupons) {
        return false
      }
      return true
    })

    const handleGrab = async () => {
      if (!canGrab.value) {
        return
      }
      grabbing.value = true
      try {
        const res = await api.activity.grabCoupon(route.params.id)
        ElMessage.success('抢券成功！')
        hasGrabbed.value = true
        activity.value.issuedCoupons++
        // 跳转到券包页面
        setTimeout(() => {
          router.push('/activity/coupons')
        }, 1500)
      } catch (error) {
        ElMessage.error(error.message || '抢券失败')
      } finally {
        grabbing.value = false
      }
    }

    const formatDateTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN')
    }

    const getTypeText = (type) => {
      const typeMap = {
        1: '茶艺课',
        2: '茶园参观',
        3: '线下品鉴会',
        4: '制茶体验'
      }
      return typeMap[type] || '未知'
    }

    const getTypeTag = (type) => {
      const tagMap = {
        1: 'success',
        2: 'warning',
        3: 'info',
        4: 'danger'
      }
      return tagMap[type] || 'info'
    }

    onMounted(() => {
      loadActivity()
    })

    return {
      loading,
      grabbing,
      activity,
      hasGrabbed,
      isLoggedIn,
      canGrab,
      handleGrab,
      formatDateTime,
      getTypeText,
      getTypeTag
    }
  }
}
</script>

<style scoped>
.activity-detail-page {
  min-height: 100vh;
}

.activity-header {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.activity-image-large {
  flex: 0 0 400px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.activity-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-image-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 80px;
}

.activity-info-large {
  flex: 1;
}

.activity-info-large h1 {
  margin: 0 0 15px 0;
  font-size: 28px;
  font-weight: bold;
}

.activity-details {
  margin: 20px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #666;
  font-size: 16px;
}

.grab-section {
  margin-top: 30px;
}

.activity-description {
  margin-top: 20px;
}

.activity-description h3 {
  margin-bottom: 15px;
}

.activity-description :deep(p) {
  line-height: 1.8;
  color: #333;
  margin-bottom: 10px;
}
</style>

