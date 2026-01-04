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
  right: 30px;
  bottom: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
  z-index: 999;
  color: white;
}

.customer-service-float-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.6);
}

.customer-service-float-button:active {
  transform: scale(0.95);
}

.button-text {
  font-size: 10px;
  margin-top: 2px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .customer-service-float-button {
    right: 20px;
    bottom: 20px;
    width: 50px;
    height: 50px;
  }
  
  .button-text {
    font-size: 9px;
  }
}
</style>

