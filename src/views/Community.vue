<template>
  <div class="community-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <div class="community-header">
          <h2>社区</h2>
          <el-button type="primary" @click="showPostDialog = true" v-if="isLoggedIn">
            <el-icon><Plus /></el-icon>
            发帖
          </el-button>
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="filterType" @change="loadPosts">
            <el-radio-button :label="null">全部</el-radio-button>
            <el-radio-button :label="1">分享</el-radio-button>
            <el-radio-button :label="2">提问</el-radio-button>
            <el-radio-button :label="3">讨论</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="keyword"
            placeholder="搜索帖子"
            style="width: 300px; margin-left: 20px;"
            @keyup.enter="loadPosts"
            clearable
          >
            <template #append>
              <el-button @click="loadPosts">搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- 帖子列表 -->
        <div v-loading="loading" class="posts-container">
          <el-empty v-if="!loading && posts.length === 0" description="暂无帖子"></el-empty>
          <div v-else>
            <el-card v-for="post in posts" :key="post.id" class="post-card" @click="viewPostDetail(post.id)">
              <div class="post-header">
                <div class="post-user">
                  <el-avatar :src="post.user?.avatar || '/default-avatar.png'" :size="40"></el-avatar>
                  <div class="user-info">
                    <div class="username">{{ post.user?.nickname || post.user?.username }}</div>
                    <div class="post-time">{{ formatTime(post.createTime) }}</div>
                  </div>
                </div>
                <el-tag :type="getTypeTag(post.type)">{{ getTypeText(post.type) }}</el-tag>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <div class="post-content" v-html="truncateContent(post.content)"></div>
              <div class="post-images" v-if="post.images">
                <el-image
                  v-for="(img, index) in parseImages(post.images)"
                  :key="index"
                  :src="img"
                  fit="cover"
                  style="width: 100px; height: 100px; margin-right: 10px;"
                  :preview-src-list="parseImages(post.images)"
                  :initial-index="index"
                ></el-image>
              </div>
              <div class="post-footer">
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ post.commentCount }}</span>
                  <span><el-icon><Like /></el-icon> {{ post.likeCount }}</span>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="loadPosts"
            style="margin-top: 20px; text-align: center;"
          />
        </div>

        <!-- 发帖对话框 -->
        <el-dialog v-model="showPostDialog" title="发布帖子" width="800px">
          <el-form :model="postForm" :rules="postRules" ref="postFormRef" label-width="80px">
            <el-form-item label="类型" prop="type">
              <el-radio-group v-model="postForm.type">
                <el-radio :label="1">分享</el-radio>
                <el-radio :label="2">提问</el-radio>
                <el-radio :label="3">讨论</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标题" prop="title">
              <el-input v-model="postForm.title" placeholder="请输入标题"></el-input>
            </el-form-item>
            <el-form-item label="内容" prop="content">
              <el-input
                v-model="postForm.content"
                type="textarea"
                :rows="8"
                placeholder="请输入内容"
              ></el-input>
            </el-form-item>
            <el-form-item label="图片">
              <el-upload
                action="#"
                :auto-upload="false"
                :on-change="handleImageChange"
                :file-list="imageList"
                list-type="picture-card"
                :limit="9"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showPostDialog = false">取消</el-button>
            <el-button type="primary" @click="submitPost" :loading="submitting">发布</el-button>
          </template>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Plus, View, ChatDotRound, Star } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'Community',
  components: {
    Header,
    Plus,
    View,
    ChatDotRound,
    Like: Star
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const posts = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const filterType = ref(null)
    const keyword = ref('')
    const showPostDialog = ref(false)
    const submitting = ref(false)
    const postFormRef = ref(null)
    const imageList = ref([])

    const isLoggedIn = computed(() => store.getters['user/isLoggedIn'])

    const postForm = ref({
      type: 1,
      title: '',
      content: '',
      images: ''
    })

    const postRules = {
      type: [{ required: true, message: '请选择类型', trigger: 'change' }],
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
    }

    const loadPosts = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        if (filterType.value !== null) {
          params.type = filterType.value
        }
        if (keyword.value) {
          params.keyword = keyword.value
        }
        const res = await api.community.getPostList(params)
        posts.value = res.data.records
        total.value = res.data.total
      } catch (error) {
        ElMessage.error('加载帖子失败')
      } finally {
        loading.value = false
      }
    }

    const viewPostDetail = (id) => {
      router.push(`/community/post/${id}`)
    }

    const submitPost = async () => {
      if (!postFormRef.value) return
      await postFormRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true
          try {
            // 处理图片
            const images = imageList.value.length > 0
              ? JSON.stringify(imageList.value.map(file => file.url || URL.createObjectURL(file.raw)))
              : null

            await api.community.createPost({
              type: postForm.value.type,
              title: postForm.value.title,
              content: postForm.value.content,
              images: images
            })
            ElMessage.success('发布成功')
            showPostDialog.value = false
            // 重置表单
            postForm.value = { type: 1, title: '', content: '', images: '' }
            imageList.value = []
            loadPosts()
          } catch (error) {
            ElMessage.error(error.message || '发布失败')
          } finally {
            submitting.value = false
          }
        }
      })
    }

    const handleImageChange = (file) => {
      // 这里简化处理，实际应该上传到服务器
      imageList.value.push(file)
    }

    const parseImages = (images) => {
      if (!images) return []
      try {
        return JSON.parse(images)
      } catch {
        return []
      }
    }

    const truncateContent = (content) => {
      if (!content) return ''
      if (content.length > 200) {
        return content.substring(0, 200) + '...'
      }
      return content
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
      loadPosts()
    })

    return {
      loading,
      posts,
      currentPage,
      pageSize,
      total,
      filterType,
      keyword,
      showPostDialog,
      submitting,
      postForm,
      postRules,
      postFormRef,
      imageList,
      isLoggedIn,
      loadPosts,
      viewPostDetail,
      submitPost,
      handleImageChange,
      parseImages,
      truncateContent,
      formatTime,
      getTypeText,
      getTypeTag
    }
  }
}
</script>

<style scoped>
.community-page {
  min-height: 100vh;
}

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.posts-container {
  min-height: 400px;
}

.post-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  font-size: 14px;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-title {
  margin: 15px 0;
  font-size: 18px;
  font-weight: bold;
}

.post-content {
  margin-bottom: 15px;
  color: #666;
  line-height: 1.6;
}

.post-images {
  margin-bottom: 15px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.post-stats {
  display: flex;
  gap: 20px;
  color: #999;
  font-size: 14px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
