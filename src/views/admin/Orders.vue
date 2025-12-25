<template>
  <div class="admin-orders">
    <h2>订单管理</h2>
    <el-table :data="orders" style="width: 100%">
      <el-table-column prop="orderNo" label="订单号" width="180"></el-table-column>
      <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
      <el-table-column prop="totalAmount" label="订单金额" width="120"></el-table-column>
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
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AdminOrders',
  setup() {
    const orders = ref([])

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

    const viewOrder = (order) => {
      ElMessage.info('查看订单功能待实现')
    }

    const shipOrder = (id) => {
      ElMessage.info('发货功能待实现')
    }

    return {
      orders,
      getStatusText,
      getStatusType,
      viewOrder,
      shipOrder
    }
  }
}
</script>

