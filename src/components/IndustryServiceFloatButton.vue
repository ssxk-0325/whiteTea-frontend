<template>
  <div
    v-if="showFloat"
    class="industry-service-float-button"
    @click="goIndustry"
  >
    <el-icon :size="22"><Crop /></el-icon>
    <span class="button-text">产业服务</span>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Crop } from '@element-plus/icons-vue'

export default {
  name: 'IndustryServiceFloatButton',
  components: {
    Crop
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const showFloat = computed(
      () => !route.path.startsWith('/admin') && route.path !== '/services/industry'
    )

    const goIndustry = () => {
      router.push('/services/industry')
    }

    return {
      showFloat,
      goIndustry
    }
  }
}
</script>

<style scoped>
.industry-service-float-button {
  position: fixed;
  right: 32px;
  bottom: 112px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 55%, #40916c 100%);
  border-radius: var(--radius-full, 50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-xl, 0 8px 24px rgba(0, 0, 0, 0.15));
  transition: var(--transition-base, 0.2s ease);
  z-index: 999;
  color: #fff;
  border: 3px solid rgba(255, 255, 255, 0.25);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.industry-service-float-button:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 28px rgba(27, 67, 50, 0.45);
  border-color: rgba(255, 255, 255, 0.45);
}

.industry-service-float-button:active {
  transform: translateY(-2px) scale(1.02);
}

.industry-service-float-button :deep(.el-icon) {
  font-size: 26px;
  margin-bottom: 2px;
}

.button-text {
  font-size: 11px;
  margin-top: 2px;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1.1;
  text-align: center;
  max-width: 52px;
}

@media (max-width: 768px) {
  .industry-service-float-button {
    right: 20px;
    bottom: 104px;
    width: 56px;
    height: 56px;
  }

  .industry-service-float-button :deep(.el-icon) {
    font-size: 22px;
  }

  .button-text {
    font-size: 9px;
    max-width: 48px;
  }
}
</style>
