<template>
  <div class="orders-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>我的订单</h2>
        <el-tabs v-model="activeTab" @tab-change="loadOrders">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="待付款" name="0"></el-tab-pane>
          <el-tab-pane label="待发货" name="1"></el-tab-pane>
          <el-tab-pane label="待收货" name="2"></el-tab-pane>
          <el-tab-pane label="已完成" name="3"></el-tab-pane>
        </el-tabs>
        <el-empty v-if="!loading && orders.length === 0" description="暂无订单"></el-empty>
        <div v-loading="loading" v-else>
          <el-card v-for="order in orders" :key="order.id" style="margin-bottom: 20px;">
            <div class="order-header">
              <div>
                <span>订单号：{{ order.orderNo }}</span>
                <el-button type="text" @click="viewOrderDetail(order.id)" style="margin-left: 10px;">查看详情</el-button>
              </div>
              <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
            </div>
            <el-divider />
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <img :src="item.productImage || '/default-product.png'" :alt="item.productName" />
                <div class="item-info">
                  <h4>{{ item.productName }}</h4>
                  <p>¥{{ Number(item.price).toFixed(2) }} x {{ item.quantity }}</p>
                </div>
              </div>
            </div>
            <el-divider />
            <div class="order-footer">
              <div class="order-info">
                <div>收货人：{{ order.receiverName }}</div>
                <div>联系电话：{{ order.receiverPhone }}</div>
                <div>收货地址：{{ order.receiverAddress }}</div>
              </div>
              <div class="order-actions">
                <div class="total-amount">总计：¥{{ Number(order.payAmount).toFixed(2) }}</div>
                <div class="actions">
                  <el-button v-if="order.status === 0" type="primary" @click="payOrder(order.id)">去付款</el-button>
                  <el-button v-if="order.status === 0" @click="cancelOrder(order.id)">取消订单</el-button>
                  <el-button v-if="order.status === 2" type="success" @click="confirmReceive(order.id)">确认收货</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'Orders',
  components: {
    Header
  },
  setup() {
    const router = useRouter()
    const activeTab = ref('all')
    const orders = ref([])
    const loading = ref(false)

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

    const payOrder = async (id) => {
      try {
        await ElMessageBox.confirm('确认支付该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 这里简化处理，实际应该跳转到支付页面或调用支付接口
        // 暂时使用模拟支付（payType: 1-微信，2-支付宝，3-银行卡）
        await api.order.pay(id, 1)
        ElMessage.success('支付成功')
        loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '支付失败')
        }
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
      orders,
      loading,
      loadOrders,
      getStatusText,
      getStatusType,
      payOrder,
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
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-status {
  color: #f56c6c;
  font-weight: bold;
}

.order-items {
  margin: 20px 0;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.order-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.item-info h4 {
  margin: 0 0 5px 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.order-info {
  flex: 1;
  color: #666;
  font-size: 14px;
}

.order-info div {
  margin-bottom: 5px;
}

.order-actions {
  text-align: right;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>

