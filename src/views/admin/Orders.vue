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
  padding: 32px !important;
  background: transparent !important;
  min-height: calc(100vh - 72px);
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

h2 {
  margin-bottom: 32px;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.5;
}

.toolbar {
  margin-bottom: 24px;
  display: flex !important;
  flex-direction: row !important;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.toolbar .el-button {
  min-width: 100px;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
  border-radius: var(--radius-base);
  font-weight: 500;
  transition: var(--transition-base);
}

.toolbar .el-button--primary {
  background: var(--primary-gradient);
  border: none;
  box-shadow: var(--shadow-sm);
}

.toolbar .el-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.modern-table {
  border-radius: var(--radius-lg);
  overflow: visible;
  box-shadow: var(--shadow-base);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.modern-table :deep(.el-table__inner-wrapper) {
  overflow: visible;
}

.modern-table :deep(.el-table__header-wrapper) {
  overflow: visible;
}

.modern-table :deep(.el-table__header) {
  background: var(--primary-gradient);
  display: table-header-group;
}

.modern-table :deep(.el-table__header th) {
  background: transparent !important;
  color: white !important;
  font-weight: 600;
  border-bottom: none;
  padding: 16px 12px;
  text-align: center;
}

.modern-table :deep(.el-table__header th .cell) {
  color: white !important;
  font-weight: 600;
}

.modern-table :deep(.el-table__header th.is-leaf) {
  color: white !important;
}

.modern-table :deep(.el-table__header th .cell *) {
  color: white !important;
}

.modern-table :deep(.el-table__body tr) {
  transition: var(--transition-base);
}

.modern-table :deep(.el-table__body tr:hover) {
  background: rgba(102, 126, 234, 0.05);
}

.modern-table :deep(.el-table__row) {
  border-bottom: 1px solid var(--border-lighter);
}

.modern-table :deep(.el-tag) {
  border-radius: var(--radius-full);
  font-weight: 500;
  padding: 4px 12px;
}

.modern-table :deep(.el-button) {
  border-radius: var(--radius-base);
  font-weight: 500;
  transition: var(--transition-base);
}

.modern-table :deep(.el-button--success) {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  border: none;
  box-shadow: var(--shadow-sm);
}

.modern-table :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>

