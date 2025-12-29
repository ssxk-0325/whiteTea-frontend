<template>
  <div class="culture-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>白茶文化科普中心</h2>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="filterContentType" @change="loadContents">
            <el-radio-button :label="null">全部</el-radio-button>
            <el-radio-button :label="1">文章</el-radio-button>
            <el-radio-button :label="2">视频</el-radio-button>
          </el-radio-group>
          <el-radio-group v-model="filterType" @change="loadContents" style="margin-left: 20px;">
            <el-radio-button :label="null">全部分类</el-radio-button>
            <el-radio-button :label="1">白茶知识</el-radio-button>
            <el-radio-button :label="2">制作工艺</el-radio-button>
            <el-radio-button :label="3">品鉴技巧</el-radio-button>
            <el-radio-button :label="4">历史文化</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="keyword"
            placeholder="搜索内容"
            style="width: 300px; margin-left: 20px;"
            @keyup.enter="loadContents"
            clearable
          >
            <template #append>
              <el-button @click="loadContents">搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- 内容列表 -->
        <div v-loading="loading" class="contents-container">
          <el-empty v-if="!loading && contents.length === 0" description="暂无内容"></el-empty>
          <div v-else>
            <el-row :gutter="20">
              <el-col :span="8" v-for="content in contents" :key="content.id">
                <el-card class="content-card" @click="viewContent(content)">
                  <div class="content-cover">
                    <img v-if="content.coverImage" :src="content.coverImage" :alt="content.title" />
                    <div v-else class="default-cover">
                      <el-icon v-if="content.contentType === 1"><Document /></el-icon>
                      <el-icon v-else><VideoPlay /></el-icon>
                    </div>
                    <div v-if="content.contentType === 2" class="video-badge">
                      <el-icon><VideoPlay /></el-icon>
                      <span v-if="content.videoDuration">{{ formatDuration(content.videoDuration) }}</span>
                    </div>
                  </div>
                  <div class="content-info">
                    <h3 class="content-title">{{ content.title }}</h3>
                    <div class="content-meta">
                      <el-tag :type="getTypeTag(content.type)" size="small">{{ getTypeText(content.type) }}</el-tag>
                      <span class="content-stats">
                        <el-icon><View /></el-icon> {{ content.viewCount }}
                        <el-icon style="margin-left: 10px;"><Star /></el-icon> {{ content.likeCount }}
                      </span>
                    </div>
                    <p class="content-summary">{{ truncateContent(content.content) }}</p>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="loadContents"
            style="margin-top: 20px; text-align: center;"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, VideoPlay, View, Star } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'Culture',
  components: {
    Header,
    Document,
    VideoPlay,
    View,
    Star
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const contents = ref([])
    const currentPage = ref(1)
    const pageSize = ref(12)
    const total = ref(0)
    const filterContentType = ref(null)
    const filterType = ref(null)
    const keyword = ref('')

    const loadContents = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        if (filterContentType.value !== null) {
          params.contentType = filterContentType.value
        }
        if (filterType.value !== null) {
          params.type = filterType.value
        }
        if (keyword.value) {
          params.keyword = keyword.value
        }
        const res = await api.culture.getList(params)
        contents.value = res.data.records
        total.value = res.data.total
      } catch (error) {
        console.error('加载内容失败:', error)
      } finally {
        loading.value = false
      }
    }

    const viewContent = (content) => {
      if (content.contentType === 1) {
        // 文章
        router.push(`/culture/article/${content.id}`)
      } else {
        // 视频
        router.push(`/culture/video/${content.id}`)
      }
    }

    const truncateContent = (content) => {
      if (!content) return ''
      if (content.length > 100) {
        return content.substring(0, 100) + '...'
      }
      return content
    }

    const formatDuration = (seconds) => {
      if (!seconds) return ''
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
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
      loadContents()
    })

    return {
      loading,
      contents,
      currentPage,
      pageSize,
      total,
      filterContentType,
      filterType,
      keyword,
      loadContents,
      viewContent,
      truncateContent,
      formatDuration,
      getTypeText,
      getTypeTag
    }
  }
}
</script>

<style scoped>
.culture-page {
  min-height: 100vh;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.contents-container {
  min-height: 400px;
}

.content-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}

.content-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.content-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 15px;
  background: #f5f5f5;
}

.content-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 48px;
}

.video-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.content-info {
  padding: 0 5px;
}

.content-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.content-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.content-stats {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #999;
  font-size: 12px;
}

.content-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
