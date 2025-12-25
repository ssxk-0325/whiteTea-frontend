<template>
  <div class="profile-page">
    <Header />
    <el-container>
      <el-main style="max-width: 800px; margin: 0 auto;">
        <h2>个人中心</h2>
        <el-card>
          <el-form :model="userForm" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="userForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="userForm.nickname"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userForm.phone"></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userForm.email"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateUser">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
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
}
</style>

