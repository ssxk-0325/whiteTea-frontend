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
        <el-empty v-if="orders.length === 0" description="暂无订单"></el-empty>
        <div v-else>
          <el-card v-for="order in orders" :key="order.id" style="margin-bottom: 20px;">
            <div class="order-header">
              <span>订单号：{{ order.orderNo }}</span>
              <span class="order-status">{{ getStatusText(order.status) }}</span>
            </div>
            <el-divider />
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <img :src="item.productImage || '/default-product.png'" :alt="item.productName" />
                <div class="item-info">
                  <h4>{{ item.productName }}</h4>
                  <p>¥{{ item.price }} x {{ item.quantity }}</p>
                </div>
              </div>
            </div>
            <el-divider />
            <div class="order-footer">
              <span class="total-amount">总计：¥{{ order.payAmount }}</span>
              <div class="actions">
                <el-button v-if="order.status === 0" type="primary" @click="payOrder(order.id)">去付款</el-button>
                <el-button v-if="order.status === 2" type="success" @click="confirmReceive(order.id)">确认收货</el-button>
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
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'

export default {
  name: 'Orders',
  components: {
    Header
  },
  setup() {
    const activeTab = ref('all')
    const orders = ref([])

    const loadOrders = () => {
      // TODO: 实现订单加载逻辑
      orders.value = []
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

    const payOrder = (id) => {
      ElMessage.info('支付功能待实现')
    }

    const confirmReceive = (id) => {
      ElMessage.info('确认收货功能待实现')
    }

    onMounted(() => {
      loadOrders()
    })

    return {
      activeTab,
      orders,
      loadOrders,
      getStatusText,
      payOrder,
      confirmReceive
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
  align-items: center;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}
</style>

