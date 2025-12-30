<template>
  <div class="admin-activities">
    <h2>活动管理</h2>
    <div class="toolbar">
      <el-button type="primary" size="default" @click="showAddDialog = true" style="display: inline-block;">添加活动</el-button>
      <el-button size="default" @click="loadActivities" style="display: inline-block;">刷新</el-button>
      <el-select v-model="filterType" @change="loadActivities" style="width: 150px; margin-left: 10px;" clearable>
        <el-option label="全部类型" :value="null"></el-option>
        <el-option label="茶艺课" :value="1"></el-option>
        <el-option label="茶园参观" :value="2"></el-option>
        <el-option label="线下品鉴会" :value="3"></el-option>
        <el-option label="制茶体验" :value="4"></el-option>
      </el-select>
    </div>
    
    <!-- 活动列表 -->
    <el-table :data="activities" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="活动图片" width="100">
        <template #default="scope">
          <el-image
            v-if="scope.row.image"
            :src="scope.row.image"
            style="width: 60px; height: 60px;"
            fit="cover"
          />
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="活动名称" width="200"></el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="scope">
          <el-tag :type="getTypeTag(scope.row.type)">{{ getTypeText(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="160">
        <template #default="scope">
          {{ formatDateTime(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="160">
        <template #default="scope">
          {{ formatDateTime(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="券数" width="120">
        <template #default="scope">
          {{ scope.row.issuedCoupons }}/{{ scope.row.totalCoupons }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTag(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editActivity(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteActivity(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadActivities"
      style="margin-top: 20px; text-align: center;"
    />

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingActivity ? '编辑活动' : '添加活动'"
      width="900px"
      @close="resetForm"
    >
      <el-form :model="activityForm" label-width="120px" :rules="rules" ref="activityFormRef">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="activityForm.name" placeholder="请输入活动名称"></el-input>
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="activityForm.type" placeholder="请选择活动类型" style="width: 100%">
            <el-option label="茶艺课" :value="1"></el-option>
            <el-option label="茶园参观" :value="2"></el-option>
            <el-option label="线下品鉴会" :value="3"></el-option>
            <el-option label="制茶体验" :value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="活动图片">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-upload
              :action="uploadImageUrl"
              :headers="uploadHeaders"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload"
              :show-file-list="false"
            >
              <el-button type="primary">上传图片</el-button>
            </el-upload>
            <el-image
              v-if="activityForm.image"
              :src="activityForm.image"
              style="width: 100px; height: 100px;"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="activityForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入活动描述"
          />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="activityForm.price" :min="0" :precision="2" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="活动开始时间" prop="startTime">
          <el-date-picker
            v-model="activityForm.startTime"
            type="datetime"
            placeholder="选择活动开始时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="活动结束时间" prop="endTime">
          <el-date-picker
            v-model="activityForm.endTime"
            type="datetime"
            placeholder="选择活动结束时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="抢券开始时间" prop="couponStartTime">
          <el-date-picker
            v-model="activityForm.couponStartTime"
            type="datetime"
            placeholder="选择抢券开始时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="抢券结束时间" prop="couponEndTime">
          <el-date-picker
            v-model="activityForm.couponEndTime"
            type="datetime"
            placeholder="选择抢券结束时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="总券数" prop="totalCoupons">
          <el-input-number v-model="activityForm.totalCoupons" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="报名人数上限">
          <el-input-number v-model="activityForm.maxParticipants" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="activityForm.status">
            <el-radio :label="0">未开始</el-radio>
            <el-radio :label="1">进行中</el-radio>
            <el-radio :label="2">已结束</el-radio>
            <el-radio :label="3">已取消</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveActivity" :loading="saving">保存</el-button>
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
  name: 'AdminActivities',
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const showAddDialog = ref(false)
    const editingActivity = ref(null)
    const activities = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const filterType = ref(null)
    const activityFormRef = ref(null)

    const activityForm = ref({
      name: '',
      type: 1,
      image: '',
      description: '',
      price: null,
      startTime: '',
      endTime: '',
      couponStartTime: '',
      couponEndTime: '',
      totalCoupons: 0,
      maxParticipants: 0,
      status: 0
    })

    const rules = {
      name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
      type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
      startTime: [{ required: true, message: '请选择活动开始时间', trigger: 'change' }],
      endTime: [{ required: true, message: '请选择活动结束时间', trigger: 'change' }],
      totalCoupons: [{ required: true, message: '请输入总券数', trigger: 'blur' }]
    }

    const uploadImageUrl = computed(() => {
      return '/api/upload/image'
    })

    const uploadHeaders = computed(() => {
      const token = store.getters['user/token']
      return {
        'Authorization': `Bearer ${token}`
      }
    })

    const handleImageSuccess = (response) => {
      if (response.code === 200) {
        activityForm.value.image = response.data
        ElMessage.success('图片上传成功')
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

    const loadActivities = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        if (filterType.value !== null) {
          params.type = filterType.value
        }
        const res = await api.activity.admin.getList(params)
        activities.value = res.data.records || []
        total.value = res.data.total || 0
      } catch (error) {
        ElMessage.error('加载活动列表失败')
      } finally {
        loading.value = false
      }
    }

    const editActivity = (activity) => {
      editingActivity.value = activity
      Object.assign(activityForm.value, {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        image: activity.image || '',
        description: activity.description || '',
        price: activity.price || null,
        startTime: activity.startTime ? formatDateTimeForInput(activity.startTime) : '',
        endTime: activity.endTime ? formatDateTimeForInput(activity.endTime) : '',
        couponStartTime: activity.couponStartTime ? formatDateTimeForInput(activity.couponStartTime) : '',
        couponEndTime: activity.couponEndTime ? formatDateTimeForInput(activity.couponEndTime) : '',
        totalCoupons: activity.totalCoupons || 0,
        maxParticipants: activity.maxParticipants || 0,
        status: activity.status
      })
      showAddDialog.value = true
    }

    const saveActivity = async () => {
      if (!activityFormRef.value) return
      
      await activityFormRef.value.validate(async (valid) => {
        if (valid) {
          saving.value = true
          try {
            if (editingActivity.value) {
              // 更新
              await api.activity.admin.update(activityForm.value)
              ElMessage.success('更新成功')
            } else {
              // 添加
              await api.activity.admin.create(activityForm.value)
              ElMessage.success('添加成功')
            }
            showAddDialog.value = false
            loadActivities()
          } catch (error) {
            ElMessage.error(error.message || '保存失败')
          } finally {
            saving.value = false
          }
        }
      })
    }

    const deleteActivity = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个活动吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.activity.admin.delete(id)
        ElMessage.success('删除成功')
        loadActivities()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    const resetForm = () => {
      editingActivity.value = null
      activityForm.value = {
        name: '',
        type: 1,
        image: '',
        description: '',
        price: null,
        startTime: '',
        endTime: '',
        couponStartTime: '',
        couponEndTime: '',
        totalCoupons: 0,
        maxParticipants: 0,
        status: 0
      }
      if (activityFormRef.value) {
        activityFormRef.value.resetFields()
      }
    }

    const formatDateTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN')
    }

    const formatDateTimeForInput = (time) => {
      if (!time) return ''
      const date = new Date(time)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const getTypeText = (type) => {
      const typeMap = {
        1: '茶艺课',
        2: '茶园参观',
        3: '线下品鉴会',
        4: '制茶体验'
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

    const getStatusText = (status) => {
      const statusMap = {
        0: '未开始',
        1: '进行中',
        2: '已结束',
        3: '已取消'
      }
      return statusMap[status] || '未知'
    }

    const getStatusTag = (status) => {
      const tagMap = {
        0: 'info',
        1: 'success',
        2: 'warning',
        3: 'danger'
      }
      return tagMap[status] || 'info'
    }

    onMounted(() => {
      loadActivities()
    })

    return {
      loading,
      saving,
      showAddDialog,
      editingActivity,
      activities,
      currentPage,
      pageSize,
      total,
      filterType,
      activityForm,
      activityFormRef,
      rules,
      uploadImageUrl,
      uploadHeaders,
      handleImageSuccess,
      beforeImageUpload,
      loadActivities,
      editActivity,
      saveActivity,
      deleteActivity,
      resetForm,
      formatDateTime,
      formatDateTimeForInput,
      getTypeText,
      getTypeTag,
      getStatusText,
      getStatusTag
    }
  }
}
</script>

<style scoped>
.admin-activities {
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

