<template>
  <div class="profile-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1000px; margin: 0 auto; padding: 40px 32px;">
        <div class="page-header">
          <h2 class="page-title">个人中心</h2>
        </div>
        <el-row :gutter="32">
          <el-col :span="8">
            <el-card class="profile-card">
              <div class="avatar-section">
                <el-avatar :size="120" :src="userForm.avatar" class="user-avatar">
                  {{ userForm.nickname?.charAt(0) || userForm.username?.charAt(0) }}
                </el-avatar>
                <h3 class="user-name">{{ userForm.nickname || userForm.username }}</h3>
                <p class="user-username">@{{ userForm.username }}</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="16">
            <el-card class="info-card">
              <template #header>
                <div class="card-header-title">个人信息</div>
              </template>
              <el-form :model="userForm" label-width="100px" class="profile-form">
                <el-form-item label="用户名">
                  <el-input v-model="userForm.username" disabled class="modern-input"></el-input>
                </el-form-item>
                <el-form-item label="昵称">
                  <el-input v-model="userForm.nickname" class="modern-input"></el-input>
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="userForm.phone" class="modern-input"></el-input>
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="userForm.email" class="modern-input"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="updateUser" class="save-button" size="large">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'Profile',
  components: {
    Header
  },
  setup() {
    const store = useStore()
    const userForm = ref({
      username: '',
      nickname: '',
      phone: '',
      email: ''
    })

    const loadUserInfo = async () => {
      try {
        const res = await api.user.getUserInfo()
        Object.assign(userForm.value, res.data)
      } catch (error) {
        ElMessage.error('加载用户信息失败')
      }
    }

    const updateUser = async () => {
      try {
        await api.user.updateUser(userForm.value)
        ElMessage.success('更新成功')
        await store.dispatch('user/getUserInfo')
      } catch (error) {
        ElMessage.error('更新失败')
      }
    }

    onMounted(() => {
      loadUserInfo()
    })

    return {
      userForm,
      updateUser
    }
  }
}
</script>

<style scoped>
.profile-page {
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

.profile-card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  text-align: center;
  position: sticky;
  top: 100px;
}

.profile-card :deep(.el-card__body) {
  padding: 40px 24px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  border: 4px solid var(--primary-color);
  box-shadow: var(--shadow-lg);
  transition: var(--transition-base);
}

.user-avatar:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-xl);
}

.user-name {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.user-username {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.info-card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.info-card :deep(.el-card__header) {
  padding: 24px 32px;
  background: var(--primary-gradient);
  border-bottom: none;
}

.card-header-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: white;
}

.info-card :deep(.el-card__body) {
  padding: 32px;
}

.profile-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-regular);
}

.modern-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
  border: 2px solid var(--border-light);
  transition: var(--transition-base);
}

.modern-input :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-base);
}

.modern-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.save-button {
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-weight: 600;
  padding: 12px 32px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 响应式 */
@media (max-width: 768px) {
  .profile-card {
    position: static;
    margin-bottom: 24px;
  }
}
</style>

