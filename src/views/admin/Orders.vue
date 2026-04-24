<template>
  <div class="admin-page">
    <h2>订单管理</h2>
    <div class="toolbar toolbar-wrap">
      <el-select v-model="filterOrderStatus" clearable placeholder="订单状态" style="width: 150px" @change="loadOrders">
        <el-option label="全部状态" :value="null" />
        <el-option label="待付款" :value="0" />
        <el-option label="待发货" :value="1" />
        <el-option label="待收货" :value="2" />
        <el-option label="已完成" :value="3" />
        <el-option label="已取消" :value="4" />
        <el-option label="退款中" :value="5" />
        <el-option label="已退款" :value="6" />
      </el-select>
      <el-input
        v-model="orderSearchKeyword"
        placeholder="订单号 / 收货人 / 手机号"
        clearable
        style="width: 280px"
        @keyup.enter="loadOrders"
      />
      <el-button type="primary" @click="loadOrders">搜索</el-button>
      <el-button size="default" @click="resetOrderFilters">重置</el-button>
      <el-button size="default" @click="loadOrders">刷新</el-button>
    </div>
    <el-table :data="orders" style="width: 100%" v-loading="loading">
      <el-table-column prop="orderNo" label="订单号" min-width="200" show-overflow-tooltip></el-table-column>
      <el-table-column label="配送方式" min-width="110">
        <template #default="scope">
          <el-tag :type="scope.row.deliveryType === 2 ? 'warning' : 'primary'" size="small">
            {{ scope.row.deliveryType === 2 ? '线下自提' : '线上配送' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="订单金额" min-width="120">
        <template #default="scope">
          ¥{{ Number(scope.row.totalAmount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="110">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="170"></el-table-column>
      <el-table-column label="操作" width="290" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="viewOrder(scope.row)">查看</el-button>
          <el-button size="small" type="success" v-if="scope.row.status === 1" @click="shipOrder(scope.row.id)">发货</el-button>
          <el-button size="small" type="warning" v-if="scope.row.status === 2" @click="confirmOrder(scope.row.id)">确认收货</el-button>
          <el-button size="small" type="danger" v-if="scope.row.status === 0" @click="cancelOrder(scope.row.id)">取消订单</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && orders.length === 0" description="暂无订单"></el-empty>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="订单详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-loading="detailLoading" v-if="orderDetail">
        <div class="order-header">
          <div>
            <span>订单号：{{ orderDetail.order.orderNo }}</span>
            <el-tag :type="getStatusType(orderDetail.order.status)" style="margin-left: 10px;">
              {{ getStatusText(orderDetail.order.status) }}
            </el-tag>
          </div>
        </div>
        <el-divider />
        
        <h3>商品信息</h3>
        <el-table :data="orderDetail.items" style="width: 100%; margin-bottom: 20px;">
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

        <h3>{{ orderDetail.order.deliveryType === 2 ? '自提信息' : '收货信息' }}</h3>
        <div class="address-info">
          <p><strong>配送方式：</strong>{{ orderDetail.order.deliveryType === 2 ? '线下自提' : '线上配送' }}</p>
          <p><strong>{{ orderDetail.order.deliveryType === 2 ? '取货人' : '收货人' }}：</strong>{{ orderDetail.order.receiverName }}</p>
          <p><strong>联系电话：</strong>{{ orderDetail.order.receiverPhone }}</p>
          <p><strong>{{ orderDetail.order.deliveryType === 2 ? '自提门店/地址' : '收货地址' }}：</strong>{{ orderDetail.order.receiverAddress }}</p>
        </div>

        <el-divider />

        <h3>订单信息</h3>
        <div class="order-info">
          <p><strong>订单金额：</strong>¥{{ Number(orderDetail.order.totalAmount).toFixed(2) }}</p>
          <p><strong>实付金额：</strong>¥{{ Number(orderDetail.order.payAmount).toFixed(2) }}</p>
          <p><strong>支付方式：</strong>{{ getPayTypeText(orderDetail.order.payType) }}</p>
          <p><strong>创建时间：</strong>{{ formatTime(orderDetail.order.createTime) }}</p>
          <p v-if="orderDetail.order.payTime"><strong>支付时间：</strong>{{ formatTime(orderDetail.order.payTime) }}</p>
          <p v-if="orderDetail.order.shipTime"><strong>发货时间：</strong>{{ formatTime(orderDetail.order.shipTime) }}</p>
          <p v-if="orderDetail.order.completeTime"><strong>完成时间：</strong>{{ formatTime(orderDetail.order.completeTime) }}</p>
          <p v-if="orderDetail.order.remark"><strong>备注：</strong>{{ orderDetail.order.remark }}</p>
        </div>

        <template v-if="deliveryTrack && orderDetail.order.deliveryType === 1">
          <el-divider />
          <h3>配送模拟轨迹</h3>
          <p class="admin-track-hint">同城演示：途中位置为随机生成，直线距离非真实 GPS。</p>
          <div class="admin-track-summary">
            <el-tag type="info" size="small">{{ deliveryTrack.cityLabel }}</el-tag>
            <span v-if="adminCurrentTrackStep" class="admin-track-dist">
              当前：{{ adminCurrentTrackStep.title }} · 距收货地约 <strong>{{ formatDist(adminCurrentTrackStep.distanceKm) }}</strong> km
            </span>
          </div>
          <el-timeline class="admin-track-timeline">
            <el-timeline-item
              v-for="step in deliveryTrack.steps"
              :key="step.index"
              :type="step.index < deliveryTrack.currentStepIndex ? 'success' : (step.index === deliveryTrack.currentStepIndex ? 'primary' : 'info')"
              :hollow="step.index > deliveryTrack.currentStepIndex"
            >
              <p class="admin-track-step-title">{{ step.title }}</p>
              <p class="admin-track-step-meta">距收货地约 {{ formatDist(step.distanceKm) }} km</p>
            </el-timeline-item>
          </el-timeline>
        </template>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'AdminOrders',
  setup() {
    const orders = ref([])
    const filterOrderStatus = ref(null)
    const orderSearchKeyword = ref('')
    const filterUserId = ref('')
    const loading = ref(false)
    const dialogVisible = ref(false)
    const detailLoading = ref(false)
    const orderDetail = ref(null)
    const deliveryTrack = ref(null)

    const adminCurrentTrackStep = computed(() => {
      const t = deliveryTrack.value
      if (!t || !t.steps || !t.steps.length) return null
      const i = Math.min(t.currentStepIndex, t.steps.length - 1)
      return t.steps[i]
    })

    const formatDist = (v) => {
      if (v === undefined || v === null) return '-'
      return Number(v).toFixed(2)
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

    const loadOrders = async () => {
      loading.value = true
      try {
        const params = {}
        if (filterOrderStatus.value !== null && filterOrderStatus.value !== undefined) {
          params.status = filterOrderStatus.value
        }
        if (orderSearchKeyword.value?.trim()) {
          params.keyword = orderSearchKeyword.value.trim()
        }
        if (filterUserId.value != null && String(filterUserId.value).trim() !== '') {
          const uid = Number(String(filterUserId.value).trim())
          if (!Number.isNaN(uid)) params.userId = uid
        }
        const res = await api.order.admin.getList(params)
        orders.value = res.data || []
      } catch (error) {
        ElMessage.error('加载订单列表失败')
      } finally {
        loading.value = false
      }
    }

    const resetOrderFilters = () => {
      filterOrderStatus.value = null
      orderSearchKeyword.value = ''
      filterUserId.value = ''
      loadOrders()
    }

    const viewOrder = async (order) => {
      dialogVisible.value = true
      detailLoading.value = true
      deliveryTrack.value = null
      try {
        const res = await api.order.admin.getById(order.id)
        orderDetail.value = res.data
        if (orderDetail.value?.order?.deliveryType === 1 && orderDetail.value.order.shipTime && orderDetail.value.order.status >= 2) {
          try {
            const tr = await api.order.admin.getDeliveryTrack(order.id)
            deliveryTrack.value = tr.data || null
          } catch {
            deliveryTrack.value = null
          }
        }
      } catch (error) {
        ElMessage.error('加载订单详情失败')
        dialogVisible.value = false
      } finally {
        detailLoading.value = false
      }
    }

    const shipOrder = async (id) => {
      try {
        await ElMessageBox.confirm('确定要发货该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.order.admin.ship(id)
        ElMessage.success('发货成功')
        loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '发货失败')
        }
      }
    }

    const confirmOrder = async (id) => {
      try {
        await ElMessageBox.confirm('确认该订单已收货并完成吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.order.admin.confirm(id)
        ElMessage.success('确认收货成功')
        loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '确认收货失败')
        }
      }
    }

    const cancelOrder = async (id) => {
      try {
        await ElMessageBox.confirm('确定要取消该订单吗？取消后不可恢复。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.order.admin.cancel(id)
        ElMessage.success('取消订单成功')
        loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '取消订单失败')
        }
      }
    }

    onMounted(() => {
      loadOrders()
    })

    return {
      orders,
      filterOrderStatus,
      orderSearchKeyword,
      filterUserId,
      resetOrderFilters,
      DEFAULT_PRODUCT_IMAGE,
      loading,
      dialogVisible,
      detailLoading,
      orderDetail,
      deliveryTrack,
      adminCurrentTrackStep,
      formatDist,
      getStatusText,
      getStatusType,
      getPayTypeText,
      formatTime,
      loadOrders,
      viewOrder,
      shipOrder,
      confirmOrder,
      cancelOrder
    }
  }
}
</script>

<style scoped>
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
  border-radius: var(--radius-base);
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

h3 {
  margin: 20px 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
}

.admin-track-hint {
  color: #909399;
  font-size: 13px;
  margin-bottom: 10px;
}

.admin-track-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.admin-track-dist {
  font-size: 14px;
  color: #606266;
}

.admin-track-timeline {
  margin-top: 8px;
}

.admin-track-step-title {
  margin: 0 0 4px 0;
  font-weight: 500;
}

.admin-track-step-meta {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.toolbar-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
</style>

