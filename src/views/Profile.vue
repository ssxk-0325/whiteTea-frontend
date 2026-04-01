<template>
  <div class="profile-page">
    <Header />
    <div class="profile-container">
      <!-- 顶部用户信息卡片 -->
      <el-card class="user-header-card" :body-style="{ padding: '0' }">
        <div class="user-header-bg"></div>
        <div class="user-header-content">
          <div class="user-info-main">
            <el-avatar :size="100" :src="userForm.avatar || DEFAULT_USER_AVATAR" class="user-avatar">
              {{ userForm.nickname?.charAt(0) || userForm.username?.charAt(0) }}
            </el-avatar>
            <div class="user-text">
              <h2 class="user-name">{{ userForm.nickname || userForm.username }}</h2>
              <p class="user-username">@{{ userForm.username }}</p>
            </div>
          </div>
          <div class="user-stats">
            <div class="stat-item" @click="$router.push('/rewards')" style="cursor: pointer;">
              <span class="stat-value">{{ userForm.points || 0 }}</span>
              <span class="stat-label">积分</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ favoritePosts.total || 0 }}</span>
              <span class="stat-label">收藏</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ likedPosts.total || 0 }}</span>
              <span class="stat-label">获赞</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ historyList.total || 0 }}</span>
              <span class="stat-label">足迹</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 内容选项卡 -->
      <el-tabs v-model="activeTab" class="profile-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="个人信息" name="info">
          <el-row :gutter="24">
            <!-- 左侧概览 -->
            <el-col :span="8">
              <el-card class="info-overview-card" shadow="never">
                <div class="overview-header">
                  <div class="profile-completeness">
                    <el-progress type="dashboard" :percentage="calculateCompleteness" :color="colors">
                      <template #default="{ percentage }">
                        <span class="percentage-value">{{ percentage }}%</span>
                        <span class="percentage-label">资料完成度</span>
                      </template>
                    </el-progress>
                  </div>
                </div>
                <div class="overview-list">
                  <div class="overview-item">
                    <el-icon><Calendar /></el-icon>
                    <span class="item-label">注册时间</span>
                    <span class="item-value">{{ formatDate(userForm.createTime) || '2024-01-15' }}</span>
                  </div>
                  <div class="overview-item">
                    <el-icon><Lock /></el-icon>
                    <span class="item-label">账号状态</span>
                    <el-tag size="small" type="success">正常</el-tag>
                  </div>
                  <div class="overview-item">
                    <el-icon><Message /></el-icon>
                    <span class="item-label">邮箱验证</span>
                    <el-tag size="small" :type="userForm.email ? 'success' : 'info'">{{ userForm.email ? '已绑定' : '未绑定' }}</el-tag>
                  </div>
                </div>
                <el-divider></el-divider>
                <div class="avatar-edit-section">
                  <el-upload
                    class="avatar-uploader"
                    action="/api/upload/image"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                  >
                    <el-button type="primary" plain size="small" icon="Camera">修改头像</el-button>
                  </el-upload>
                </div>
              </el-card>
            </el-col>

            <!-- 右侧表单 -->
            <el-col :span="16">
              <el-card class="info-card" shadow="never">
                <template #header>
                  <div class="card-header">
                    <span class="header-title"><el-icon><User /></el-icon> 账号设置</span>
                    <span class="header-tip">完善资料可以让更多茶友认识你</span>
                  </div>
                </template>
                <el-form :model="userForm" label-position="top" class="profile-form-modern">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="用户名">
                        <template #label>
                          <span class="custom-label"><el-icon><Monitor /></el-icon> 用户名</span>
                        </template>
                        <el-input v-model="userForm.username" disabled class="modern-input"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="昵称">
                        <template #label>
                          <span class="custom-label"><el-icon><EditPen /></el-icon> 昵称</span>
                        </template>
                        <el-input v-model="userForm.nickname" class="modern-input" placeholder="设置你的昵称"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="手机号">
                        <template #label>
                          <span class="custom-label"><el-icon><Iphone /></el-icon> 手机号</span>
                        </template>
                        <el-input v-model="userForm.phone" class="modern-input" placeholder="绑定手机号"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="邮箱">
                        <template #label>
                          <span class="custom-label"><el-icon><Message /></el-icon> 邮箱</span>
                        </template>
                        <el-input v-model="userForm.email" class="modern-input" placeholder="设置邮箱地址"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-form-item label="个人简介">
                    <template #label>
                      <span class="custom-label"><el-icon><Document /></el-icon> 个人简介</span>
                    </template>
                    <el-input 
                      type="textarea" 
                      v-model="userForm.bio" 
                      :rows="4" 
                      class="modern-input-text" 
                      placeholder="介绍一下你自己，比如：一个热爱福鼎白茶的深度爱好者..."
                      maxlength="200"
                      show-word-limit
                    ></el-input>
                  </el-form-item>

                  <div class="form-actions">
                    <el-button type="primary" @click="updateUser" class="save-button-modern" size="large">
                      <el-icon><Check /></el-icon> 保存更改
                    </el-button>
                  </div>
                </el-form>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="社区收藏" name="favorites">
          <div v-if="favoritePosts.list.length > 0" class="content-grid">
            <el-card v-for="post in favoritePosts.list" :key="post.id" class="content-card" shadow="hover" @click="goToDetail(post.id)">
              <div class="card-image" v-if="post.images">
                <img :src="getFirstImage(post.images)" alt="post image">
              </div>
              <div class="card-body">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-excerpt">{{ post.content?.substring(0, 50) }}...</p>
                <div class="post-meta">
                  <span><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                  <span><el-icon><Star /></el-icon> {{ post.likeCount || 0 }}</span>
                  <span class="post-time">{{ formatDate(post.createTime) }}</span>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无收藏内容"></el-empty>
        </el-tab-pane>

        <el-tab-pane label="商品收藏" name="productFavs">
          <div v-if="productFavorites.list.length > 0" class="content-grid">
            <el-card v-for="p in productFavorites.list" :key="p.id" class="content-card" shadow="hover" @click="goToProduct(p.id)">
              <div class="card-image" v-if="p.image">
                <img :src="p.image" :alt="p.name">
              </div>
              <div class="card-body">
                <h3 class="post-title">{{ p.name }}</h3>
                <p class="post-excerpt price-line">¥{{ Number(p.price).toFixed(2) }}</p>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无收藏商品"></el-empty>
        </el-tab-pane>

        <el-tab-pane label="我的点赞" name="likes">
          <div v-if="likedPosts.list.length > 0" class="content-grid">
            <el-card v-for="post in likedPosts.list" :key="post.id" class="content-card" shadow="hover" @click="goToDetail(post.id)">
              <div class="card-image" v-if="post.images">
                <img :src="getFirstImage(post.images)" alt="post image">
              </div>
              <div class="card-body">
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-excerpt">{{ post.content?.substring(0, 50) }}...</p>
                <div class="post-meta">
                  <span><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
                  <span><el-icon><Star /></el-icon> {{ post.likeCount || 0 }}</span>
                  <span class="post-time">{{ formatDate(post.createTime) }}</span>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="还没有给别人点过赞哦"></el-empty>
        </el-tab-pane>

        <el-tab-pane label="浏览历史" name="history">
          <div v-if="historyList.list.length > 0" class="history-timeline">
            <div class="history-header">
              <el-button type="text" @click="clearHistory" class="clear-btn">
                <el-icon style="vertical-align: middle; margin-right: 4px;"><Delete /></el-icon>
                清空历史
              </el-button>
            </div>
            <div class="history-items">
              <div v-for="item in historyList.list" :key="item.id" class="history-item" @click="goToTarget(item)">
                <div class="history-time">
                  <el-icon style="vertical-align: middle; margin-right: 4px;"><Clock /></el-icon>
                  {{ formatTime(item.updateTime) }}
                </div>
                <div class="history-content">
                  <el-image :src="item.image || DEFAULT_PRODUCT_IMAGE" class="history-img" fit="cover">
                    <template #error><div class="image-slot"><el-icon><View /></el-icon></div></template>
                  </el-image>
                  <div class="history-info">
                    <h4 class="history-title">{{ item.title }}</h4>
                    <span class="history-type" :class="'type-' + item.targetType">
                      <el-icon style="vertical-align: middle; margin-right: 2px;"><Location v-if="item.targetType === 2" /><ChatDotRound v-else-if="item.targetType === 1" /><View v-else /></el-icon>
                      {{ getTypeName(item.targetType) }}
                    </span>
                  </div>
                  <el-button type="text" class="delete-history-btn" @click.stop="deleteHistory(item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无浏览记录"></el-empty>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed as vueComputed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import api from '@/api'
