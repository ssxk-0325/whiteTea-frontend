<template>
  <div class="service-page pick-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1100px; margin: 0 auto;">
        <header class="page-header">
          <div class="header-badge">SEASONAL RECRUITMENT</div>
          <h1>采摘招募服务</h1>
          <p class="lead">
            面向采茶季的用工信息发布与报名入口，重点服务茶厂、合作社与采茶地的临时用工需求，适合有采茶经验或愿意短期务工的用户。
          </p>
          <div class="feature-tags">
            <span class="feature-tag">短期务工</span>
            <span class="feature-tag">就近上岗</span>
            <span class="feature-tag">季节性招募</span>
          </div>
        </header>

        <el-row :gutter="24" class="intro-row">
          <el-col :xs="24" :md="14">
            <el-card class="intro-card" shadow="hover">
              <div class="intro-card-head">
                <el-icon class="intro-icon" :size="28"><Crop /></el-icon>
                <h2>服务定位</h2>
              </div>
              <ul class="intro-list">
                <li>场景：采茶旺季的短期用工与劳务对接</li>
                <li>主体：茶厂、合作社、茶园基地发布招募信息</li>
                <li>重点：上岗时间、地点、人数、作业要求</li>
              </ul>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="10">
            <el-card class="intro-card tip-card" shadow="hover">
              <h3>报名建议</h3>
              <p>建议在申请备注中填写可到岗时间、采茶经验与交通方式，便于发布方快速筛选。</p>
            </el-card>
          </el-col>
        </el-row>

        <div class="section-anchor">
          <h2 class="section-title">采摘招募列表</h2>
          <p class="section-hint">以下信息为产业类活动中的采摘招募场次，点击可查看详情并提交申请。</p>
        </div>

        <div v-loading="loading" class="list-wrap">
          <el-empty v-if="!loading && list.length === 0" description="暂无采摘招募信息，敬请期待" />
          <el-row v-else :gutter="20">
            <el-col :span="8" :xs="24" v-for="activity in list" :key="activity.id">
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
                  <div class="card-footer">
                    <span class="card-tip">点击查看详情并申请</span>
                    <el-button type="primary" text>申请加入</el-button>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Crop } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'
import { ACTIVITY_TYPE_LABELS } from '@/constants/activityTypes'

export default {
  name: 'PickRecruitmentService',
  components: {
    Header,
    Calendar,
    Crop
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const list = ref([])

    const getTypeText = (type) => ACTIVITY_TYPE_LABELS[type] || '未知'

    const truncateText = (text) => {
      if (!text) return ''
      if (text.length > 72) return text.substring(0, 72) + '...'
      return text
    }

    const loadList = async () => {
      loading.value = true
      try {
        const res = await api.activity.getList({
          page: 0,
          size: 12,
          type: 5
        })
        list.value = res.data.records || []
      } catch (e) {
        console.error(e)
        list.value = []
      } finally {
        loading.value = false
      }
    }

    const viewActivity = (activity) => {
      router.push({
        path: `/activity/${activity.id}`,
        query: { from: 'pick' }
      })
    }

    onMounted(() => {
      loadList()
    })

    return {
      loading,
      list,
      getTypeText,
      truncateText,
      viewActivity
    }
  }
}
</script>

<style scoped>
.service-page {
  min-height: 100vh;
}

.page-header {
  margin: 10px 0 24px;
  border-radius: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #effaf2 0%, #f8fcf9 55%, #eef7f2 100%);
  border: 1px solid #d7ecde;
  box-shadow: 0 8px 20px rgba(36, 97, 68, 0.08);
}

.header-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #2d6a4f;
  background: #dbefe1;
  border-radius: 999px;
  padding: 4px 10px;
  margin-bottom: 10px;
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

.feature-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.feature-tag {
  background: #ffffff;
  color: #2d6a4f;
  border: 1px solid #cae5d2;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
}

.intro-row {
  margin-bottom: 10px;
}

.intro-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #e6f0e9;
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

.intro-list {
  margin: 0;
  padding-left: 18px;
  color: #555;
  font-size: 14px;
  line-height: 1.75;
}

.tip-card h3 {
  margin: 0 0 10px;
  color: #2d6a4f;
}

.tip-card {
  background: linear-gradient(180deg, #ffffff 0%, #f6fbf8 100%);
}

.tip-card p {
  margin: 0;
  color: #666;
  line-height: 1.65;
}

.section-anchor {
  margin-top: 20px;
  margin-bottom: 10px;
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

.list-wrap {
  min-height: 220px;
}

.activity-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.25s;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e1eee6;
}

.activity-card:hover {
  box-shadow: 0 10px 22px rgba(20, 84, 56, 0.14);
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
  transition: transform 0.35s ease;
}

.activity-card:hover .activity-image img {
  transform: scale(1.05);
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

.card-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-tip {
  color: #7c9a89;
  font-size: 12px;
}
</style>
