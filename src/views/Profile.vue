<template>
  <div class="profile-page">
    <Header />
    <div class="profile-container">
      <!-- 顶部用户信息卡片 -->
      <el-card class="user-header-card" :body-style="{ padding: '0' }">
        <div class="user-header-bg"></div>
        <div class="user-header-content">
          <div class="user-info-main">
            <el-avatar :size="100" :src="userForm.avatar" class="user-avatar">
              {{ userForm.nickname?.charAt(0) || userForm.username?.charAt(0) }}
            </el-avatar>
            <div class="user-text">
              <h2 class="user-name">{{ userForm.nickname || userForm.username }}</h2>
              <p class="user-username">@{{ userForm.username }}</p>
            </div>
          </div>
          <div class="user-stats">
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
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span class="header-title"><el-icon><User /></el-icon> 基本资料</span>
              </div>
            </template>
            <el-form :model="userForm" label-width="100px" class="profile-form">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名">
                    <el-input v-model="userForm.username" disabled class="modern-input"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="昵称">
                    <el-input v-model="userForm.nickname" class="modern-input" placeholder="设置你的昵称"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="手机号">
                    <el-input v-model="userForm.phone" class="modern-input" placeholder="绑定手机号"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮箱">
                    <el-input v-model="userForm.email" class="modern-input" placeholder="设置邮箱地址"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="个人简介">
                <el-input type="textarea" v-model="userForm.bio" :rows="3" class="modern-input" placeholder="介绍一下你自己..."></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateUser" class="save-button">保存所有修改</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="我的收藏" name="favorites">
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
                  <el-image :src="item.image" class="history-img" fit="cover" v-if="item.image">
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
import { ref, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  View, 
  Star, 
  StarFilled, 
  Clock, 
  Delete, 
  ChatDotRound,
  Location
} from '@element-plus/icons-vue'
import api from '@/api'
import AppHeader from '@/components/Header.vue'

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
    Location
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const activeTab = ref('info')
    
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

    const likedPosts = reactive({
      list: [],
      total: 0
    })

    const historyList = reactive({
      list: [],
      total: 0
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
      router.push(`/post/${id}`)
    }

    const goToTarget = (item) => {
      if (item.targetType === 1) router.push(`/post/${item.targetId}`)
      else if (item.targetType === 2) router.push(`/product/${item.targetId}`)
      else if (item.targetType === 3) router.push(`/culture/${item.targetId}`)
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

    onMounted(() => {
      loadUserInfo()
      // 预加载数量
      loadFavorites()
      loadLikes()
      loadHistory()
    })

    return {
      activeTab,
      userForm,
      favoritePosts,
      likedPosts,
      historyList,
      updateUser,
      handleTabClick,
      getFirstImage,
      formatDate,
      formatTime,
      getTypeName,
      goToDetail,
      goToTarget,
      deleteHistory,
      clearHistory
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

/* 个人信息卡片 */
.info-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  align-items: center;
}

.header-title {
  font-weight: 700;
  font-size: 18px;
  color: #303133;
}

.modern-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid #dcdfe6;
  padding: 5px 12px;
}

.save-button {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 10px;
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

