<template>
  <div class="admin-users">
    <h2>用户管理</h2>
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索用户名、昵称、手机号或邮箱"
        style="width: 300px; margin-right: 12px;"
        clearable
        @clear="loadUsers"
        @keyup.enter="loadUsers"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="loadUsers" style="display: inline-block;">搜索</el-button>
      <el-button @click="loadUsers" style="display: inline-block;">刷新</el-button>
    </div>
    <el-table :data="users" style="width: 100%" v-loading="loading" class="modern-table">
      <el-table-column prop="username" label="用户名" width="150"></el-table-column>
      <el-table-column prop="nickname" label="昵称" width="150"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
      <el-table-column prop="userType" label="用户类型" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.userType === 1 ? 'danger' : 'primary'">
            {{ scope.row.userType === 1 ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" width="180"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && users.length === 0" description="暂无用户数据"></el-empty>
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadUsers"
      style="margin-top: 20px; text-align: center;"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import api from '@/api'

export default {
  name: 'AdminUsers',
  setup() {
    const users = ref([])
    const loading = ref(false)
    const keyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    const loadUsers = async () => {
      loading.value = true
      try {
        const res = await api.user.admin.getList({
          page: currentPage.value - 1,
          size: pageSize.value,
          keyword: keyword.value || undefined
        })
        users.value = res.data.content || res.data.records || []
        total.value = res.data.totalElements || res.data.total || 0
      } catch (error) {
        ElMessage.error('加载用户列表失败')
        console.error('加载用户列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    const editUser = (user) => {
      ElMessage.info('编辑用户功能待实现')
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      loading,
      keyword,
      currentPage,
      pageSize,
      total,
      loadUsers,
      editUser,
      Search
    }
  }
}
</script>

<style scoped>
.admin-users {
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
  overflow: hidden;
  box-shadow: var(--shadow-base);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.modern-table :deep(.el-table__header) {
  background: var(--primary-gradient);
}

.modern-table :deep(.el-table__header th) {
  background: transparent;
  color: white;
  font-weight: 600;
  border-bottom: none;
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

.modern-table :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

:deep(.el-pagination) {
  margin-top: 32px;
  justify-content: center;
}

:deep(.el-pagination .el-pager li) {
  border-radius: var(--radius-base);
  transition: var(--transition-base);
}

:deep(.el-pagination .el-pager li.is-active) {
  background: var(--primary-gradient);
  color: white;
}
</style>

