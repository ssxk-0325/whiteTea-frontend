<template>
  <div class="admin-culture">
    <h2>文化内容管理</h2>
    <div class="toolbar">
      <el-button type="primary" size="default" @click="handleAddArticle" style="display: inline-block;">添加文章</el-button>
      <el-button type="primary" size="default" @click="handleAddVideo" style="display: inline-block;">添加视频</el-button>
      <el-button size="default" @click="loadContents" style="display: inline-block;">刷新</el-button>
      <el-select v-model="filterContentType" @change="loadContents" style="width: 150px; margin-left: 10px;" clearable>
        <el-option label="全部类型" :value="null"></el-option>
        <el-option label="文章" :value="1"></el-option>
        <el-option label="视频" :value="2"></el-option>
      </el-select>
    </div>
    
    <!-- 内容列表 -->
    <el-table :data="contents" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="封面" width="100">
        <template #default="scope">
          <el-image
            v-if="scope.row.coverImage"
            :src="scope.row.coverImage"
            style="width: 60px; height: 60px;"
            fit="cover"
          />
          <span v-else>无封面</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" width="200"></el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.contentType === 1 ? 'success' : 'primary'">
            {{ scope.row.contentType === 1 ? '文章' : '视频' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="120">
        <template #default="scope">
          <el-tag :type="getTypeTag(scope.row.type)">{{ getTypeText(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览量" width="100"></el-table-column>
      <el-table-column prop="likeCount" label="点赞数" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editContent(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '下架' : '发布' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteContent(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadContents"
      style="margin-top: 20px; text-align: center;"
    />

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingContent ? '编辑内容' : (contentType === 1 ? '添加文章' : '添加视频')"
      width="900px"
      @close="resetForm"
    >
      <el-form :model="contentForm" label-width="100px" :rules="rules" ref="contentFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="contentForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="内容类型" prop="contentType">
          <el-radio-group v-model="contentForm.contentType" @change="handleContentTypeChange">
            <el-radio :label="1">文章</el-radio>
            <el-radio :label="2">视频</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类" prop="type">
          <el-select v-model="contentForm.type" placeholder="请选择分类" style="width: 100%">
            <el-option label="白茶知识" :value="1"></el-option>
            <el-option label="制作工艺" :value="2"></el-option>
            <el-option label="品鉴技巧" :value="3"></el-option>
            <el-option label="历史文化" :value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="封面图片">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-upload
              :action="uploadImageUrl"
              :headers="uploadHeaders"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload"
              :show-file-list="false"
            >
              <el-button type="primary">上传封面</el-button>
            </el-upload>
            <el-image
              v-if="contentForm.coverImage"
              :src="contentForm.coverImage"
              style="width: 100px; height: 100px;"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item v-if="contentForm.contentType === 2" label="视频文件">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-upload
              :action="uploadVideoUrl"
              :headers="uploadHeaders"
              :on-success="handleVideoSuccess"
              :before-upload="beforeVideoUpload"
              :show-file-list="false"
            >
              <el-button type="primary">上传视频</el-button>
            </el-upload>
            <span v-if="contentForm.videoUrl" style="color: #67c23a;">视频已上传</span>
          </div>
          <div v-if="contentForm.videoUrl" style="margin-top: 10px;">
            <video :src="contentForm.videoUrl" controls style="max-width: 100%; max-height: 300px;"></video>
          </div>
        </el-form-item>
        <el-form-item v-if="contentForm.contentType === 2" label="视频时长（秒）">
          <el-input-number v-model="contentForm.videoDuration" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item :label="contentForm.contentType === 1 ? '文章内容' : '视频描述'" prop="content">
          <el-input
            v-model="contentForm.content"
            type="textarea"
            :rows="contentForm.contentType === 1 ? 10 : 5"
            :placeholder="contentForm.contentType === 1 ? '请输入文章内容（支持HTML）' : '请输入视频描述'"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="contentForm.status">
            <el-radio :label="1">发布</el-radio>
            <el-radio :label="0">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveContent" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import store from '@/store'

export default {
  name: 'AdminCulture',
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const showAddDialog = ref(false)
    const editingContent = ref(null)
    const contentType = ref(1) // 1-文章，2-视频
    const contents = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const filterContentType = ref(null)
    const contentFormRef = ref(null)

    const contentForm = ref({
      title: '',
      contentType: 1,
      type: 1,
      coverImage: '',
      content: '',
      videoUrl: '',
      videoDuration: null,
      status: 1
    })

    const rules = {
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      contentType: [{ required: true, message: '请选择内容类型', trigger: 'change' }],
      type: [{ required: true, message: '请选择分类', trigger: 'change' }],
      content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
    }

    const uploadImageUrl = computed(() => {
      // 使用相对路径，会被代理到后端
      return '/api/upload/image'
    })

    const uploadVideoUrl = computed(() => {
      // 使用相对路径，会被代理到后端
      return '/api/upload/video'
    })

    const uploadHeaders = computed(() => {
      const token = store.getters['user/token']
      return {
        'Authorization': `Bearer ${token}`
      }
    })

    const handleContentTypeChange = (value) => {
      if (value === 1) {
        // 切换到文章，清空视频相关字段
        contentForm.value.videoUrl = ''
        contentForm.value.videoDuration = null
      }
    }

    const handleImageSuccess = (response) => {
      if (response.code === 200) {
        contentForm.value.coverImage = response.data
        ElMessage.success('封面图片上传成功')
      } else {
        ElMessage.error(response.message || '上传失败')
      }
    }

    const beforeImageUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      if (!isLt10M) {
        ElMessage.error('图片大小不能超过10MB!')
        return false
      }
      return true
    }

    const handleVideoSuccess = (response) => {
      if (response.code === 200) {
        contentForm.value.videoUrl = response.data
        ElMessage.success('视频上传成功')
        // 可以尝试获取视频时长，这里简化处理
      } else {
        ElMessage.error(response.message || '上传失败')
      }
    }

    const beforeVideoUpload = (file) => {
      const isVideo = file.type.startsWith('video/')
      const isLt100M = file.size / 1024 / 1024 < 100

      if (!isVideo) {
        ElMessage.error('只能上传视频文件!')
        return false
      }
      if (!isLt100M) {
        ElMessage.error('视频大小不能超过100MB!')
        return false
      }
      return true
    }

    // 加载内容列表
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
        const res = await api.culture.admin.getList(params)
        contents.value = res.data.records || []
        total.value = res.data.total || 0
      } catch (error) {
        ElMessage.error('加载内容列表失败')
      } finally {
        loading.value = false
      }
    }

    // 编辑内容
    const editContent = (content) => {
      editingContent.value = content
      contentType.value = content.contentType
      Object.assign(contentForm.value, {
        id: content.id,
        title: content.title,
        contentType: content.contentType,
        type: content.type,
        coverImage: content.coverImage || '',
        content: content.content || '',
        videoUrl: content.videoUrl || '',
        videoDuration: content.videoDuration || null,
        status: content.status
      })
      showAddDialog.value = true
    }

    // 保存内容
    const saveContent = async () => {
      if (!contentFormRef.value) return
      
      await contentFormRef.value.validate(async (valid) => {
        if (valid) {
          saving.value = true
          try {
            if (editingContent.value) {
              // 更新
              await api.culture.admin.update(contentForm.value)
              ElMessage.success('更新成功')
            } else {
              // 添加
              await api.culture.admin.create(contentForm.value)
              ElMessage.success('添加成功')
            }
            showAddDialog.value = false
            loadContents()
          } catch (error) {
            ElMessage.error(error.message || '保存失败')
          } finally {
            saving.value = false
          }
        }
      })
    }

    // 切换状态
    const toggleStatus = async (content) => {
      try {
        const newStatus = content.status === 1 ? 0 : 1
        await api.culture.admin.update({
          id: content.id,
          status: newStatus
        })
        ElMessage.success('操作成功')
        loadContents()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    // 删除内容
    const deleteContent = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个内容吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.culture.admin.delete(id)
        ElMessage.success('删除成功')
        loadContents()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 重置表单
    const resetForm = () => {
      editingContent.value = null
      contentType.value = 1
      contentForm.value = {
        title: '',
        contentType: 1,
        type: 1,
        coverImage: '',
        content: '',
        videoUrl: '',
        videoDuration: null,
        status: 1
      }
      if (contentFormRef.value) {
        contentFormRef.value.resetFields()
      }
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

    const handleAddArticle = () => {
      contentType.value = 1
      resetForm()
      contentForm.value.contentType = 1
      showAddDialog.value = true
    }

    const handleAddVideo = () => {
      contentType.value = 2
      resetForm()
      contentForm.value.contentType = 2
      showAddDialog.value = true
    }

    onMounted(() => {
      loadContents()
    })

    return {
      loading,
      saving,
      showAddDialog,
      editingContent,
      contentType,
      contents,
      currentPage,
      pageSize,
      total,
      filterContentType,
      contentForm,
      contentFormRef,
      rules,
      uploadImageUrl,
      uploadVideoUrl,
      uploadHeaders,
      handleContentTypeChange,
      handleImageSuccess,
      beforeImageUpload,
      handleVideoSuccess,
      beforeVideoUpload,
      loadContents,
      editContent,
      saveContent,
      toggleStatus,
      deleteContent,
      resetForm,
      getTypeText,
      getTypeTag,
      handleAddArticle,
      handleAddVideo
    }
  }
}
</script>

<style scoped>
.admin-culture {
  padding: 20px !important;
  background-color: #fff !important;
  min-height: calc(100vh - 60px);
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.toolbar {
  margin-bottom: 20px;
  display: flex !important;
  flex-direction: row !important;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.toolbar .el-button {
  min-width: 100px;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.5;
}
</style>

