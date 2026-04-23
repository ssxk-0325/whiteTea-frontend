<template>
  <div class="login-container">
    <div class="login-background">
      <div class="background-shape shape-1"></div>
      <div class="background-shape shape-2"></div>
      <div class="background-shape shape-3"></div>
    </div>
    <el-card class="login-card">
      <div class="login-layout">
        <div class="login-left">
          <div class="brand">
            <h1 class="logo-text">福鼎白茶</h1>
            <p class="logo-subtitle">服务平台</p>
          </div>
          <div class="slogan">
            <h2 class="slogan-title">欢迎回来</h2>
            <p class="slogan-subtitle">登录您的账号以继续</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">产业资讯与福鼎白茶文化一站式浏览</div>
            <div class="feature-item">优选好茶与社区交流更便捷</div>
            <div class="feature-item">订单、活动、积分权益统一管理</div>
          </div>
        </div>
        <div class="login-right">
          <div class="form-header">
            <div class="form-title">账号登录</div>
            <div class="form-desc">请输入账号密码与验证码</div>
          </div>
          <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
            <div class="form-field">
              <div class="field-title"><span class="field-required">*</span>账号</div>
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入账号"
                  size="large"
                  class="flat-input"
                />
              </el-form-item>
            </div>

            <div class="form-field">
              <div class="field-title field-title-row">
                <span><span class="field-required">*</span>密码</span>
                <el-link type="primary" class="forgot-link" @click="openForgotDialog">忘记密码?</el-link>
              </div>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  @keyup.enter="handleLogin"
                  size="large"
                  class="flat-input"
                  show-password
                />
              </el-form-item>
            </div>

            <div class="form-field">
              <div class="field-title"><span class="field-required">*</span>验证码</div>
              <el-form-item prop="captchaCode">
                <div class="captcha-row">
                  <el-input
                    v-model="loginForm.captchaCode"
                    placeholder="请输入验证码"
                    size="large"
                    class="flat-input captcha-input"
                    @keyup.enter="handleLogin"
                  />
                  <div class="captcha-image" @click="refreshCaptcha" :title="'点击刷新验证码'">
                    <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
                    <div v-else class="captcha-loading">加载中...</div>
                  </div>
                </div>
              </el-form-item>
            </div>

            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleLogin" 
                :loading="loading" 
                class="login-button"
                size="large"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
            <el-form-item>
              <div class="register-link">
                <span>还没有账号？</span>
                <el-link type="primary" @click="$router.push('/register')" class="register-link-text">立即注册</el-link>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="forgotDialogVisible"
      title="找回密码"
      width="460px"
      :close-on-click-modal="false"
      @closed="resetForgotForm"
    >
      <el-form :model="forgotForm" :rules="forgotRules" ref="forgotFormRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="forgotForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="forgotForm.phone" placeholder="请输入注册手机号" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="forgotForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="forgotForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
            @keyup.enter="submitForgotPassword"
          />
        </el-form-item>
        <el-form-item label="验证码" prop="captchaCode">
          <div class="captcha-row">
            <el-input
              v-model="forgotForm.captchaCode"
              placeholder="请输入验证码"
              class="captcha-input"
              @keyup.enter="submitForgotPassword"
            />
            <div class="captcha-image" @click="refreshForgotCaptcha" :title="'点击刷新验证码'">
              <img v-if="forgotCaptchaImage" :src="forgotCaptchaImage" alt="验证码" />
              <div v-else class="captcha-loading">加载中...</div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="forgotDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="forgotLoading" @click="submitForgotPassword">重置密码</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '@/api'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const loginFormRef = ref(null)
    const forgotFormRef = ref(null)
    const loading = ref(false)
    const forgotLoading = ref(false)
    const forgotDialogVisible = ref(false)
    const captchaId = ref('')
    const captchaImage = ref('')
    const forgotCaptchaId = ref('')
    const forgotCaptchaImage = ref('')

    const loginForm = reactive({
      username: '',
      password: '',
      captchaCode: ''
    })

    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ],
      captchaCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { min: 4, max: 8, message: '验证码长度不正确', trigger: 'blur' }
      ]
    }

    const forgotForm = reactive({
      username: '',
      phone: '',
      newPassword: '',
      confirmPassword: '',
      captchaCode: ''
    })

    const validateForgotConfirm = (rule, value, callback) => {
      if (value !== forgotForm.newPassword) {
        callback(new Error('两次输入的新密码不一致'))
        return
      }
      callback()
    }

    const forgotRules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { validator: validateForgotConfirm, trigger: 'blur' }
      ],
      captchaCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { min: 4, max: 8, message: '验证码长度不正确', trigger: 'blur' }
      ]
    }

    const refreshCaptcha = async () => {
      try {
        const res = await api.captcha.get()
        captchaId.value = res.data.captchaId
        captchaImage.value = res.data.imageBase64
      } catch (e) {
        captchaId.value = ''
        captchaImage.value = ''
      }
    }

    const handleLogin = async () => {
      if (!loginFormRef.value) return
      
      await loginFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            await store.dispatch('user/login', {
              username: loginForm.username,
              password: loginForm.password,
              captchaId: captchaId.value,
              captchaCode: loginForm.captchaCode
            })
            ElMessage.success('登录成功')
            const redirect = route.query.redirect || '/'
            router.push(redirect)
          } catch (error) {
            ElMessage.error(error.message || '登录失败')
            await refreshCaptcha()
            loginForm.captchaCode = ''
          } finally {
            loading.value = false
          }
        }
      })
    }

    const refreshForgotCaptcha = async () => {
      try {
        const res = await api.captcha.get()
        forgotCaptchaId.value = res.data.captchaId
        forgotCaptchaImage.value = res.data.imageBase64
      } catch (e) {
        forgotCaptchaId.value = ''
        forgotCaptchaImage.value = ''
      }
    }

    const openForgotDialog = async () => {
      forgotDialogVisible.value = true
      await refreshForgotCaptcha()
    }

    const resetForgotForm = () => {
      forgotForm.username = ''
      forgotForm.phone = ''
      forgotForm.newPassword = ''
      forgotForm.confirmPassword = ''
      forgotForm.captchaCode = ''
      forgotCaptchaId.value = ''
      forgotCaptchaImage.value = ''
      forgotFormRef.value?.clearValidate()
    }

    const submitForgotPassword = async () => {
      if (!forgotFormRef.value || forgotLoading.value) return
      await forgotFormRef.value.validate(async (valid) => {
        if (!valid) return
        forgotLoading.value = true
        try {
          await api.user.forgotPassword(
            forgotForm.username,
            forgotForm.phone,
            forgotForm.newPassword,
            forgotCaptchaId.value,
            forgotForm.captchaCode
          )
          ElMessage.success('密码已重置，请使用新密码登录')
          forgotDialogVisible.value = false
          await refreshCaptcha()
          loginForm.captchaCode = ''
        } catch (error) {
          ElMessage.error(error.message || '重置失败')
          await refreshForgotCaptcha()
          forgotForm.captchaCode = ''
        } finally {
          forgotLoading.value = false
        }
      })
    }

    onMounted(() => {
      refreshCaptcha()
    })

    return {
      loginForm,
      rules,
      forgotForm,
      forgotRules,
      loginFormRef,
      forgotFormRef,
      loading,
      forgotLoading,
      forgotDialogVisible,
      handleLogin,
      refreshCaptcha,
      captchaImage,
      forgotCaptchaImage,
      openForgotDialog,
      refreshForgotCaptcha,
      submitForgotPassword,
      resetForgotForm
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: var(--primary-gradient);
  padding: 20px;
}

