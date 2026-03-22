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
              <p><strong>配送方式：</strong>{{ order.deliveryType === 2 ? '线下自提' : '线上配送' }}</p>
              <p><strong>{{ order.deliveryType === 2 ? '取货人' : '收货人' }}：</strong>{{ order.receiverName }}</p>
              <p><strong>联系电话：</strong>{{ order.receiverPhone }}</p>
              <p><strong>{{ order.deliveryType === 2 ? '自提门店/地址' : '收货地址' }}：</strong>{{ order.receiverAddress }}</p>
            </div>

            <el-divider />

            <h3>订单信息</h3>
            <div class="order-info">
              <p><strong>订单金额：</strong>¥{{ Number(order.totalAmount).toFixed(2) }}</p>
              <p><strong>实付金额：</strong>¥{{ Number(order.payAmount).toFixed(2) }}</p>
              <p><strong>支付方式：</strong>{{ getPayTypeText(order.payType) }}</p>
              <p><strong>创建时间：</strong>{{ formatTime(order.createTime) }}</p>
              <p v-if="order.payTime"><strong>支付时间：</strong>{{ formatTime(order.payTime) }}</p>
              <p v-if="order.shipTime"><strong>发货时间：</strong>{{ formatTime(order.shipTime) }}</p>
              <p v-if="order.completeTime"><strong>完成时间：</strong>{{ formatTime(order.completeTime) }}</p>
              <p v-if="order.remark"><strong>备注：</strong>{{ order.remark }}</p>
            </div>

            <el-divider />

            <div class="order-actions" v-if="order.status === 0 || order.status === 2">
              <el-button v-if="order.status === 0" type="primary" @click="payOrder">去付款</el-button>
              <el-button v-if="order.status === 0" @click="cancelOrder">取消订单</el-button>
              <el-button v-if="order.status === 2" type="success" @click="confirmReceive">确认收货</el-button>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'OrderDetail',
  components: {
    Header
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const order = ref(null)
    const orderItems = ref([])

    const loadOrderDetail = async () => {
      loading.value = true
      try {
        const res = await api.order.getById(route.params.id)
        order.value = res.data.order
        orderItems.value = res.data.items
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

    const payOrder = async () => {
      try {
        await ElMessageBox.confirm('确认支付该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.order.pay(order.value.id, 1)
        ElMessage.success('支付成功')
        loadOrderDetail()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '支付失败')
        }
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

    onMounted(() => {
      loadOrderDetail()
    })

    return {
      loading,
      DEFAULT_PRODUCT_IMAGE,
      order,
      orderItems,
      getStatusText,
      getStatusType,
      getPayTypeText,
      formatTime,
      payOrder,
      confirmReceive,
      cancelOrder
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

.order-actions {
  text-align: right;
  margin-top: 20px;
}

.order-actions .el-button {
  margin-left: 10px;
}
</style>

