<template>
  <div class="register-container">
    <div class="register-background">
      <div class="background-shape shape-1"></div>
      <div class="background-shape shape-2"></div>
      <div class="background-shape shape-3"></div>
    </div>
    <el-card class="register-card">
      <div class="register-layout">
        <div class="register-left">
          <div class="brand">
            <h1 class="logo-text">福鼎白茶</h1>
            <p class="logo-subtitle">服务平台</p>
          </div>
          <div class="slogan">
            <h2 class="slogan-title">创建账号</h2>
            <p class="slogan-subtitle">加入我们，开启白茶之旅</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">产业资讯与福鼎白茶文化一站式浏览</div>
            <div class="feature-item">优选好茶与社区交流更便捷</div>
            <div class="feature-item">订单、活动、积分权益统一管理</div>
          </div>
        </div>
        <div class="register-right">
          <div class="form-header">
            <div class="form-title">账号注册</div>
            <div class="form-desc">请填写用户名、手机号与密码</div>
          </div>
          <el-form :model="registerForm" :rules="rules" ref="registerFormRef" class="register-form">
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                size="large"
                class="modern-input"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号"
                size="large"
                class="modern-input"
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                class="modern-input"
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                @keyup.enter="handleRegister"
                size="large"
                class="modern-input"
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="handleRegister"
                :loading="loading"
                class="register-button"
                size="large"
              >
                {{ loading ? '注册中...' : '注册' }}
              </el-button>
            </el-form-item>
            <el-form-item>
              <div class="login-link">
                <span>已有账号？</span>
                <el-link type="primary" @click="$router.push('/login')" class="login-link-text">立即登录</el-link>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone } from '@element-plus/icons-vue'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const store = useStore()
    const registerFormRef = ref(null)
    const loading = ref(false)

    const registerForm = reactive({
      username: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })

    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
      ]
    }

    const handleRegister = async () => {
      if (!registerFormRef.value) return

      await registerFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            await store.dispatch('user/register', {
              username: registerForm.username,
              password: registerForm.password,
              phone: registerForm.phone
            })
            ElMessage.success('注册成功，请登录')
            router.push('/login')
          } catch (error) {
            ElMessage.error(error.message || '注册失败')
          } finally {
            loading.value = false
          }
        }
      })
    }

    return {
      registerForm,
      rules,
      registerFormRef,
      loading,
      handleRegister,
      User,
      Lock,
      Phone
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: var(--primary-gradient);
  padding: 20px;
}

.register-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.background-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
  animation-delay: 5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 10%;
  animation-delay: 10s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.register-card {
  width: 100%;
  max-width: 980px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.register-card :deep(.el-card__body) {
  padding: 0;
}

.register-layout {
  display: flex;
  min-height: 520px;
}

.register-left {
  flex: 1;
  padding: 56px 52px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.14), rgba(118, 75, 162, 0.14));
  border-right: 1px solid rgba(255, 255, 255, 0.35);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
}

.register-right {
  width: 420px;
  padding: 56px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-text {
  font-size: 36px;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.logo-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  letter-spacing: 4px;
}

.slogan-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}

.slogan-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.feature-list {
  display: grid;
  gap: 10px;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.feature-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.45);
}

.form-header {
  margin-bottom: 22px;
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.form-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.register-form {
  margin-top: 14px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.register-form :deep(.el-form-item__label) {
  display: none;
}

.modern-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 2px solid var(--border-light);
  transition: var(--transition-base);
  padding: 12px 16px;
}

.modern-input :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-base);
}

.modern-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-input :deep(.el-input__inner) {
  font-size: var(--font-size-base);
}

.register-button {
  width: 100%;
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-base);
  height: 50px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
  margin-top: 8px;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.register-button:active {
  transform: translateY(0);
}

.login-link {
  text-align: center;
  width: 100%;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.login-link-text {
  font-weight: 600;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .register-card {
    max-width: 100%;
    margin: 20px;
  }

  .register-layout {
    flex-direction: column;
    min-height: auto;
  }

  .register-left {
    padding: 28px 24px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  }

  .register-right {
    width: 100%;
    padding: 28px 24px;
  }

  .logo-text {
    font-size: 28px;
  }
}
</style>