.login-background {
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
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.login-card {
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

.login-card :deep(.el-card__body) {
  padding: 0;
}

.login-layout {
  display: flex;
  min-height: 520px;
}

.login-left {
  flex: 1;
  padding: 56px 52px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.14), rgba(118, 75, 162, 0.14));
  border-right: 1px solid rgba(255, 255, 255, 0.35);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
}

.login-right {
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

.login-form {
  margin-top: 14px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.form-field {
  margin-bottom: 18px;
}

.field-title {
  color: #606266;
  font-size: 20px;
  margin: 0 0 10px 2px;
}

.field-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-required {
  color: #e14d63;
  margin-right: 4px;
}

.flat-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 1px solid #ebeef5;
  box-shadow: none;
  background: #f7f8fb;
  min-height: 48px;
  padding: 0 14px;
}

.flat-input :deep(.el-input__wrapper.is-focus) {
  border-color: #b8bfff;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.12);
}

.flat-input :deep(.el-input__inner) {
  font-size: 17px;
}

.login-button {
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

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.login-button:active {
  transform: translateY(0);
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #ebeef5;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  display: block;
}

.captcha-loading {
  color: var(--text-secondary);
  font-size: 12px;
}

.register-link {
  text-align: center;
  width: 100%;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.forgot-link {
  font-size: 14px;
}

.register-link-text {
  font-weight: 600;
  margin-left: 4px;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-card {
    max-width: 100%;
    margin: 20px;
  }
  
  .login-card :deep(.el-card__body) {
    padding: 24px;
  }
  
  .login-layout {
    flex-direction: column;
    min-height: auto;
  }

  .login-left {
    padding: 28px 24px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  }

  .login-right {
    width: 100%;
    padding: 28px 24px;
  }

  .logo-text {
    font-size: 28px;
  }
}
</style>

