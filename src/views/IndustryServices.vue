<template>
  <div class="industry-services-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1100px; margin: 0 auto;">
        <header class="page-header">
          <h1>产业服务</h1>
          <p class="lead">
            采摘招募与批发培训面向茶园用工、渠道合作与大客户赋能，与「精彩活动」中的茶艺课、品鉴会等体验类活动区分，便于您快速找到对接入口。
          </p>
        </header>

        <el-row :gutter="24" class="intro-row">
          <el-col :xs="24" :md="12">
            <el-card class="intro-card" shadow="hover">
              <div class="intro-card-head">
                <el-icon class="intro-icon" :size="28"><Crop /></el-icon>
                <h2>采摘招募</h2>
              </div>
              <p class="intro-text">
                季节性采茶用工、茶园体验采摘或短期帮工招募，连接茶农与参与者，体现从茶园到采摘环节的产业服务。
              </p>
              <ul class="intro-list">
                <li>适合：采茶季用工、研学团体、体验用户</li>
                <li>说明：具体岗位、补贴与日程以单场活动为准</li>
              </ul>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card class="intro-card" shadow="hover">
              <div class="intro-card-head">
                <el-icon class="intro-icon wholesale" :size="28"><Shop /></el-icon>
                <h2>批发与培训</h2>
              </div>
              <p class="intro-text">
                面向茶叶店主、企业采购与渠道伙伴：在批发供货基础上提供仓储、冲泡、品鉴与门店动销等培训，体现「不仅供货，还做服务」。
              </p>
              <ul class="intro-list">
                <li>适合：批发商、连锁门店、企业集采</li>
                <li>说明：可结合线下场次或定制培训方案</li>
              </ul>
            </el-card>
          </el-col>
        </el-row>

        <div class="section-anchor" id="list">
          <h2 class="section-title">开放中的招募与对接</h2>
          <p class="section-hint">以下为平台发布的产业类活动，报名与领券规则见单场详情。</p>
        </div>

        <el-tabs v-model="activeTab" class="industry-tabs" @tab-change="onTabChange">
          <el-tab-pane label="采摘招募" name="pick">
            <div v-loading="loadingPick" class="list-wrap">
              <el-empty v-if="!loadingPick && pickList.length === 0" description="暂无采摘招募类对接，敬请期待" />
              <el-row v-else :gutter="20">
                <el-col :span="8" :xs="24" v-for="activity in pickList" :key="activity.id">
                  <el-card class="activity-card" @click="viewActivity(activity)">
                    <div class="activity-image">
                      <img v-if="activity.image" :src="activity.image" :alt="activity.name" />
                      <div v-else class="default-image">
                        <el-icon><Calendar /></el-icon>
                      </div>
                      <div class="activity-badge">
                        <el-tag type="primary" size="small">{{ getTypeText(activity.type) }}</el-tag>
                      </div>
                    </div>
                    <div class="activity-info">
                      <h3 class="activity-title">{{ activity.name }}</h3>
                      <p class="activity-desc">{{ truncateText(activity.description) }}</p>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
          <el-tab-pane label="批发与培训" name="wholesale">
            <div v-loading="loadingWholesale" class="list-wrap">
              <el-empty
                v-if="!loadingWholesale && wholesaleList.length === 0"
                description="暂无批发与培训类对接，敬请期待"
              />
              <el-row v-else :gutter="20">
                <el-col :span="8" :xs="24" v-for="activity in wholesaleList" :key="activity.id">
                  <el-card class="activity-card" @click="viewActivity(activity)">
                    <div class="activity-image">
                      <img v-if="activity.image" :src="activity.image" :alt="activity.name" />
                      <div v-else class="default-image">
                        <el-icon><Calendar /></el-icon>
                      </div>
                      <div class="activity-badge">
                        <el-tag type="warning" size="small">{{ getTypeText(activity.type) }}</el-tag>
                      </div>
                    </div>
                    <div class="activity-info">
                      <h3 class="activity-title">{{ activity.name }}</h3>
                      <p class="activity-desc">{{ truncateText(activity.description) }}</p>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="footer-hint">
          <span>体验类活动（茶艺课、品鉴会等）请前往</span>
          <router-link to="/activity" class="link">精彩活动</router-link>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Calendar, Crop, Shop } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'
