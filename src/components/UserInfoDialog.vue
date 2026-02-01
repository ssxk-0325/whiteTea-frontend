<template>
  <el-dialog
    v-model="visible"
    title="用户信息"
    width="500px"
    @close="handleClose"
  >
    <div v-loading="loading" class="user-info-content">
      <div v-if="userInfo" class="user-detail">
        <div class="user-avatar-section">
          <el-avatar :src="userInfo.avatar || '/default-avatar.png'" :size="100"></el-avatar>
        </div>
        <div class="user-info-section">
          <div class="info-item">
            <span class="label">用户名：</span>
            <span class="value">{{ userInfo.username || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="label">昵称：</span>
            <span class="value">{{ userInfo.nickname || '未设置' }}</span>
          </div>
          <div class="info-item" v-if="userInfo.phone">
            <span class="label">手机号：</span>
            <span class="value">{{ userInfo.phone }}</span>
          </div>
          <div class="info-item" v-if="userInfo.email">
            <span class="label">邮箱：</span>
            <span class="value">{{ userInfo.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册时间：</span>
            <span class="value">{{ formatTime(userInfo.createTime) }}</span>
          </div>
          <div class="info-item" v-if="userInfo.userType !== undefined">
            <span class="label">用户类型：</span>
            <el-tag :type="userInfo.userType === 1 ? 'danger' : 'info'">
              {{ userInfo.userType === 1 ? '管理员' : '普通用户' }}
            </el-tag>
          </div>
        </div>
      </div>
      <el-empty v-else-if="!loading" description="用户信息加载失败"></el-empty>
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'

export default {
  name: 'UserInfoDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    userId: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const visible = ref(false)
    const loading = ref(false)
    const userInfo = ref(null)

    watch(() => props.modelValue, (newVal) => {
      visible.value = newVal
      if (newVal && props.userId) {
        loadUserInfo()
      }
    })

    watch(visible, (newVal) => {
      emit('update:modelValue', newVal)
    })

    const loadUserInfo = async () => {
      if (!props.userId) {
        ElMessage.warning('用户ID不存在')
        return
      }

      loading.value = true
      try {
        const res = await api.user.getUserById(props.userId)
        userInfo.value = res.data
      } catch (error) {
        ElMessage.error(error.message || '获取用户信息失败')
        userInfo.value = null
      } finally {
        loading.value = false
      }
    }

    const formatTime = (time) => {
      if (!time) return '未知'
      const date = new Date(time)
      return date.toLocaleString('zh-CN')
    }

    const handleClose = () => {
      visible.value = false
      userInfo.value = null
    }

    return {
      visible,
      loading,
      userInfo,
      formatTime,
      handleClose
    }
  }
}
</script>

<style scoped>
.user-info-content {
  min-height: 200px;
}

.user-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.user-avatar-section {
  display: flex;
  justify-content: center;
}

.user-info-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: #666;
  min-width: 100px;
}

.value {
  color: #333;
  flex: 1;
}
</style>

