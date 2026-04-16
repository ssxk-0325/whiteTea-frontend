<template>
  <div class="admin-page">
    <h2>福鼎白茶社区管理</h2>
    <p class="admin-hint">在此审核与管理社区帖子，可删除违规内容。用户侧社区中管理员也可直接删除帖子和评论。</p>
    <div class="toolbar toolbar-wrap">
      <el-input
        v-model="keyword"
        placeholder="标题或正文关键词"
        style="width: 240px"
        clearable
        @keyup.enter="loadPosts"
      />
      <el-input
        v-model="postIdSearch"
        placeholder="帖子ID（精确）"
        clearable
        style="width: 160px"
        @keyup.enter="loadPosts"
      />
      <el-select v-model="filterType" @change="loadPosts" style="width: 140px" clearable placeholder="帖子类型">
        <el-option label="全部类型" :value="null" />
        <el-option label="分享" :value="1" />
        <el-option label="提问" :value="2" />
        <el-option label="讨论" :value="3" />
      </el-select>
      <el-button type="primary" @click="loadPosts">搜索</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <el-table :data="posts" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column label="类型" width="88" class-name="admin-col-tag-cell">
        <template #default="scope">
          <el-tag :type="getTypeTag(scope.row.type)" size="small">{{ getTypeText(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
      <el-table-column label="作者" width="120" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.user?.nickname || scope.row.user?.username || '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览" width="72" />
      <el-table-column prop="commentCount" label="评论" width="72" />
      <el-table-column prop="likeCount" label="点赞" width="72" />
      <el-table-column label="发布时间" width="170">
        <template #default="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="scope">
          <div class="admin-table-actions">
            <el-button size="small" @click="openPost(scope.row.id)">前台查看</el-button>
            <el-button size="small" type="danger" @click="removePost(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadPosts"
      style="margin-top: 20px; text-align: center"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

export default {
  name: 'AdminCommunity',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const posts = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const keyword = ref('')
    const postIdSearch = ref('')
    const filterType = ref(null)

    const loadPosts = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        if (filterType.value != null) params.type = filterType.value
        if (keyword.value?.trim()) params.keyword = keyword.value.trim()
        const pid = String(postIdSearch.value || '').trim()
        if (pid !== '' && /^\d+$/.test(pid)) {
          params.postId = Number(pid)
        }
        const res = await api.community.getPostList(params)
        posts.value = res.data.records || []
        total.value = res.data.total || 0
      } catch {
        ElMessage.error('加载帖子失败')
      } finally {
        loading.value = false
      }
    }

    const resetFilters = () => {
      keyword.value = ''
      postIdSearch.value = ''
      filterType.value = null
      currentPage.value = 1
      loadPosts()
    }

    const openPost = (id) => {
      const url = router.resolve({ path: `/community/post/${id}` }).href
      window.open(url, '_blank')
    }

    const removePost = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定删除帖子「${row.title}」吗？将同时移除其评论与互动数据。`,
          '删除确认',
          { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
        )
        await api.community.deletePost(row.id)
        ElMessage.success('已删除')
        loadPosts()
      } catch (e) {
        if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
      }
    }

    const getTypeText = (type) => {
      const m = { 1: '分享', 2: '提问', 3: '讨论' }
      return m[type] || '—'
    }

    const getTypeTag = (type) => {
      const m = { 1: 'success', 2: 'warning', 3: 'info' }
      return m[type] || 'info'
    }

    const formatTime = (time) => {
      if (!time) return '—'
      return new Date(time).toLocaleString('zh-CN')
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
      keyword,
      postIdSearch,
      filterType,
      loadPosts,
      resetFilters,
      openPost,
      removePost,
      getTypeText,
      getTypeTag,
      formatTime
    }
  }
}
</script>

<style scoped>
.admin-hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  margin: 0 0 16px;
  line-height: 1.5;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar-wrap {
  align-items: center;
}
</style>
