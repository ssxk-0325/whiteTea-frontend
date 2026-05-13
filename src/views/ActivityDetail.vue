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
                <div v-if="isIndustryService" class="industry-context">{{ industryServiceHint }}</div>
                <div v-if="isIndustryService" class="industry-join">
                  <el-button v-if="!isLoggedIn" type="primary" @click="$router.push('/login')">登录后加入</el-button>
                  <el-button
                    v-else-if="!myIndustryJoin"
                    type="primary"
                    size="large"
                    style="width: 200px;"
                    @click="openJoinDialog"
                  >
                    申请加入
                  </el-button>
                  <el-tag v-else :type="getJoinTag(myIndustryJoin.status)" size="large">
                    {{ getJoinText(myIndustryJoin.status) }}
                  </el-tag>
                  <div v-if="myIndustryJoin" class="join-hint">
                    <span v-if="myIndustryJoin.adminRemark">审核备注：{{ myIndustryJoin.adminRemark }}</span>
                    <span v-else-if="myIndustryJoin.status === 1">审核已通过，详见下方衔接信息。</span>
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
                    抢活动入场券
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
                    登录后抢活动入场券
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

            <el-card
              v-if="isIndustryService && myIndustryJoin && myIndustryJoin.status === 1"
              class="industry-followup-card"
              shadow="never"
            >
              <template v-if="activity.type === 5">
                <h3 class="followup-title">上岗对接信息</h3>
                <p class="followup-lead">审核已通过，请保存对接码，并按下方信息准时集合；到场后由管理员在后台完成到岗签到。</p>
                <div v-if="myIndustryJoin.joinCode" class="join-code-row">
                  <span class="follow-label">对接码</span>
                  <code class="join-code">{{ myIndustryJoin.joinCode }}</code>
                  <el-button size="small" type="primary" link @click="copyJoinCode">复制</el-button>
                </div>
                <el-descriptions :column="1" border size="small" class="follow-desc">
                  <el-descriptions-item v-if="myIndustryJoin.pickMeetingPoint" label="集合地点">
                    {{ myIndustryJoin.pickMeetingPoint }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="myIndustryJoin.pickContactLine" label="联系人">
                    {{ myIndustryJoin.pickContactLine }}
                  </el-descriptions-item>
                  <el-descriptions-item label="到岗签到">
                    <span v-if="myIndustryJoin.checkedInAt">已于 {{ formatDateTime(myIndustryJoin.checkedInAt) }} 完成签到</span>
                    <span v-else>到场后请等待管理员点击「到岗签到」</span>
                  </el-descriptions-item>
                </el-descriptions>
                <div v-if="myIndustryJoin.pickNotice" class="pick-notice-block">
                  <div class="follow-label">上岗须知</div>
                  <div class="notice-body">{{ myIndustryJoin.pickNotice }}</div>
                </div>
              </template>
              <template v-else-if="activity.type === 6">
                <h3 class="followup-title">培训与参训后续</h3>
                <p class="followup-lead">审核已通过，请保存参训凭证码；费用与课表以主办方通知及下方说明为准。</p>
                <div v-if="myIndustryJoin.joinCode" class="join-code-row">
                  <span class="follow-label">参训凭证码</span>
                  <code class="join-code">{{ myIndustryJoin.joinCode }}</code>
                  <el-button size="small" type="primary" link @click="copyJoinCode">复制</el-button>
                </div>
                <el-descriptions
                  v-if="myIndustryJoin.activityPrice != null && myIndustryJoin.activityPrice !== ''"
                  :column="1"
                  border
                  size="small"
                  class="follow-desc"
                >
                  <el-descriptions-item label="参考费用">
                    ¥{{ Number(myIndustryJoin.activityPrice).toFixed(2) }}（实际以线下约定为准）
                  </el-descriptions-item>
                </el-descriptions>
                <p v-if="myIndustryJoin.trainingExtraHint" class="extra-hint">{{ myIndustryJoin.trainingExtraHint }}</p>
                <div v-if="myIndustryJoin.trainingMaterials" class="materials-block">
                  <div class="follow-label">学习资料与链接</div>
                  <pre class="materials-pre">{{ myIndustryJoin.trainingMaterials }}</pre>
                </div>
                <p v-else class="muted-tip">本场资料由管理员在后台维护；您也可先到「福鼎白茶文化」浏览品鉴、工艺等公开内容。</p>
                <div class="follow-actions">
                  <el-button type="primary" @click="$router.push({ path: '/culture', query: { type: 5 } })">
                    福鼎白茶文化 · 培训专区
                  </el-button>
                  <el-button @click="$router.push({ path: '/quiz', query: { category: 4 } })">
                    趣味问答 · 培训专区
                  </el-button>
                </div>
              </template>
            </el-card>
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
    const industryServicePath = computed(() => {
      if (route.query.from === 'pick') return '/services/pick-recruitment'
      if (route.query.from === 'wholesale') return '/services/wholesale-training'
      return activity.value?.type === 6 ? '/services/wholesale-training' : '/services/pick-recruitment'
    })
    const industryServiceHint = computed(() => {
      if (activity.value?.type === 5) {
        return '当前为采摘招募服务详情，适用于采茶季短期用工申请。'
      }
      if (activity.value?.type === 6) {
        return '当前为批发培训服务详情，适用于白茶批量对接与技术培训申请。'
      }
      return ''
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
          router.push('/services/pick-recruitment')
        } else if (route.query.from === 'pick' || route.query.from === 'wholesale') {
          router.push(industryServicePath.value)
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

    const copyJoinCode = async () => {
      const code = myIndustryJoin.value?.joinCode
      if (!code) return
      try {
        await navigator.clipboard.writeText(code)
        ElMessage.success('已复制到剪贴板')
      } catch {
        ElMessage.error('复制失败，请手动复制')
      }
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
      industryServiceHint,
      handleGrab,
      formatDateTime,
      getTypeText,
      getTypeTag,
      getJoinText,
      getJoinTag,
      openJoinDialog,
      resetJoinForm,
      submitJoin,
      copyJoinCode
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

.industry-context {
  margin-top: 14px;
  font-size: 13px;
  color: #2d6a4f;
  background: #eff8f2;
  border-radius: 6px;
  padding: 8px 10px;
  display: inline-block;
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

.industry-followup-card {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.followup-title {
  margin: 0 0 8px;
  font-size: 18px;
  color: #304b3d;
}

.followup-lead {
  margin: 0 0 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.join-code-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.follow-label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.join-code {
  font-size: 16px;
  padding: 6px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px dashed #c0c4cc;
  letter-spacing: 0.5px;
}

.follow-desc {
  margin-bottom: 14px;
}

.pick-notice-block,
.materials-block {
  margin-top: 12px;
}

.notice-body {
  margin-top: 8px;
  white-space: pre-wrap;
  line-height: 1.65;
  color: #444;
  font-size: 14px;
}

.materials-pre {
  margin: 8px 0 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  background: #fafafa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #eee;
}

.extra-hint {
  margin: 10px 0;
  padding: 10px 12px;
  background: #fff8e6;
  border-radius: 6px;
  color: #856404;
  font-size: 14px;
  line-height: 1.5;
}

.muted-tip {
  font-size: 13px;
  color: #888;
  margin: 8px 0 12px;
}

.follow-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
</style>

