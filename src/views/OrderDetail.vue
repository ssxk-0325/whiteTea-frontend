<template>
  <div class="order-detail-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <el-button @click="$router.back()" style="margin-bottom: 20px;">返回</el-button>
        <h2>订单详情</h2>
        <el-card v-loading="loading">
          <div v-if="order">
            <div class="order-header">
              <div>
                <span>订单号：{{ order.orderNo }}</span>
                <el-tag :type="getStatusType(order.status)" style="margin-left: 10px;">
                  {{ getStatusText(order.status) }}
                </el-tag>
              </div>
            </div>
            <el-divider />
            
            <h3>商品信息</h3>
            <el-table :data="orderItems" style="width: 100%; margin-bottom: 20px;">
              <el-table-column label="商品" width="300">
                <template #default="scope">
                  <div class="product-cell">
                    <img :src="scope.row.productImage || DEFAULT_PRODUCT_IMAGE" :alt="scope.row.productName" />
                    <span>{{ scope.row.productName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="单价" width="120">
                <template #default="scope">
                  ¥{{ Number(scope.row.price).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column label="数量" width="100">
                <template #default="scope">
                  {{ scope.row.quantity }}
                </template>
              </el-table-column>
              <el-table-column label="小计" width="120">
                <template #default="scope">
                  ¥{{ Number(scope.row.subtotal).toFixed(2) }}
                </template>
              </el-table-column>
            </el-table>

            <el-divider />

            <h3>{{ order.deliveryType === 2 ? '自提信息' : '收货信息' }}</h3>
            <div class="address-info">
              <p><strong>取货方式：</strong>{{ order.deliveryType === 2 ? '线下自提（唯一门店）' : '线上配送（平台统一配送）' }}</p>
              <p><strong>{{ order.deliveryType === 2 ? '取货人' : '收货人' }}：</strong>{{ order.receiverName }}</p>
              <p><strong>联系电话：</strong>{{ order.receiverPhone }}</p>
              <p><strong>{{ order.deliveryType === 2 ? '自提点' : '收货地址' }}：</strong>{{ order.receiverAddress }}</p>
            </div>

            <template v-if="deliveryTrack && order.deliveryType === 1 && order.status !== 5 && order.status !== 6">
              <el-divider />
              <h3>配送模拟轨迹</h3>
              <p class="track-hint">以下为同城演示轨迹：始发点与途中位置在福鼎市域内随机生成，直线距离仅供参考，非真实 GPS。</p>
              <div class="track-summary">
                <el-tag type="info" size="small">{{ deliveryTrack.cityLabel }}</el-tag>
                <span class="track-dist" v-if="currentTrackStep">
                  当前：{{ currentTrackStep.title }} · 距收货地直线距离约 <strong>{{ formatDistance(currentTrackStep.distanceKm) }}</strong> km
                </span>
              </div>
              <el-timeline class="track-timeline">
                <el-timeline-item
                  v-for="step in deliveryTrack.steps"
                  :key="step.index"
                  :type="step.index < deliveryTrack.currentStepIndex ? 'success' : (step.index === deliveryTrack.currentStepIndex ? 'primary' : 'info')"
                  :hollow="step.index > deliveryTrack.currentStepIndex"
                  :timestamp="stepTitleHint(step)"
                >
                  <p class="track-step-title">{{ step.title }}</p>
                  <p class="track-step-meta">距收货地约 {{ formatDistance(step.distanceKm) }} km</p>
                </el-timeline-item>
              </el-timeline>
              <p v-if="deliveryTrack.nextStepAt && deliveryTrack.currentStepIndex < 5" class="track-next">
                预计下一节点更新：{{ formatTime(deliveryTrack.nextStepAt) }}（每 {{ trackStepMinutes }} 分钟推进一档）
              </p>
            </template>

            <el-divider />

            <h3>订单信息</h3>
            <div class="order-info">
              <p><strong>下单模式：</strong>{{ order.orderMode === 1 ? '拼团购买' : '普通购买' }}</p>
              <p><strong>订单金额：</strong>¥{{ Number(order.totalAmount).toFixed(2) }}</p>
              <p><strong>拼团优惠：</strong>-¥{{ Number(order.groupDiscountAmount || 0).toFixed(2) }}</p>
              <p><strong>批发优惠：</strong>-¥{{ Number(order.wholesaleDiscountAmount || 0).toFixed(2) }}</p>
              <p><strong>优惠券抵扣：</strong>-¥{{ Number(order.couponDiscountAmount || 0).toFixed(2) }}</p>
              <p><strong>实付金额：</strong>¥{{ Number(order.payAmount).toFixed(2) }}</p>
              <p><strong>购物返积分：</strong>{{ order.rewardPoints || 0 }}</p>
              <p v-if="order.couponCode"><strong>使用券码：</strong>{{ order.couponCode }}</p>
              <p><strong>支付方式：</strong>{{ getPayTypeText(order.payType) }}</p>
              <p><strong>创建时间：</strong>{{ formatTime(order.createTime) }}</p>
              <p v-if="order.payTime"><strong>支付时间：</strong>{{ formatTime(order.payTime) }}</p>
              <p v-if="order.shipTime"><strong>发货时间：</strong>{{ formatTime(order.shipTime) }}</p>
              <p v-if="order.completeTime"><strong>完成时间：</strong>{{ formatTime(order.completeTime) }}</p>
              <p v-if="order.remark"><strong>备注：</strong>{{ order.remark }}</p>
            </div>

            <el-alert
              v-if="refundRejectAlertVisible"
              type="warning"
              :closable="false"
              show-icon
              class="refund-reject-alert"
              :title="'退款申请未通过：' + (order.refundAdminRemark || '')"
            />

            <template v-if="order.status === 5 || order.status === 6">
              <el-divider />
              <h3>退款 / 退货</h3>
              <div class="refund-panel">
                <p v-if="order.status === 5"><strong>状态：</strong>商家审核中</p>
                <p v-else><strong>状态：</strong>已退款（演示环境不调用真实支付退款接口）</p>
                <p v-if="order.refundReason"><strong>申请说明：</strong>{{ order.refundReason }}</p>
                <p v-if="order.refundApplyTime"><strong>申请时间：</strong>{{ formatTime(order.refundApplyTime) }}</p>
                <p v-if="order.status === 6 && order.refundAuditTime"><strong>处理时间：</strong>{{ formatTime(order.refundAuditTime) }}</p>
              </div>
            </template>

            <el-divider />

            <div class="order-actions" v-if="order.status === 0 || order.status === 2 || canApplyRefund">
              <el-button v-if="order.status === 0" type="primary" @click="openPayDialog">去付款</el-button>
              <el-button v-if="order.status === 0" :loading="syncPayLoading" @click="syncAlipayPayStatus">同步支付状态</el-button>
              <el-button v-if="order.status === 0" @click="cancelOrder">取消订单</el-button>
              <el-button v-if="order.status === 2" type="success" @click="confirmReceive">确认收货</el-button>
              <el-button v-if="canApplyRefund" type="warning" plain @click="refundDialogVisible = true">申请退货退款</el-button>
            </div>

            <template v-if="order.status === 3">
              <el-divider />
              <h3>订单评价</h3>
              <div v-if="orderReview" class="review-display">
                <el-rate :model-value="orderReview.rating" disabled show-score />
                <p class="review-meta">{{ orderReview.userNickname || '我' }} · {{ formatTime(orderReview.createTime) }}</p>
                <p>{{ orderReview.content || '未填写文字' }}</p>
              </div>
              <div v-else class="review-form">
                <el-form label-width="80px">
                  <el-form-item label="评分">
                    <el-rate v-model="reviewRating" show-score />
                  </el-form-item>
                  <el-form-item label="评价内容">
                    <el-input v-model="reviewContent" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="分享您的购物体验" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="reviewSubmitting" @click="submitReview">提交评价</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </template>
          </div>
        </el-card>
      </el-main>
    </el-container>
    <SandboxPayDialog v-model="payDialogVisible" :order-id="order?.id" @success="loadOrderDetail" />

    <el-dialog v-model="refundDialogVisible" title="申请退货退款" width="520px" destroy-on-close @closed="refundReasonInput = ''">
      <p class="refund-dialog-tip">提交后订单将进入「退款中」，由商家审核。同意后库存与积分将按规则回退（演示环境不退真实支付渠道）。</p>
      <el-input v-model="refundReasonInput" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请说明退款或退货原因" />
      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="refundSubmitting" @click="submitRefundApply">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'
import SandboxPayDialog from '@/components/SandboxPayDialog.vue'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'OrderDetail',
  components: {
    Header,
    SandboxPayDialog
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const order = ref(null)
    const orderItems = ref([])
    const orderReview = ref(null)
    const reviewRating = ref(5)
    const reviewContent = ref('')
    const reviewSubmitting = ref(false)
    const payDialogVisible = ref(false)
    const syncPayLoading = ref(false)
    const deliveryTrack = ref(null)
    const refundDialogVisible = ref(false)
    const refundReasonInput = ref('')
    const refundSubmitting = ref(false)
    let trackPollTimer = null

    const canApplyRefund = computed(() => {
      const o = order.value
      if (!o) return false
      const st = o.status
      if (st !== 1 && st !== 2 && st !== 3) return false
      if (!o.payTime) return false
      return true
    })

    const refundRejectAlertVisible = computed(() => {
      const o = order.value
      if (!o || !o.refundAdminRemark) return false
      const st = o.status
      return st === 1 || st === 2 || st === 3
    })

    const currentTrackStep = computed(() => {
      const t = deliveryTrack.value
      if (!t || !t.steps || t.steps.length === 0) return null
      const i = Math.min(t.currentStepIndex, t.steps.length - 1)
      return t.steps[i]
    })

    const trackStepMinutes = computed(() => {
      const ms = deliveryTrack.value?.stepDurationMs || 0
      return Math.max(1, Math.round(ms / 60000))
    })

    const formatDistance = (v) => {
      if (v === undefined || v === null) return '-'
      return Number(v).toFixed(2)
    }

    const stepTitleHint = (step) => {
      const t = deliveryTrack.value
      if (!t) return ''
      if (step.index < t.currentStepIndex) return '已更新'
      if (step.index === t.currentStepIndex) return '当前'
      return '待更新'
    }

    const loadDeliveryTrack = async () => {
      if (!order.value || order.value.deliveryType !== 1 || !order.value.shipTime) {
        deliveryTrack.value = null
        return
      }
      if (order.value.status === 5 || order.value.status === 6) {
        deliveryTrack.value = null
        return
      }
      if (order.value.status < 2) {
        deliveryTrack.value = null
        return
      }
      try {
        const res = await api.order.getDeliveryTrack(route.params.id)
        deliveryTrack.value = res.data || null
      } catch {
        deliveryTrack.value = null
      }
    }

    const loadOrderDetail = async () => {
      loading.value = true
      try {
        const res = await api.order.getById(route.params.id)
        order.value = res.data.order
        orderItems.value = res.data.items
        orderReview.value = res.data.review || null
        await loadDeliveryTrack()
        if (trackPollTimer) {
          clearInterval(trackPollTimer)
          trackPollTimer = null
        }
        if (order.value && order.value.status === 2 && order.value.deliveryType === 1 && order.value.shipTime) {
          trackPollTimer = setInterval(loadDeliveryTrack, 45000)
        }
      } catch (error) {
        ElMessage.error('加载订单详情失败')
        router.push('/orders')
      } finally {
        loading.value = false
      }
    }

    const getStatusText = (status) => {
      const statusMap = {
        0: '待付款',
        1: '待发货',
        2: '待收货',
        3: '已完成',
        4: '已取消',
        5: '退款中',
        6: '已退款'
      }
      return statusMap[status] || '未知'
    }

    const getStatusType = (status) => {
      const typeMap = {
        0: 'warning',
        1: 'info',
        2: 'primary',
        3: 'success',
        4: 'danger',
        5: 'warning',
        6: 'info'
      }
      return typeMap[status] || 'info'
    }

    const getPayTypeText = (payType) => {
      const typeMap = {
        0: '未支付',
        1: '微信支付',
        2: '支付宝',
        3: '银行卡'
      }
      return typeMap[payType] || '未知'
    }

    const formatTime = (time) => {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN')
    }

    const openPayDialog = () => {
      payDialogVisible.value = true
    }

    const syncAlipayPayStatus = async () => {
      if (!order.value?.id) return
      syncPayLoading.value = true
      try {
        const res = await api.order.alipaySyncPayStatus(order.value.id)
        ElMessage.success(res.message || '已同步支付状态')
        await loadOrderDetail()
      } catch (error) {
        ElMessage.error(error.message || '同步失败')
      } finally {
        syncPayLoading.value = false
      }
    }

    const submitReview = async () => {
      if (!reviewRating.value) {
        ElMessage.warning('请选择评分')
        return
      }
      reviewSubmitting.value = true
      try {
        await api.order.submitReview(order.value.id, {
          rating: reviewRating.value,
          content: reviewContent.value
        })
        ElMessage.success('评价成功')
        loadOrderDetail()
      } catch (error) {
        ElMessage.error(error.message || '评价失败')
      } finally {
        reviewSubmitting.value = false
      }
    }

    const confirmReceive = async () => {
      try {
        await ElMessageBox.confirm('确认收货后，订单将完成，请确认商品无误', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.order.confirmReceive(order.value.id)
        ElMessage.success('确认收货成功')
        loadOrderDetail()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '确认收货失败')
        }
      }
    }

    const submitRefundApply = async () => {
      const text = (refundReasonInput.value || '').trim()
      if (!text) {
        ElMessage.warning('请填写退款原因')
        return
      }
      refundSubmitting.value = true
      try {
        await api.order.applyRefund(order.value.id, text)
        ElMessage.success('已提交申请')
        refundDialogVisible.value = false
        refundReasonInput.value = ''
        await loadOrderDetail()
      } catch (error) {
        ElMessage.error(error.message || '提交失败')
      } finally {
        refundSubmitting.value = false
      }
    }

    const cancelOrder = async () => {
      try {
        await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.order.cancel(order.value.id)
        ElMessage.success('订单取消成功')
        loadOrderDetail()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '取消订单失败')
        }
      }
    }

    watch(
      () => order.value?.status,
      (st) => {
        if (st !== 2 && trackPollTimer) {
          clearInterval(trackPollTimer)
          trackPollTimer = null
        }
      }
    )

    onMounted(() => {
      loadOrderDetail()
    })

    onBeforeUnmount(() => {
      if (trackPollTimer) clearInterval(trackPollTimer)
    })

    return {
      loading,
      DEFAULT_PRODUCT_IMAGE,
      order,
      orderItems,
      orderReview,
      reviewRating,
      reviewContent,
      reviewSubmitting,
      payDialogVisible,
      syncPayLoading,
      syncAlipayPayStatus,
      deliveryTrack,
      currentTrackStep,
      formatDistance,
      stepTitleHint,
      trackStepMinutes,
      getStatusText,
      getStatusType,
      getPayTypeText,
      formatTime,
      openPayDialog,
      submitReview,
      confirmReceive,
      cancelOrder,
      canApplyRefund,
      refundRejectAlertVisible,
      refundDialogVisible,
      refundReasonInput,
      refundSubmitting,
      submitRefundApply
    }
  }
}
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-cell img {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.address-info,
.order-info {
  margin: 20px 0;
}

.address-info p,
.order-info p {
  margin-bottom: 10px;
  line-height: 1.8;
}

.refund-reject-alert {
  margin: 16px 0 0;
}

.refund-panel {
  margin: 8px 0 0;
  line-height: 1.75;
  color: #303133;
}

.refund-dialog-tip {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  margin: 0 0 12px;
}

.order-actions {
  text-align: right;
  margin-top: 20px;
}

.order-actions .el-button {
  margin-left: 10px;
}

.review-display,
.review-form {
  margin-top: 12px;
}

.review-meta {
  color: #909399;
  font-size: 13px;
  margin: 8px 0;
}

.track-hint {
  color: #909399;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.track-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.track-dist {
  font-size: 14px;
  color: #606266;
}

.track-timeline {
  margin-top: 8px;
  padding-left: 4px;
}

.track-step-title {
  margin: 0 0 4px 0;
  font-weight: 500;
  color: #303133;
}

.track-step-meta {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.track-next {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
}
</style>

