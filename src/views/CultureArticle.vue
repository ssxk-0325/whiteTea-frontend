<template>
  <div class="article-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <el-button @click="$router.back()" style="margin-bottom: 20px;">返回</el-button>
        <el-card v-loading="loading">
          <div v-if="article">
            <div class="article-header">
              <h1>{{ article.title }}</h1>
              <div class="article-meta">
                <el-tag :type="getTypeTag(article.type)">{{ getTypeText(article.type) }}</el-tag>
                <span class="meta-item">
                  <el-icon><View /></el-icon> {{ article.viewCount }} 浏览
                </span>
                <span class="meta-item">
                  <el-icon><Star /></el-icon> {{ article.likeCount }} 点赞
                </span>
                <span class="meta-item">{{ formatTime(article.createTime) }}</span>
              </div>
            </div>
            <el-divider />
            <div v-if="article.coverImage" class="article-cover">
              <el-image :src="article.coverImage" fit="cover" style="width: 100%; max-height: 400px;"></el-image>
            </div>
            <div class="article-content" v-html="article.content"></div>
            <el-divider />
            <div class="article-actions">
              <el-button
                :type="isLiked ? 'primary' : 'default'"
                @click="handleLike"
              >
                <el-icon><component :is="isLiked ? 'StarFilled' : 'Star'" /></el-icon>
                {{ isLiked ? '已点赞' : '点赞' }} ({{ article.likeCount }})
              </el-button>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { View, Star, StarFilled } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'CultureArticle',
  components: {
    Header,
    View,
    Star,
    StarFilled
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const article = ref(null)
    const isLiked = ref(false)

    const loadArticle = async () => {
      loading.value = true
      try {
        const res = await api.culture.getById(route.params.id)
        article.value = res.data
        
        // 记录浏览历史
        if (store.state.user.token) {
          api.browseHistory.record({
            targetType: 3,
            targetId: article.value.id,
            title: article.value.title,
            image: article.value.coverImage
          }).catch(err => console.error('记录历史失败', err))
        }
      } catch (error) {
        ElMessage.error('加载文章失败')
        router.push('/culture')
      } finally {
        loading.value = false
      }
    }

    const handleLike = async () => {
      try {
        if (isLiked.value) {
          await api.culture.unlike(route.params.id)
          isLiked.value = false
          article.value.likeCount--
          ElMessage.success('取消点赞成功')
        } else {
          await api.culture.like(route.params.id)
          isLiked.value = true
          article.value.likeCount++
          ElMessage.success('点赞成功')
        }
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    const formatTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleDateString('zh-CN')
    }

    const getTypeText = (type) => {
      const typeMap = {
        1: '白茶知识',
        2: '制作工艺',
        3: '品鉴技巧',
        4: '历史文化'
      }
      return typeMap[type] || '未知'
    }

    const getTypeTag = (type) => {
      const tagMap = {
        1: 'success',
        2: 'warning',
        3: 'info',
        4: 'danger'
      }
      return tagMap[type] || 'info'
    }

    onMounted(() => {
      loadArticle()
    })

    return {
      loading,
      article,
      isLiked,
      handleLike,
      formatTime,
      getTypeText,
      getTypeTag
    }
  }
}
</script>

<style scoped>
.article-page {
  min-height: 100vh;
}

.article-header {
  margin-bottom: 20px;
}

.article-header h1 {
  margin: 0 0 15px 0;
  font-size: 28px;
  font-weight: bold;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #999;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.article-cover {
  margin: 20px 0;
}

.article-content {
  line-height: 1.8;
  color: #333;
  font-size: 16px;
  margin: 20px 0;
}

.article-content :deep(p) {
  margin-bottom: 15px;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 15px 0;
}

.article-actions {
  text-align: center;
  padding-top: 20px;
}
</style>

