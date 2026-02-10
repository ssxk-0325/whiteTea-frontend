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
    <el-table :data="users" style="width: 100%" v-loading="loading">
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

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户"
      width="600px"
      @close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="editForm.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="editForm.birthday"
            type="date"
            placeholder="选择生日"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-radio-group v-model="editForm.userType">
            <el-radio :label="0">普通用户</el-radio>
            <el-radio :label="1">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
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
    const editDialogVisible = ref(false)
    const editFormRef = ref(null)
    const saving = ref(false)
    
    const editForm = reactive({
      id: null,
      username: '',
      nickname: '',
      phone: '',
      email: '',
      gender: 0,
      birthday: null,
      userType: 0,
      status: 1,
      bio: ''
    })

    const editFormRules = {
      nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' }
      ],
      phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
      email: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ]
    }

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
      // 填充表单数据
      editForm.id = user.id
      editForm.username = user.username || ''
      editForm.nickname = user.nickname || ''
      editForm.phone = user.phone || ''
      editForm.email = user.email || ''
      editForm.gender = user.gender !== undefined ? user.gender : 0
      editForm.birthday = user.birthday || null
      editForm.userType = user.userType !== undefined ? user.userType : 0
      editForm.status = user.status !== undefined ? user.status : 1
      editForm.bio = user.bio || ''
      
      editDialogVisible.value = true
    }

    const handleEditDialogClose = () => {
      editFormRef.value?.resetFields()
      Object.assign(editForm, {
        id: null,
        username: '',
        nickname: '',
        phone: '',
        email: '',
        gender: 0,
        birthday: null,
        userType: 0,
        status: 1,
        bio: ''
      })
    }

    const handleSaveUser = async () => {
      if (!editFormRef.value) return
      
      try {
        await editFormRef.value.validate()
        saving.value = true
        
        const updateData = {
          id: editForm.id,
          nickname: editForm.nickname,
          phone: editForm.phone || null,
          email: editForm.email || null,
          gender: editForm.gender,
          birthday: editForm.birthday || null,
          userType: editForm.userType,
          status: editForm.status,
          bio: editForm.bio || null
        }
        
        await api.user.admin.update(updateData)
        ElMessage.success('更新成功')
        editDialogVisible.value = false
        loadUsers() // 刷新列表
      } catch (error) {
        if (error.message && !error.message.includes('validate')) {
          ElMessage.error(error.message || '更新失败')
        }
        console.error('更新用户失败:', error)
      } finally {
        saving.value = false
      }
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
      Search,
      editDialogVisible,
      editForm,
      editFormRef,
      editFormRules,
      saving,
      handleEditDialogClose,
      handleSaveUser
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