import AppHeader from '@/components/Header.vue'
import { DEFAULT_USER_AVATAR, DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

const { 
  User, 
  View, 
  Star, 
  StarFilled, 
  Clock, 
  Delete, 
  ChatDotRound,
  Location,
  Calendar,
  Lock,
  Monitor,
  EditPen,
  Iphone,
  Check,
  Document,
  Message,
  Camera
} = ElementPlusIconsVue

export default {
  name: 'Profile',
  components: {
    Header: AppHeader,
    User,
    View,
    Star,
    StarFilled,
    Clock,
    Delete,
    ChatDotRound,
    Location,
    Calendar,
    Lock,
    Monitor,
    EditPen,
    Iphone,
    Check,
    Document,
    Message,
    Camera
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const activeTab = ref('info')
    
    const colors = [
      { color: '#f56c6c', percentage: 20 },
      { color: '#e6a23c', percentage: 40 },
      { color: '#5cb87a', percentage: 60 },
      { color: '#1989fa', percentage: 80 },
      { color: '#6f7ad3', percentage: 100 },
    ]
    
    const userForm = ref({
      username: '',
      nickname: '',
      phone: '',
      email: '',
      avatar: '',
      bio: ''
    })

    const favoritePosts = reactive({
      list: [],
      total: 0
    })

    const productFavorites = reactive({
      list: [],
      total: 0
    })

    const likedPosts = reactive({
      list: [],
      total: 0
    })

    const historyList = reactive({
      list: [],
      total: 0
    })

    const calculateCompleteness = vueComputed(() => {
      let count = 0
      const fields = ['nickname', 'phone', 'email', 'avatar', 'bio']
      fields.forEach(field => {
        if (userForm.value[field]) count++
      })
      return Math.round((count / fields.length) * 100)
    })

    const loadUserInfo = async () => {
      try {
        const res = await api.user.getUserInfo()
        Object.assign(userForm.value, res.data)
      } catch (error) {
        ElMessage.error('加载用户信息失败')
      }
    }

    const loadFavorites = async () => {
      try {
        const res = await api.community.getUserFavorites({ page: 0, size: 100 })
        favoritePosts.list = res.data.records
        favoritePosts.total = res.data.total
      } catch (error) {
        console.error('加载收藏失败', error)
      }
    }

    const loadProductFavorites = async () => {
      try {
        const res = await api.product.favorite.list({ page: 1, size: 100 })
        const page = res.data
        productFavorites.list = page.records || []
        productFavorites.total = page.total || 0
      } catch (error) {
        console.error('加载商品收藏失败', error)
      }
    }

    const loadLikes = async () => {
      try {
        const res = await api.community.getUserLikes({ page: 0, size: 100 })
        likedPosts.list = res.data.records
        likedPosts.total = res.data.total
      } catch (error) {
        console.error('加载点赞失败', error)
      }
    }

    const loadHistory = async () => {
      try {
        const res = await api.browseHistory.getList({ page: 0, size: 50 })
        historyList.list = res.data.records
        historyList.total = res.data.total
      } catch (error) {
        console.error('加载历史失败', error)
      }
    }

    const updateUser = async () => {
      try {
        await api.user.updateUser(userForm.value)
        ElMessage.success('更新个人信息成功')
        await store.dispatch('user/getUserInfo')
      } catch (error) {
        ElMessage.error('更新失败')
      }
    }

    const handleTabClick = (tab) => {
      if (tab.props.name === 'favorites') loadFavorites()
      if (tab.props.name === 'productFavs') loadProductFavorites()
      if (tab.props.name === 'likes') loadLikes()
      if (tab.props.name === 'history') loadHistory()
    }

    const getFirstImage = (imagesStr) => {
      if (!imagesStr) return ''
      try {
        const images = JSON.parse(imagesStr)
        return Array.isArray(images) ? images[0] : imagesStr
      } catch (e) {
        return imagesStr.split(',')[0]
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    const formatTime = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    const getTypeName = (type) => {
      const types = { 1: '社区帖子', 2: '茶叶产品', 3: '白茶文化' }
      return types[type] || '其他'
    }

    const goToDetail = (id) => {
      router.push(`/community/post/${id}`)
    }

    const goToProduct = (id) => {
      router.push(`/product/${id}`)
    }

    const goToTarget = (item) => {
      if (item.targetType === 1) {
        router.push(`/community/post/${item.targetId}`)
      } else if (item.targetType === 2) {
        router.push(`/product/${item.targetId}`)
      } else if (item.targetType === 3) {
        // 文化内容需要区分是文章还是视频，这里根据标题或预留逻辑尝试跳转文章
        // 如果后端记录时能区分更好，目前先统一跳转到 article 路由
        router.push(`/culture/article/${item.targetId}`)
      }
    }

    const deleteHistory = async (id) => {
      try {
        await api.browseHistory.delete(id)
        loadHistory()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    }

    const clearHistory = () => {
      ElMessageBox.confirm('确定要清空所有浏览记录吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await api.browseHistory.clear()
          loadHistory()
          ElMessage.success('清空成功')
        } catch (error) {
          ElMessage.error('清空失败')
        }
      })
    }

    const handleAvatarSuccess = async (res) => {
      if (res.code === 200) {
        userForm.value.avatar = res.data
        try {
          await api.user.updateUser(userForm.value)
          ElMessage.success('头像修改成功')
          await store.dispatch('user/getUserInfo')
        } catch (error) {
          ElMessage.error('更新用户信息失败')
        }
      } else {
        ElMessage.error(res.message || '上传失败')
      }
    }

    onMounted(() => {
      loadUserInfo()
      // 预加载数量
      loadFavorites()
      loadProductFavorites()
      loadLikes()
      loadHistory()
    })

    return {
      activeTab,
      DEFAULT_USER_AVATAR,
      DEFAULT_PRODUCT_IMAGE,
      userForm,
      favoritePosts,
      productFavorites,
      likedPosts,
      historyList,
      updateUser,
      handleTabClick,
      getFirstImage,
      formatDate,
      formatTime,
      getTypeName,
      goToDetail,
      goToProduct,
      goToTarget,
      deleteHistory,
      clearHistory,
      calculateCompleteness,
      colors,
      handleAvatarSuccess
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 50px;
}

.profile-container {
  max-width: 1100px;
  margin: 30px auto;
  padding: 0 20px;
}

/* 用户顶部卡片样式 */
.user-header-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.user-header-bg {
  height: 150px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.user-header-content {
  padding: 0 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: -50px;
}

.user-info-main {
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.user-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #f0f2f5;
  color: #409eff;
  font-size: 40px;
}

.user-text .user-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.user-text .user-username {
  margin: 4px 0 0;
  color: #909399;
  font-size: 14px;
}

.user-stats {
  display: flex;
  gap: 40px;
  padding-bottom: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

/* Tabs 样式 */
.profile-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.profile-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.profile-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  height: 50px;
  line-height: 50px;
  font-weight: 600;
}

/* 个人信息卡片迭代样式 */
.info-overview-card {
  border-radius: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 20px;
  height: 100%;
}

.overview-header {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.percentage-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.percentage-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.overview-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.overview-item .el-icon {
  font-size: 18px;
  color: #409eff;
}

.item-label {
  color: #606266;
  flex: 1;
}

.item-value {
  color: #303133;
  font-weight: 500;
}

.avatar-edit-section {
  text-align: center;
  margin-top: 20px;
}

.info-card {
  border-radius: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
}

.header-title {
  font-weight: 700;
  font-size: 18px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-tip {
  font-size: 13px;
  color: #909399;
  margin-left: 12px;
  font-weight: normal;
}

.profile-form-modern {
  padding: 10px 0;
}

.custom-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  font-size: 14px;
}

.custom-label .el-icon {
  color: #409eff;
  font-size: 16px;
}

.modern-input :deep(.el-input__wrapper),
.modern-input-text :deep(.el-textarea__inner) {
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  border-bottom: 2px solid #f0f2f5 !important;
  border-radius: 0 !important;
  padding: 8px 0 !important;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.modern-input :deep(.el-input__inner),
.modern-input-text :deep(.el-textarea__inner) {
  color: #303133;
  font-size: 15px;
  font-weight: 500;
}

.modern-input :deep(.el-input__inner::placeholder) {
  color: #c0c4cc;
  font-weight: normal;
}

.modern-input :deep(.el-input__wrapper:hover),
.modern-input-text :deep(.el-textarea__inner:hover) {
  border-bottom-color: #c0c4cc !important;
}

.modern-input :deep(.el-input__wrapper.is-focus),
.modern-input-text :deep(.el-textarea__inner:focus) {
  border-bottom-color: #409eff !important;
  transform: translateY(-1px);
}

/* 禁用状态样式 */
.modern-input.is-disabled :deep(.el-input__wrapper) {
  border-bottom-style: dashed !important;
  background-color: transparent !important;
}

.modern-input.is-disabled :deep(.el-input__inner) {
  color: #909399;
  cursor: not-allowed;
}

.form-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center; /* 按钮居中，更显大气 */
}

.save-button-modern {
  padding: 12px 60px;
  border-radius: 25px; /* 胶囊型按钮 */
  font-weight: 700;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.save-button-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 内容网格布局 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.content-card {
  border-radius: 12px;
  overflow: hidden;
  border: none;
  cursor: pointer;
  transition: transform 0.3s;
}

.content-card:hover {
  transform: translateY(-5px);
}

.card-image {
  height: 160px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  padding: 16px;
}

.post-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.post-excerpt {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.post-time {
  margin-left: auto;
}

/* 历史记录样式 */
.history-timeline {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
}

.history-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #f9fafc;
}

.history-time {
  width: 60px;
  font-size: 14px;
  font-weight: 600;
  color: #909399;
}

.history-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  padding: 12px;
  border-radius: 12px;
  position: relative;
}

.history-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
}

.history-info {
  flex: 1;
}

.history-title {
  margin: 0 0 6px;
  font-size: 15px;
  color: #303133;
}

.history-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.type-1 { background: #ecf5ff; color: #409eff; }
.type-2 { background: #f0f9eb; color: #67c23a; }
.type-3 { background: #fdf6ec; color: #e6a23c; }

.delete-history-btn {
  position: absolute;
  right: 12px;
  color: #f56c6c;
  opacity: 0;
  transition: opacity 0.2s;
}

.history-item:hover .delete-history-btn {
  opacity: 1;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .user-header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -60px;
  }
  
  .user-info-main {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .user-stats {
    margin-top: 20px;
    width: 100%;
    justify-content: space-around;
  }
  
  .content-grid {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
}
</style>

