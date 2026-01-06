<template>
  <div 
    class="customer-service-float-button" 
    @click="handleClick"
    v-if="isLoggedIn"
  >
    <el-icon :size="24"><Service /></el-icon>
    <span class="button-text">智能客服</span>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Service } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'CustomerServiceFloatButton',
  components: {
    Service
  },
  setup() {
    const router = useRouter()
    const store = useStore()

    const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])

    const handleClick = () => {
      if (!isLoggedIn.value) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      router.push('/customer-service')
    }

    return {
      isLoggedIn,
      handleClick,
      Service
    }
  }
}
</script>

<style scoped>
.customer-service-float-button {
  position: fixed;
  right: 32px;
  bottom: 32px;
  width: 64px;
  height: 64px;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-xl);
  transition: var(--transition-base);
  z-index: var(--z-fixed);
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.customer-service-float-button:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
  border-color: rgba(255, 255, 255, 0.5);
}

.customer-service-float-button:active {
  transform: translateY(-2px) scale(1.02);
}

.customer-service-float-button :deep(.el-icon) {
  font-size: 28px;
  margin-bottom: 2px;
}

.button-text {
  font-size: 11px;
  margin-top: 2px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .customer-service-float-button {
    right: 20px;
    bottom: 20px;
    width: 56px;
    height: 56px;
  }
  
  .customer-service-float-button :deep(.el-icon) {
    font-size: 24px;
  }
  
  .button-text {
    font-size: 9px;
  }
}
</style>