import { ACTIVITY_TYPE_LABELS } from '@/constants/activityTypes'

export default {
  name: 'IndustryServices',
  components: {
    Header,
    Calendar,
    Crop,
    Shop
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const activeTab = ref('pick')
    const pickList = ref([])
    const wholesaleList = ref([])
    const loadingPick = ref(false)
    const loadingWholesale = ref(false)

    const getTypeText = (type) => ACTIVITY_TYPE_LABELS[type] || '未知'

    const truncateText = (text) => {
      if (!text) return ''
      if (text.length > 72) return text.substring(0, 72) + '...'
      return text
    }

    const loadPick = async () => {
      loadingPick.value = true
      try {
        const res = await api.activity.getList({
          page: 0,
          size: 12,
          type: 5
        })
        pickList.value = res.data.records || []
      } catch (e) {
        console.error(e)
        pickList.value = []
      } finally {
        loadingPick.value = false
      }
    }

    const loadWholesale = async () => {
      loadingWholesale.value = true
      try {
        const res = await api.activity.getList({
          page: 0,
          size: 12,
          type: 6
        })
        wholesaleList.value = res.data.records || []
      } catch (e) {
        console.error(e)
        wholesaleList.value = []
      } finally {
        loadingWholesale.value = false
      }
    }

    const viewActivity = (activity) => {
      router.push(`/activity/${activity.id}`)
    }

    const applyTabFromRoute = () => {
      const t = route.query.tab
      if (t === 'wholesale') activeTab.value = 'wholesale'
      else if (t === 'pick') activeTab.value = 'pick'
    }

    const onTabChange = () => {
      const q = activeTab.value === 'wholesale' ? { tab: 'wholesale' } : { tab: 'pick' }
      router.replace({ path: '/services/industry', query: q })
    }

    onMounted(() => {
      applyTabFromRoute()
      loadPick()
      loadWholesale()
    })

    watch(
      () => route.query.tab,
      () => {
        applyTabFromRoute()
      }
    )

    return {
      activeTab,
      pickList,
      wholesaleList,
      loadingPick,
      loadingWholesale,
      getTypeText,
      truncateText,
      viewActivity,
      onTabChange
    }
  }
}
</script>

<style scoped>
.industry-services-page {
  min-height: 100vh;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  font-size: 26px;
  margin: 0 0 12px;
  color: #1b4332;
}

.lead {
  margin: 0;
  line-height: 1.7;
  color: #555;
  font-size: 15px;
}

.intro-row {
  margin-bottom: 20px;
}

.intro-card {
  margin-bottom: 20px;
  min-height: 220px;
  border-radius: 12px;
}

.intro-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.intro-card-head h2 {
  margin: 0;
  font-size: 18px;
  color: #1b4332;
}

.intro-icon {
  color: #2d6a4f;
}

.intro-icon.wholesale {
  color: #40916c;
}

.intro-text {
  margin: 0 0 12px;
  line-height: 1.65;
  color: #444;
  font-size: 14px;
}

.intro-list {
  margin: 0;
  padding-left: 18px;
  color: #666;
  font-size: 13px;
  line-height: 1.7;
}

.section-anchor {
  margin-top: 32px;
  margin-bottom: 8px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1b4332;
}

.section-hint {
  margin: 0 0 16px;
  font-size: 13px;
  color: #888;
}

.industry-tabs {
  margin-bottom: 24px;
}

.list-wrap {
  min-height: 200px;
}

.activity-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.25s;
  height: 100%;
}

.activity-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.activity-image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
  background: #e8f0ec;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 40px;
  color: #95b8a4;
}

.activity-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.activity-info {
  padding-top: 12px;
}

.activity-title {
  margin: 0 0 8px;
  font-size: 16px;
  line-height: 1.35;
  color: #333;
}

.activity-desc {
  margin: 0;
  font-size: 13px;
  color: #777;
  line-height: 1.5;
}

.footer-hint {
  padding: 16px 0 32px;
  font-size: 14px;
  color: #666;
}

.footer-hint .link {
  margin-left: 6px;
  color: #2d6a4f;
  font-weight: 600;
}
</style>
