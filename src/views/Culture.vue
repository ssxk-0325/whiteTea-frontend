<template>
  <div class="culture-page">
    <Header />
    <FudingCultureIntro />
    <el-container class="culture-list-wrap">
      <el-main class="culture-main">
        <section class="top-panel">
          <div class="top-panel-header">
            <div>
              <h2 class="page-title">福鼎白茶文化</h2>
              <p class="page-subtitle">文章与视频科普；「培训专区」为批发培训配套自学内容，便于与通用文化区分</p>
            </div>
            <el-button type="primary" class="quiz-btn" @click="goToQuiz">
              <el-icon><QuestionFilled /></el-icon>
              趣味问答
            </el-button>
          </div>

          <!-- 筛选栏 -->
          <div class="filter-grid">
            <div class="filter-group">
              <span class="group-label">内容类型</span>
              <el-radio-group v-model="filterContentType" @change="loadContents">
                <el-radio-button :label="null">全部</el-radio-button>
                <el-radio-button :label="1">文章</el-radio-button>
                <el-radio-button :label="2">视频</el-radio-button>
              </el-radio-group>
            </div>
            <div class="filter-group">
              <span class="group-label">内容分类</span>
              <el-radio-group v-model="filterType" @change="loadContents">
                <el-radio-button :label="null">全部分类</el-radio-button>
                <el-radio-button :label="1">白茶知识</el-radio-button>
                <el-radio-button :label="2">制作工艺</el-radio-button>
                <el-radio-button :label="3">品鉴技巧</el-radio-button>
                <el-radio-button :label="4">历史文化</el-radio-button>
                <el-radio-button :label="5">培训专区</el-radio-button>
              </el-radio-group>
            </div>
            <div class="search-box">
              <el-input
                v-model="keyword"
                placeholder="搜索文章/视频标题"
                @keyup.enter="loadContents"
                clearable
              >
                <template #append>
                  <el-button @click="loadContents">搜索</el-button>
                </template>
              </el-input>
            </div>
          </div>
        </section>

        <el-result
          v-if="trainingAccessForbidden"
          class="training-access-result"
          icon="warning"
          title="暂无权限查看"
          sub-title="「培训专区」仅对已通过「批发与培训」产业报名审核的用户开放（管理员不受限）。您可先报名批发与培训场次，审核通过后再访问本分类。"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/services/wholesale-training')">去批发培训服务</el-button>
            <el-button @click="clearTrainingFilter">浏览其他分类</el-button>
          </template>
        </el-result>

        <!-- 内容列表 -->
        <div v-else v-loading="loading" class="contents-container">
          <el-empty v-if="!loading && contents.length === 0" description="暂无内容"></el-empty>
          <div v-else>
            <el-row :gutter="20">
              <el-col :span="8" v-for="content in contents" :key="content.id">
                <el-card class="content-card" @click="viewContent(content)">
                  <div class="content-cover">
                    <img :src="resolveCultureCoverSrc(content)" :alt="content.title" />
                    <div v-if="!content.coverImage" class="cover-type-badge">
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
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Document, VideoPlay, View, Star, QuestionFilled } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'
import FudingCultureIntro from '@/components/FudingCultureIntro.vue'
import { resolveCultureCoverSrc } from '@/utils/cultureCover'

export default {
  name: 'Culture',
  components: {
    Header,
    FudingCultureIntro,
    Document,
    VideoPlay,
    View,
    Star,
    QuestionFilled
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const contents = ref([])
    const currentPage = ref(1)
    const pageSize = ref(12)
    const total = ref(0)
    const filterContentType = ref(null)
    const filterType = ref(null)
    const keyword = ref('')
    const trainingAccessForbidden = ref(false)

    const loadContents = async () => {
      if (filterType.value !== 5) {
        trainingAccessForbidden.value = false
      }
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
        const listConfig = filterType.value === 5 ? { skipGlobalErrorMsg: true } : {}
        const res = await api.culture.getList(params, listConfig)
        trainingAccessForbidden.value = false
        contents.value = res.data.records
        total.value = res.data.total
      } catch (e) {
        if (
          filterType.value === 5 &&
          e.message &&
          e.message.includes('暂无权限查看培训专区')
        ) {
          trainingAccessForbidden.value = true
          contents.value = []
          total.value = 0
        } else {
          console.error('加载内容失败:', e)
        }
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

    const goToQuiz = () => {
      router.push('/quiz')
    }

    const clearTrainingFilter = () => {
      filterType.value = null
      trainingAccessForbidden.value = false
      router.replace({ path: '/culture' })
      loadContents()
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
        4: '历史文化',
        5: '培训专区'
      }
      return typeMap[type] || '未知'
    }

    const getTypeTag = (type) => {
      const tagMap = {
        1: 'success',
        2: 'warning',
        3: 'info',
        4: 'danger',
        5: 'primary'
      }
      return tagMap[type] || 'info'
    }

    const applyTypeFromRoute = () => {
      const t = route.query.type
      if (t === undefined || t === null || t === '') return
      const n = parseInt(String(t), 10)
      if (!Number.isNaN(n) && n >= 1 && n <= 5) {
        filterType.value = n
      }
    }

    onMounted(() => {
      applyTypeFromRoute()
      loadContents()
    })

    watch(
      () => route.query.type,
      () => {
        applyTypeFromRoute()
        loadContents()
      }
    )

    return {
      loading,
      resolveCultureCoverSrc,
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
      getTypeTag,
      goToQuiz,
      trainingAccessForbidden,
      clearTrainingFilter
    }
  }
}
</script>

<style scoped>
.culture-page {
  min-height: 100vh;
}

.culture-list-wrap {
  position: relative;
  z-index: 2;
  background: #f3f6fb;
}

.culture-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 24px;
}

.top-panel {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.top-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.page-subtitle {
  margin: 8px 0 0;
  color: #606266;
  font-size: 14px;
}

.quiz-btn {
  flex-shrink: 0;
}

.filter-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.group-label {
  min-width: 70px;
  color: #606266;
  font-size: 14px;
}

.search-box {
  width: 100%;
  max-width: 420px;
}

.training-access-result {
  margin: 24px 0;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
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

.cover-type-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
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

@media (max-width: 768px) {
  .culture-main {
    padding: 20px 12px;
  }

  .top-panel {
    padding: 16px;
  }

  .top-panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 22px;
  }

  .group-label {
    min-width: auto;
    width: 100%;
  }

  .search-box {
    max-width: none;
  }
}
</style>
