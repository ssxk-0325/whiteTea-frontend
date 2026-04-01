<template>
  <div class="orders-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1400px; margin: 0 auto; padding: 40px 32px;">
        <div class="page-header">
          <h2 class="page-title">我的订单</h2>
        </div>
        <el-card class="orders-card">
          <el-tabs v-model="activeTab" @tab-change="loadOrders" class="modern-tabs">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="待付款" name="0"></el-tab-pane>
          <el-tab-pane label="待发货" name="1"></el-tab-pane>
          <el-tab-pane label="待收货" name="2"></el-tab-pane>
          <el-tab-pane label="已完成" name="3"></el-tab-pane>
          <el-tab-pane label="已取消" name="4"></el-tab-pane>
        </el-tabs>
          <el-empty v-if="!loading && orders.length === 0" description="暂无订单"></el-empty>
          <div v-loading="loading" v-else class="orders-list">
            <el-card v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-header">
              <div>
                <span>订单号：{{ order.orderNo }}</span>
                <el-tag :type="order.deliveryType === 2 ? 'warning' : 'info'" size="small" style="margin-left: 8px;">{{ order.deliveryType === 2 ? '线下自提' : '线上配送' }}</el-tag>
                <el-tag :type="order.orderMode === 1 ? 'success' : 'info'" size="small" style="margin-left: 8px;">{{ order.orderMode === 1 ? '拼团单' : '普通单' }}</el-tag>
                <el-button type="text" @click="viewOrderDetail(order.id)" style="margin-left: 10px;">查看详情</el-button>
              </div>
              <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
            </div>
            <el-divider />
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <img :src="item.productImage || DEFAULT_PRODUCT_IMAGE" :alt="item.productName" />
                <div class="item-info">
                  <h4>{{ item.productName }}</h4>
                  <p>¥{{ Number(item.price).toFixed(2) }} x {{ item.quantity }}</p>
                </div>
              </div>
            </div>
            <el-divider />
            <div class="order-footer">
              <div class="order-info">
                <div>{{ order.deliveryType === 2 ? '取货人' : '收货人' }}：{{ order.receiverName }}</div>
                <div>联系电话：{{ order.receiverPhone }}</div>
                <div>{{ order.deliveryType === 2 ? '自提门店/地址' : '收货地址' }}：{{ order.receiverAddress }}</div>
              </div>
              <div class="order-actions">
                <div class="total-amount">总计：¥{{ Number(order.payAmount).toFixed(2) }}</div>
                <div class="discount-tip" v-if="Number(order.discountAmount || 0) > 0">已优惠 ¥{{ Number(order.discountAmount || 0).toFixed(2) }}</div>
                <div class="actions">
                  <el-button v-if="order.status === 0" type="primary" @click="openPayDialog(order.id)">去付款</el-button>
                  <el-button v-if="order.status === 0" @click="cancelOrder(order.id)">取消订单</el-button>
                  <el-button v-if="order.status === 2" type="success" @click="confirmReceive(order.id)">确认收货</el-button>
                  <el-button v-if="order.status === 3 && !order.hasReview" @click="viewOrderDetail(order.id)">评价</el-button>
                </div>
              </div>
            </div>
          </el-card>
          </div>
        </el-card>
      </el-main>
    </el-container>
    <SandboxPayDialog v-model="payDialogVisible" :loading="payLoading" @confirm="onSandboxPay" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'
import SandboxPayDialog from '@/components/SandboxPayDialog.vue'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'Orders',
  components: {
    Header,
    SandboxPayDialog
  },
  setup() {
    const router = useRouter()
    const activeTab = ref('all')
    const orders = ref([])
    const loading = ref(false)
    const payDialogVisible = ref(false)
    const payLoading = ref(false)
    const pendingPayOrderId = ref(null)

    const loadOrders = async () => {
      loading.value = true
      try {
        const status = activeTab.value === 'all' ? undefined : Number(activeTab.value)
        const res = await api.order.getList(status)
        orders.value = res.data
      } catch (error) {
        ElMessage.error('加载订单失败')
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

    const openPayDialog = (id) => {
      pendingPayOrderId.value = id
      payDialogVisible.value = true
    }

    const onSandboxPay = async (payType) => {
      const id = pendingPayOrderId.value
      if (!id) return
      payLoading.value = true
      try {
        await api.order.pay(id, payType)
        ElMessage.success('沙箱支付成功')
        payDialogVisible.value = false
        pendingPayOrderId.value = null
        loadOrders()
      } catch (error) {
        ElMessage.error(error.message || '支付失败')
      } finally {
        payLoading.value = false
      }
    }

    const confirmReceive = async (id) => {
      try {
        await ElMessageBox.confirm('确认收货后，订单将完成，请确认商品无误', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.order.confirmReceive(id)
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
        await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.order.cancel(id)
        ElMessage.success('订单取消成功')
        loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '取消订单失败')
        }
      }
    }

    const viewOrderDetail = (id) => {
      router.push(`/order/${id}`)
    }

    onMounted(() => {
      loadOrders()
    })

    return {
      activeTab,
      DEFAULT_PRODUCT_IMAGE,
      orders,
      loading,
      loadOrders,
      getStatusText,
      getStatusType,
      payDialogVisible,
      payLoading,
      openPayDialog,
      onSandboxPay,
      confirmReceive,
      cancelOrder,
      viewOrderDetail
    }
  }
}
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: transparent;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.orders-card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.orders-card :deep(.el-card__body) {
  padding: 32px;
}

.modern-tabs :deep(.el-tabs__header) {
  margin-bottom: 32px;
}

.modern-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  font-size: var(--font-size-base);
  padding: 0 24px;
  transition: var(--transition-base);
}

.modern-tabs :deep(.el-tabs__item:hover) {
  color: var(--primary-color);
}

.modern-tabs :deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
  font-weight: 600;
}

.modern-tabs :deep(.el-tabs__active-bar) {
  background: var(--primary-gradient);
  height: 3px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-base);
  transition: var(--transition-base);
  overflow: hidden;
  background: var(--bg-primary);
}

.order-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.order-card :deep(.el-card__body) {
  padding: 24px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-lighter);
}

.order-header :deep(.el-tag) {
  border-radius: var(--radius-full);
  font-weight: 600;
  padding: 6px 16px;
}

.order-items {
  margin: 24px 0;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-base);
}

.order-item {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: var(--radius-base);
  transition: var(--transition-base);
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-item:hover {
  box-shadow: var(--shadow-sm);
  transform: translateX(4px);
}

.order-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 8px 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.item-info p {
  margin: 0;
  color: var(--text-regular);
  font-size: var(--font-size-sm);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-lighter);
}

.order-info {
  flex: 1;
  color: var(--text-regular);
  font-size: var(--font-size-sm);
  line-height: 1.8;
}

.order-info div {
  margin-bottom: 8px;
}

.order-actions {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.total-amount {
  font-size: var(--font-size-xl);
  font-weight: 700;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.discount-tip {
  color: #67c23a;
  font-size: 13px;
}

.actions :deep(.el-button) {
  border-radius: var(--radius-base);
  font-weight: 500;
  transition: var(--transition-base);
}

.actions :deep(.el-button--primary) {
  background: var(--primary-gradient);
  border: none;
  box-shadow: var(--shadow-sm);
}

.actions :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 响应式 */
@media (max-width: 768px) {
  .order-footer {
    flex-direction: column;
  }
  
  .order-actions {
    width: 100%;
    align-items: stretch;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .actions :deep(.el-button) {
    width: 100%;
  }
}
</style>

