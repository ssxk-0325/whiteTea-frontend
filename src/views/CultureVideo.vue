<template>
  <div class="video-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <el-button @click="$router.back()" style="margin-bottom: 20px;">返回</el-button>
        <el-card v-loading="loading">
          <el-result
            v-if="trainingAccessForbidden"
            icon="warning"
            title="暂无权限查看"
            sub-title="本视频为「培训专区」内容，仅对已通过「批发与培训」产业报名审核的用户开放。"
          >
            <template #extra>
              <el-button type="primary" @click="$router.push('/services/wholesale-training')">去批发培训服务</el-button>
              <el-button @click="$router.push('/culture')">返回文化首页</el-button>
            </template>
          </el-result>
          <div v-else-if="video">
            <div class="video-header">
              <h1>{{ video.title }}</h1>
              <div class="video-meta">
                <el-tag :type="getTypeTag(video.type)">{{ getTypeText(video.type) }}</el-tag>
                <span class="meta-item">
                  <el-icon><View /></el-icon> {{ video.viewCount }} 浏览
                </span>
                <span class="meta-item">
                  <el-icon><Star /></el-icon> {{ video.likeCount }} 点赞
                </span>
                <span class="meta-item" v-if="video.videoDuration">
                  时长：{{ formatDuration(video.videoDuration) }}
                </span>
                <span class="meta-item">{{ formatTime(video.createTime) }}</span>
              </div>
            </div>
            <el-divider />
            <div class="video-cover">
              <el-image :src="resolveCultureCoverSrc(video)" fit="cover" style="width: 100%; max-height: 360px;" />
            </div>
            <el-divider />
            <div class="video-player-container">
              <video
                v-if="video.videoUrl"
                :src="resolveUploadUrl(video.videoUrl)"
                controls
                style="width: 100%; max-height: 600px;"
                @play="handleVideoPlay"
              ></video>
              <div v-else class="no-video">
                <el-icon><VideoPlay /></el-icon>
                <p>视频暂未上传</p>
              </div>
            </div>
            <el-divider />
            <div class="video-description" v-if="video.content">
              <h3>视频简介</h3>
              <div v-html="video.content"></div>
            </div>
            <el-divider />
            <div class="video-actions">
              <el-button
                :type="isLiked ? 'primary' : 'default'"
                @click="handleLike"
              >
                <el-icon><component :is="isLiked ? 'StarFilled' : 'Star'" /></el-icon>
                {{ isLiked ? '已点赞' : '点赞' }} ({{ video.likeCount }})
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
import { View, Star, StarFilled, VideoPlay } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'
import { resolveCultureCoverSrc } from '@/utils/cultureCover'
import { resolveUploadUrl } from '@/utils/uploadUrl'

export default {
  name: 'CultureVideo',
  components: {
    Header,
    View,
    Star,
    StarFilled,
    VideoPlay
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const video = ref(null)
    const isLiked = ref(false)
    const trainingAccessForbidden = ref(false)

    const loadVideo = async () => {
      trainingAccessForbidden.value = false
      loading.value = true
      try {
        const res = await api.culture.getById(route.params.id, { skipGlobalErrorMsg: true })
        video.value = res.data

        // 记录浏览历史
        if (store.state.user.token) {
          api.browseHistory.record({
            targetType: 3,
            targetId: video.value.id,
            title: video.value.title,
            image: resolveCultureCoverSrc(video.value)
          }).catch(err => console.error('记录历史失败', err))
        }
      } catch (error) {
        if (error.message && error.message.includes('暂无权限查看培训专区')) {
          trainingAccessForbidden.value = true
          video.value = null
        } else {
          ElMessage.error(error.message || '加载视频失败')
          router.push('/culture')
        }
      } finally {
        loading.value = false
      }
    }

    const handleVideoPlay = () => {
      // 视频播放时可以增加一些统计
    }

    const handleLike = async () => {
      const skipMsg = video.value?.type === 5
      try {
        if (isLiked.value) {
          await api.culture.unlike(route.params.id, { skipGlobalErrorMsg: skipMsg })
          isLiked.value = false
          video.value.likeCount--
          ElMessage.success('取消点赞成功')
        } else {
          await api.culture.like(route.params.id, { skipGlobalErrorMsg: skipMsg })
          isLiked.value = true
          video.value.likeCount++
          ElMessage.success('点赞成功')
        }
      } catch (error) {
        if (error.message && error.message.includes('暂无权限查看培训专区')) {
          ElMessage.warning('暂无权限操作')
        } else {
          ElMessage.error('操作失败')
        }
      }
    }

    const formatTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleDateString('zh-CN')
    }

    const formatDuration = (seconds) => {
      if (!seconds) return ''
      const hours = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
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

    onMounted(() => {
      loadVideo()
    })

    return {
      loading,
      video,
      resolveCultureCoverSrc,
      resolveUploadUrl,
      isLiked,
      trainingAccessForbidden,
      handleVideoPlay,
      handleLike,
      formatTime,
      formatDuration,
      getTypeText,
      getTypeTag
    }
  }
}
</script>

<style scoped>
.video-page {
  min-height: 100vh;
}

.video-cover {
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
}

.video-header {
  margin-bottom: 20px;
}

.video-header h1 {
  margin: 0 0 15px 0;
  font-size: 28px;
  font-weight: bold;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #999;
  font-size: 14px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.video-player-container {
  margin: 20px 0;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.no-video {
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 48px;
}

.no-video p {
  margin-top: 20px;
  font-size: 16px;
}

.video-description {
  margin: 20px 0;
}

.video-description h3 {
  margin-bottom: 15px;
}

.video-description :deep(p) {
  line-height: 1.8;
  color: #666;
  margin-bottom: 10px;
}

.video-actions {
  text-align: center;
  padding-top: 20px;
}
</style>

