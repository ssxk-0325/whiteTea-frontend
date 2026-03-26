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
                    <span>{{ isIndustryService ? '信息时间' : '活动时间' }}：{{ formatDateTime(activity.startTime) }} - {{ formatDateTime(activity.endTime) }}</span>
                  </div>
                  <div class="detail-item" v-if="!isIndustryService && activity.couponStartTime">
                    <el-icon><Ticket /></el-icon>
                    <span>抢券时间：{{ formatDateTime(activity.couponStartTime) }} - {{ formatDateTime(activity.couponEndTime) }}</span>
                  </div>
                  <div class="detail-item" v-if="!isIndustryService && activity.totalCoupons > 0">
                    <el-icon><Star /></el-icon>
                    <span>剩余券数：{{ activity.totalCoupons - activity.issuedCoupons }}/{{ activity.totalCoupons }}</span>
                  </div>
                </div>
                <div v-if="isIndustryService" class="industry-join">
                  <el-button v-if="!isLoggedIn" type="primary" @click="$router.push('/login')">登录后加入</el-button>
                  <el-button
                    v-else-if="!myIndustryJoin"
                    type="primary"
                    size="large"
                    style="width: 200px;"
                    @click="openJoinDialog"
                  >
                    我要加入
                  </el-button>
                  <el-tag v-else :type="getJoinTag(myIndustryJoin.status)" size="large">
                    {{ getJoinText(myIndustryJoin.status) }}
                  </el-tag>
                  <div v-if="myIndustryJoin" class="join-hint">
                    <span v-if="myIndustryJoin.adminRemark">审核备注：{{ myIndustryJoin.adminRemark }}</span>
                    <span v-else>已提交申请，管理员审核后会更新状态</span>
                  </div>
                </div>
                <div class="grab-section" v-if="!isIndustryService">
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
              <h3>{{ isIndustryService ? '信息详情' : '活动详情' }}</h3>
              <div v-html="activity.description"></div>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>

    <el-dialog v-model="showJoinDialog" title="填写基础信息" width="520px" @close="resetJoinForm">
      <el-form :model="joinForm" :rules="joinRules" label-width="90px" ref="joinFormRef">
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="joinForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="joinForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="所在地" prop="location">
          <el-input v-model="joinForm.location" placeholder="如：福鼎·点头镇（可选）" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="joinForm.remark" type="textarea" :rows="3" placeholder="可填写经验、可到岗时间等（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showJoinDialog = false">取消</el-button>
        <el-button type="primary" :loading="joining" @click="submitJoin">提交</el-button>
      </template>
    </el-dialog>
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
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_TAGS } from '@/constants/activityTypes'

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
    const myIndustryJoin = ref(null)
    const showJoinDialog = ref(false)
    const joining = ref(false)
    const joinFormRef = ref(null)
    const joinForm = ref({
      realName: '',
      phone: '',
      location: '',
      remark: ''
    })

    const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])
    const isIndustryService = computed(() => {
      const t = activity.value?.type
      return t === 5 || t === 6
    })

    const joinRules = {
      realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
    }

    const loadActivity = async () => {
      loading.value = true
      try {
        const res = await api.activity.getById(route.params.id)
        activity.value = res.data
        if (isLoggedIn.value && !isIndustryService.value) {
          checkGrabbed()
        }
        if (isLoggedIn.value && isIndustryService.value) {
          loadMyJoin()
        }
      } catch (error) {
        ElMessage.error('加载详情失败')
        if (route.query.from === 'industry') {
          router.push('/services/industry')
        } else {
          router.push('/activity')
        }
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

    const loadMyJoin = async () => {
      try {
        const res = await api.activity.getMyIndustryJoin(route.params.id)
        myIndustryJoin.value = res.data || null
      } catch (e) {
        myIndustryJoin.value = null
      }
    }

    const canGrab = computed(() => {
      if (isIndustryService.value || !activity.value || !isLoggedIn.value || hasGrabbed.value) {
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

    const getTypeText = (type) => ACTIVITY_TYPE_LABELS[type] || '未知'
    const getTypeTag = (type) => ACTIVITY_TYPE_TAGS[type] || 'info'

    const getJoinText = (status) => {
      const map = { 0: '已提交，待审核', 1: '审核通过', 2: '已驳回' }
      return map[status] || '未知状态'
    }
    const getJoinTag = (status) => {
      const map = { 0: 'warning', 1: 'success', 2: 'danger' }
      return map[status] || 'info'
    }

    const openJoinDialog = () => {
      if (!isLoggedIn.value) {
        ElMessage.info('请先登录')
        router.push('/login')
        return
      }
      showJoinDialog.value = true
    }

    const resetJoinForm = () => {
      joinForm.value = { realName: '', phone: '', location: '', remark: '' }
      if (joinFormRef.value) joinFormRef.value.resetFields()
    }

    const submitJoin = async () => {
      if (!joinFormRef.value) return
      await joinFormRef.value.validate(async (valid) => {
        if (!valid) return
        joining.value = true
        try {
          await api.activity.joinIndustry(route.params.id, joinForm.value)
          ElMessage.success('已提交，等待管理员审核')
          showJoinDialog.value = false
          await loadMyJoin()
        } catch (e) {
          ElMessage.error(e.message || '提交失败')
        } finally {
          joining.value = false
        }
      })
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
      isIndustryService,
      myIndustryJoin,
      showJoinDialog,
      joining,
      joinFormRef,
      joinForm,
      joinRules,
      canGrab,
      handleGrab,
      formatDateTime,
      getTypeText,
      getTypeTag,
      getJoinText,
      getJoinTag,
      openJoinDialog,
      resetJoinForm,
      submitJoin
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

.industry-join {
  margin-top: 22px;
}

.join-hint {
  margin-top: 10px;
  font-size: 13px;
  color: #666;
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

