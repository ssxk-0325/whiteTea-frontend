<template>
  <div class="admin-orders">
    <h2>订单管理</h2>
    <div class="toolbar">
      <el-button size="default" @click="loadOrders" style="display: inline-block;">刷新</el-button>
    </div>
    <el-table :data="orders" style="width: 100%" v-loading="loading">
      <el-table-column prop="orderNo" label="订单号" width="180"></el-table-column>
      <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
      <el-table-column prop="totalAmount" label="订单金额" width="120">
        <template #default="scope">
          ¥{{ Number(scope.row.totalAmount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="viewOrder(scope.row)">查看</el-button>
          <el-button size="small" type="success" v-if="scope.row.status === 1" @click="shipOrder(scope.row.id)">发货</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && orders.length === 0" description="暂无订单"></el-empty>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

export default {
  name: 'AdminOrders',
  setup() {
    const orders = ref([])
    const loading = ref(false)

    const getStatusText = (status) => {
      const statusMap = {
        0: '待付款',
        1: '待发货',
        2: '待收货',
        3: '已完成',
        4: '已取消'
      }
      return statusMap[status] || '未知'
    }

    const getStatusType = (status) => {
      const typeMap = {
        0: 'warning',
        1: 'info',
        2: 'primary',
        3: 'success',
        4: 'danger'
      }
      return typeMap[status] || 'info'
    }

    const loadOrders = async () => {
      loading.value = true
      try {
        const res = await api.order.admin.getList()
        orders.value = res.data || []
      } catch (error) {
        ElMessage.error('加载订单列表失败')
      } finally {
        loading.value = false
      }
    }

    const viewOrder = (order) => {
      ElMessage.info('查看订单功能待实现')
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

    onMounted(() => {
      loadOrders()
    })

    return {
      orders,
      loading,
      getStatusText,
      getStatusType,
      loadOrders,
      viewOrder,
      shipOrder
    }
  }
}
</script>

<style scoped>
.admin-orders {
  padding: 20px !important;
  background-color: #fff !important;
  min-height: calc(100vh - 60px);
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.toolbar {
  margin-bottom: 20px;
  display: flex !important;
  flex-direction: row !important;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.toolbar .el-button {
  min-width: 100px;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.5;
}
</style>

