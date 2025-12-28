<template>
  <div class="post-detail-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <el-button @click="$router.back()" style="margin-bottom: 20px;">返回</el-button>
        <el-card v-loading="loading">
          <div v-if="post">
            <!-- 帖子头部 -->
            <div class="post-header">
              <div class="post-user">
                <el-avatar :src="post.user?.avatar || '/default-avatar.png'" :size="50"></el-avatar>
                <div class="user-info">
                  <div class="username">{{ post.user?.nickname || post.user?.username }}</div>
                  <div class="post-time">{{ formatTime(post.createTime) }}</div>
                </div>
              </div>
              <el-tag :type="getTypeTag(post.type)">{{ getTypeText(post.type) }}</el-tag>
            </div>

            <!-- 帖子内容 -->
            <h2 class="post-title">{{ post.title }}</h2>
            <div class="post-content" v-html="post.content"></div>
            <div class="post-images" v-if="post.images">
              <el-image
                v-for="(img, index) in parseImages(post.images)"
                :key="index"
                :src="img"
                fit="cover"
                style="width: 200px; height: 200px; margin-right: 10px; margin-bottom: 10px;"
                :preview-src-list="parseImages(post.images)"
                :initial-index="index"
              ></el-image>
            </div>

            <!-- 操作栏 -->
            <div class="post-actions">
              <el-button
                :type="userActions.liked ? 'primary' : 'default'"
                @click="handleLike"
                :disabled="!isLoggedIn"
              >
                <el-icon><component :is="userActions.liked ? 'LikeFilled' : 'Like'" /></el-icon>
                {{ post.likeCount }} 点赞
              </el-button>
              <el-button
                :type="userActions.disliked ? 'danger' : 'default'"
                @click="handleDislike"
                :disabled="!isLoggedIn"
              >
                <el-icon><component :is="userActions.disliked ? 'DislikeFilled' : 'Dislike'" /></el-icon>
                点踩
              </el-button>
              <el-button
                :type="userActions.favorited ? 'warning' : 'default'"
                @click="handleFavorite"
                :disabled="!isLoggedIn"
              >
                <el-icon><component :is="userActions.favorited ? 'StarFilled' : 'Star'" /></el-icon>
                {{ userActions.favorited ? '已收藏' : '收藏' }}
              </el-button>
              <div class="post-stats">
                <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ post.commentCount }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 评论区域 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <span>评论 ({{ comments.length }})</span>
          </template>

          <!-- 发表评论 -->
          <div v-if="isLoggedIn" class="comment-form">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="3"
              placeholder="写下你的评论..."
              maxlength="500"
              show-word-limit
            ></el-input>
            <el-button type="primary" style="margin-top: 10px;" @click="submitComment">发表评论</el-button>
          </div>
          <div v-else class="login-tip">
            <el-button type="primary" @click="$router.push('/login')">登录后发表评论</el-button>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list" v-loading="commentsLoading">
            <el-empty v-if="!commentsLoading && comments.length === 0" description="暂无评论"></el-empty>
            <div v-else>
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <el-avatar :src="comment.user?.avatar || '/default-avatar.png'" :size="40"></el-avatar>
                  <div class="comment-user-info">
                    <div class="comment-username">{{ comment.user?.nickname || comment.user?.username }}</div>
                    <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
                  </div>
                  <el-button
                    v-if="isLoggedIn && comment.user?.id === currentUserId"
                    type="text"
                    size="small"
                    @click="deleteComment(comment.id)"
                  >
                    删除
                  </el-button>
                </div>
                <div class="comment-content">{{ comment.content }}</div>

                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                  <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <el-avatar :src="reply.user?.avatar || '/default-avatar.png'" :size="30"></el-avatar>
                    <div class="reply-content">
                      <span class="reply-username">{{ reply.user?.nickname || reply.user?.username }}</span>
                      <span class="reply-text">{{ reply.content }}</span>
                    </div>
                    <el-button
                      v-if="isLoggedIn && reply.user?.id === currentUserId"
                      type="text"
                      size="small"
                      @click="deleteComment(reply.id)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>

                <!-- 回复按钮 -->
                <div v-if="isLoggedIn" class="comment-actions">
                  <el-button type="text" size="small" @click="showReplyInput(comment.id)">回复</el-button>
                </div>

                <!-- 回复输入框 -->
                <div v-if="replyingTo === comment.id" class="reply-form">
                  <el-input
                    v-model="replyContent"
                    type="textarea"
                    :rows="2"
                    placeholder="写下你的回复..."
                    maxlength="200"
                  ></el-input>
                  <div style="margin-top: 10px;">
                    <el-button size="small" @click="cancelReply">取消</el-button>
                    <el-button type="primary" size="small" @click="submitReply(comment.id)">回复</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, ChatDotRound, Star, StarFilled, CircleClose, CircleCheck } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'PostDetail',
  components: {
    Header,
    View,
    ChatDotRound,
    Like: Star,
    LikeFilled: StarFilled,
    Dislike: CircleClose,
    DislikeFilled: CircleClose,
    Star,
    StarFilled
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const commentsLoading = ref(false)
    const post = ref(null)
    const comments = ref([])
    const commentContent = ref('')
    const replyContent = ref('')
    const replyingTo = ref(null)
    const userActions = ref({
      liked: false,
      disliked: false,
      favorited: false
    })

    const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])
    const currentUserId = computed(() => store.state.user.userInfo?.id)

    const loadPostDetail = async () => {
      loading.value = true
      try {
        const res = await api.community.getPostDetail(route.params.id)
        post.value = res.data
        userActions.value = res.data.userActions || {
          liked: false,
          disliked: false,
          favorited: false
        }
      } catch (error) {
        ElMessage.error('加载帖子失败')
        router.push('/community')
      } finally {
        loading.value = false
      }
    }

    const loadComments = async () => {
      commentsLoading.value = true
      try {
        const res = await api.community.getCommentList(route.params.id)
        comments.value = res.data
      } catch (error) {
        ElMessage.error('加载评论失败')
      } finally {
        commentsLoading.value = false
      }
    }

    const handleLike = async () => {
      if (!isLoggedIn.value) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }

      try {
        if (userActions.value.liked) {
          const res = await api.community.unlikePost(route.params.id)
          userActions.value = res.data.userActions
          post.value.likeCount--
        } else {
          const res = await api.community.likePost(route.params.id)
          userActions.value = res.data.userActions
          post.value.likeCount++
        }
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }

    const handleDislike = async () => {
      if (!isLoggedIn.value) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }

      try {
        if (userActions.value.disliked) {
          const res = await api.community.undislikePost(route.params.id)
          userActions.value = res.data.userActions
        } else {
          const res = await api.community.dislikePost(route.params.id)
          userActions.value = res.data.userActions
        }
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }

    const handleFavorite = async () => {
      if (!isLoggedIn.value) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }

      try {
        if (userActions.value.favorited) {
          const res = await api.community.unfavoritePost(route.params.id)
          userActions.value = res.data.userActions
          ElMessage.success('取消收藏成功')
        } else {
          const res = await api.community.favoritePost(route.params.id)
          userActions.value = res.data.userActions
          ElMessage.success('收藏成功')
        }
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }

    const submitComment = async () => {
      if (!commentContent.value.trim()) {
        ElMessage.warning('请输入评论内容')
        return
      }

      try {
        await api.community.addComment({
          postId: route.params.id,
          content: commentContent.value
        })
        ElMessage.success('评论成功')
        commentContent.value = ''
        loadComments()
        post.value.commentCount++
      } catch (error) {
        ElMessage.error(error.message || '评论失败')
      }
    }

    const showReplyInput = (commentId) => {
      replyingTo.value = commentId
      replyContent.value = ''
    }

    const cancelReply = () => {
      replyingTo.value = null
      replyContent.value = ''
    }

    const submitReply = async (parentId) => {
      if (!replyContent.value.trim()) {
        ElMessage.warning('请输入回复内容')
        return
      }

      try {
        await api.community.addComment({
          postId: route.params.id,
          parentId: parentId,
          content: replyContent.value
        })
        ElMessage.success('回复成功')
        cancelReply()
        loadComments()
        post.value.commentCount++
      } catch (error) {
        ElMessage.error(error.message || '回复失败')
      }
    }

    const deleteComment = async (commentId) => {
      try {
        await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.community.deleteComment(commentId)
        ElMessage.success('删除成功')
        loadComments()
        post.value.commentCount--
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '删除失败')
        }
      }
    }

    const parseImages = (images) => {
      if (!images) return []
      try {
        return JSON.parse(images)
      } catch {
        return []
      }
    }

    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (hours < 24) return `${hours}小时前`
      if (days < 7) return `${days}天前`
      return date.toLocaleDateString('zh-CN')
    }

    const getTypeText = (type) => {
      const typeMap = {
        1: '分享',
        2: '提问',
        3: '讨论'
      }
      return typeMap[type] || '未知'
    }

    const getTypeTag = (type) => {
      const tagMap = {
        1: 'success',
        2: 'warning',
        3: 'info'
      }
      return tagMap[type] || 'info'
    }

    onMounted(() => {
      loadPostDetail()
      loadComments()
    })

    return {
      loading,
      commentsLoading,
      post,
      comments,
      commentContent,
      replyContent,
      replyingTo,
      userActions,
      isLoggedIn,
      currentUserId,
      handleLike,
      handleDislike,
      handleFavorite,
      submitComment,
      showReplyInput,
      cancelReply,
      submitReply,
      deleteComment,
      parseImages,
      formatTime,
      getTypeText,
      getTypeTag
    }
  }
}
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  font-size: 16px;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-title {
  margin: 20px 0;
  font-size: 24px;
  font-weight: bold;
}

.post-content {
  margin-bottom: 20px;
  line-height: 1.8;
  color: #333;
}

.post-images {
  margin-bottom: 20px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.post-stats {
  display: flex;
  gap: 20px;
  margin-left: auto;
  color: #999;
  font-size: 14px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.comment-form {
  margin-bottom: 30px;
}

.login-tip {
  text-align: center;
  padding: 20px;
  margin-bottom: 30px;
}

.comments-list {
  margin-top: 20px;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.comment-username {
  font-weight: bold;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  margin: 10px 0;
  line-height: 1.6;
  color: #333;
}

.comment-actions {
  margin-top: 10px;
}

.replies-list {
  margin-top: 15px;
  padding-left: 50px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
}

.reply-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-content {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
}

.reply-username {
  font-weight: bold;
  color: #409eff;
}

.reply-text {
  color: #666;
}

.reply-form {
  margin-top: 10px;
  padding-left: 50px;
}
</style>

