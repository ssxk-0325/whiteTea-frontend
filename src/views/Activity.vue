<template>
  <div class="activity-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>精彩活动</h2>
        <p class="page-subtitle">茶艺课、茶园参观、品鉴会与制茶体验等线下体验类活动。福鼎茶厂采茶地用工、白茶收购与种植培训请见 <router-link to="/services/industry" class="inline-link">产业服务</router-link>。</p>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="filterType" @change="loadActivities">
            <el-radio-button :label="null">全部活动</el-radio-button>
            <el-radio-button :label="1">茶艺课</el-radio-button>
            <el-radio-button :label="2">茶园参观</el-radio-button>
            <el-radio-button :label="3">线下品鉴会</el-radio-button>
            <el-radio-button :label="4">制茶体验</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="keyword"
            placeholder="搜索活动"
            style="width: 300px; margin-left: 20px;"
            @keyup.enter="loadActivities"
            clearable
          >
            <template #append>
              <el-button @click="loadActivities">搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- 活动列表 -->
        <div v-loading="loading" class="activities-container">
          <el-empty v-if="!loading && activities.length === 0" description="暂无活动"></el-empty>
          <el-row :gutter="20" v-else>
            <el-col :span="8" v-for="activity in activities" :key="activity.id">
              <el-card class="activity-card" @click="viewActivity(activity)">
                <div class="activity-image">
                  <img v-if="activity.image" :src="activity.image" :alt="activity.name" />
                  <div v-else class="default-image">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="activity-badge">
                    <el-tag :type="getTypeTag(activity.type)" size="small">{{ getTypeText(activity.type) }}</el-tag>
                  </div>
                  <div v-if="getActivityStatus(activity) === 'grab'" class="grab-badge">
                    <el-icon><Star /></el-icon> 抢券中
                  </div>
                </div>
                <div class="activity-info">
                  <h3 class="activity-title">{{ activity.name }}</h3>
                  <div class="activity-meta">
                    <div class="meta-item">
                      <el-icon><Clock /></el-icon>
                      <span>{{ formatTime(activity.startTime) }}</span>
                    </div>
                    <div class="meta-item" v-if="activity.totalCoupons > 0">
                      <el-icon><Ticket /></el-icon>
                      <span>剩余 {{ activity.totalCoupons - activity.issuedCoupons }}/{{ activity.totalCoupons }} 张券</span>
                    </div>
                  </div>
                  <p class="activity-desc">{{ truncateText(activity.description) }}</p>
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
          @current-change="loadActivities"
          style="margin-top: 20px; text-align: center;"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Calendar, Star, Clock, Ticket } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_TAGS } from '@/constants/activityTypes'

export default {
  name: 'Activity',
  components: {
    Header,
    Calendar,
    Star,
    Clock,
    Ticket
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const activities = ref([])
    const currentPage = ref(1)
    const pageSize = ref(12)
    const total = ref(0)
    const filterType = ref(null)
    const keyword = ref('')

    const loadActivities = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value,
          category: 'experience'
        }
        if (filterType.value !== null) {
          params.type = filterType.value
        }
        if (keyword.value) {
          params.keyword = keyword.value
        }
        const res = await api.activity.getList(params)
        activities.value = res.data.records
        total.value = res.data.total
      } catch (error) {
        console.error('加载活动失败:', error)
      } finally {
        loading.value = false
      }
    }

    const viewActivity = (activity) => {
      router.push(`/activity/${activity.id}`)
    }

    const truncateText = (text) => {
      if (!text) return ''
      if (text.length > 80) {
        return text.substring(0, 80) + '...'
      }
      return text
    }

    const formatTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleDateString('zh-CN')
    }

    const getTypeText = (type) => ACTIVITY_TYPE_LABELS[type] || '未知'
    const getTypeTag = (type) => ACTIVITY_TYPE_TAGS[type] || 'info'

    const getActivityStatus = (activity) => {
      const now = new Date()
      const couponStart = activity.couponStartTime ? new Date(activity.couponStartTime) : null
      const couponEnd = activity.couponEndTime ? new Date(activity.couponEndTime) : null
      
      if (couponStart && now < couponStart) {
        return 'not-started'
      }
      if (couponEnd && now > couponEnd) {
        return 'ended'
      }
      if (activity.issuedCoupons >= activity.totalCoupons) {
        return 'sold-out'
      }
      return 'grab'
    }

    const redirectIndustryIfNeeded = () => {
      const t = route.query.type
      if (t === '5' || t === '6' || t === 5 || t === 6) {
        router.replace({
          path: '/services/industry',
          query: { tab: String(t) === '5' || t === 5 ? 'pick' : 'wholesale' }
        })
        return true
      }
      return false
    }

    onMounted(() => {
      if (redirectIndustryIfNeeded()) return
      loadActivities()
    })

    watch(
      () => route.query.type,
      () => {
        if (redirectIndustryIfNeeded()) return
        loadActivities()
      }
    )

    return {
      loading,
      activities,
      currentPage,
      pageSize,
      total,
      filterType,
      keyword,
      loadActivities,
      viewActivity,
      truncateText,
      formatTime,
      getTypeText,
      getTypeTag,
      getActivityStatus
    }
  }
}
</script>

<style scoped>
.activity-page {
  min-height: 100vh;
}

.page-subtitle {
  margin: 0 0 18px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.inline-link {
  color: #2d6a4f;
  font-weight: 600;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.activities-container {
  min-height: 400px;
}

.activity-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  overflow: hidden;
}

.activity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.activity-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
}

.activity-badge {
  position: absolute;
  top: 10px;
  left: 10px;
}

.grab-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: bold;
}

.activity-info {
  padding: 0 5px;
}

.activity-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.activity-desc {
  color: #999;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>

