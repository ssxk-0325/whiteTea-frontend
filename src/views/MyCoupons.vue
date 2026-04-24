<template>
  <div class="coupons-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>个人门票</h2>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="filterStatus" @change="loadCoupons">
            <el-radio-button :label="null">全部</el-radio-button>
            <el-radio-button :label="0">未使用</el-radio-button>
            <el-radio-button :label="1">已使用</el-radio-button>
            <el-radio-button :label="2">已过期</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 券列表 -->
        <div v-loading="loading" class="coupons-container">
          <el-empty v-if="!loading && coupons.length === 0" description="暂无券"></el-empty>
          <div v-else class="coupons-grid">
            <div
              v-for="coupon in coupons"
              :key="coupon.id"
              class="coupon-card"
              :class="{
                'coupon-used': coupon.status === 1,
                'coupon-expired': coupon.status === 2
              }"
            >
              <div class="coupon-content">
                <div class="coupon-left">
                  <div class="coupon-type-icon">
                    <el-icon v-if="coupon.couponType === 1"><Coffee /></el-icon>
                    <el-icon v-else-if="coupon.couponType === 2"><Location /></el-icon>
                    <el-icon v-else-if="coupon.couponType === 3"><Star /></el-icon>
                    <el-icon v-else-if="coupon.couponType === 4"><Tools /></el-icon>
                    <el-icon v-else-if="coupon.couponType === 5"><Crop /></el-icon>
                    <el-icon v-else-if="coupon.couponType === 6"><Shop /></el-icon>
                    <el-icon v-else><Tools /></el-icon>
                  </div>
                  <div class="coupon-info">
                    <h3 class="coupon-name">{{ coupon.couponName }}</h3>
                    <p class="coupon-code">券码：{{ coupon.couponCode }}</p>
                    <p class="coupon-expire" v-if="coupon.expireTime">
                      有效期至：{{ formatDateTime(coupon.expireTime) }}
                    </p>
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-status">
                    <el-tag
                      :type="getStatusTag(coupon.status)"
                      size="large"
                    >
                      {{ getStatusText(coupon.status) }}
                    </el-tag>
                  </div>
                  <div class="coupon-type-badge">
                    {{ getTypeText(coupon.couponType) }}
                  </div>
                </div>
              </div>
              <div v-if="coupon.status === 1 && coupon.useTime" class="coupon-use-time">
                使用时间：{{ formatDateTime(coupon.useTime) }}
              </div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Coffee, Location, Star, Tools, Crop, Shop } from '@element-plus/icons-vue'
import api from '@/api'
import { ACTIVITY_TYPE_LABELS } from '@/constants/activityTypes'
import Header from '@/components/Header.vue'

export default {
  name: 'MyCoupons',
  components: {
    Header,
    Coffee,
    Location,
    Star,
    Tools,
    Crop,
    Shop
  },
  setup() {
    const loading = ref(false)
    const coupons = ref([])
    const filterStatus = ref(null)

    const loadCoupons = async () => {
      loading.value = true
      try {
        const params = {}
        if (filterStatus.value !== null) {
          params.status = filterStatus.value
        }
        const res = await api.activity.getMyCoupons(params)
        coupons.value = res.data
      } catch (error) {
        console.error('加载券失败:', error)
      } finally {
        loading.value = false
      }
    }

    const formatDateTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN')
    }

    const getStatusText = (status) => {
      const statusMap = {
        0: '未使用',
        1: '已使用',
        2: '已过期'
      }
      return statusMap[status] || '未知'
    }

    const getStatusTag = (status) => {
      const tagMap = {
        0: 'success',
        1: 'info',
        2: 'danger'
      }
      return tagMap[status] || 'info'
    }

    const getTypeText = (type) => ACTIVITY_TYPE_LABELS[type] || '未知'

    onMounted(() => {
      loadCoupons()
    })

    return {
      loading,
      coupons,
      filterStatus,
      loadCoupons,
      formatDateTime,
      getStatusText,
      getStatusTag,
      getTypeText
    }
  }
}
</script>

<style scoped>
.coupons-page {
  min-height: 100vh;
}

.filter-bar {
  margin-bottom: 20px;
}

.coupons-container {
  min-height: 400px;
}

.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.coupon-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 25px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.coupon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.coupon-card::before {
  content: '';
  position: absolute;
  right: -50px;
  top: -50px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.coupon-card::after {
  content: '';
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.coupon-used {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  opacity: 0.8;
}

.coupon-expired {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.coupon-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.coupon-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.coupon-type-icon {
  font-size: 48px;
  opacity: 0.9;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: bold;
}

.coupon-code {
  margin: 5px 0;
  font-size: 14px;
  opacity: 0.9;
  font-family: 'Courier New', monospace;
}

.coupon-expire {
  margin: 5px 0 0 0;
  font-size: 12px;
  opacity: 0.8;
}

.coupon-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.coupon-type-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.coupon-use-time {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 12px;
  opacity: 0.8;
  position: relative;
  z-index: 1;
}
</style>

