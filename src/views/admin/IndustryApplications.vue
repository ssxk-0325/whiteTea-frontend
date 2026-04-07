<template>
  <div class="admin-page">
    <h2>产业服务报名审核</h2>

    <div class="toolbar">
      <el-button size="default" @click="loadList">刷新</el-button>
      <el-select v-model="filterStatus" @change="loadList" style="width: 160px" clearable>
        <el-option label="全部状态" :value="null" />
        <el-option label="待审核" :value="0" />
        <el-option label="通过" :value="1" />
        <el-option label="驳回" :value="2" />
      </el-select>
      <el-select v-model="filterType" @change="loadList" style="width: 160px" clearable>
        <el-option label="全部类型" :value="null" />
        <el-option label="采摘招募" :value="5" />
        <el-option label="批发与培训" :value="6" />
      </el-select>
      <el-input
        v-model="keyword"
        placeholder="搜索姓名/手机号/备注"
        style="width: 260px"
        clearable
        @keyup.enter="loadList"
      >
        <template #append>
          <el-button @click="loadList">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-table :data="rows" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="activityName" label="信息标题" min-width="220" />
      <el-table-column label="类型" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.activityType === 5 ? 'primary' : 'warning'">
            {{ scope.row.activityType === 5 ? '采摘招募' : '批发与培训' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="realName" label="姓名" width="120" />
      <el-table-column prop="phone" label="手机号" width="140" />
      <el-table-column prop="location" label="所在地" width="160" />
      <el-table-column prop="remark" label="备注" min-width="220" />
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusTag(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="adminRemark" label="审核备注" min-width="200" />
      <el-table-column prop="createTime" label="提交时间" width="170">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button size="small" type="success" :disabled="scope.row.status !== 0" @click="openReview(scope.row, 1)">通过</el-button>
          <el-button size="small" type="danger" :disabled="scope.row.status !== 0" @click="openReview(scope.row, 2)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadList"
      style="margin-top: 20px; text-align: center;"
    />

    <el-dialog v-model="showReviewDialog" :title="reviewStatus === 1 ? '通过申请' : '驳回申请'" width="520px" @close="resetReview">
      <el-form :model="reviewForm" label-width="90px" ref="reviewFormRef">
        <el-form-item label="审核备注">
          <el-input v-model="reviewForm.adminRemark" type="textarea" :rows="3" placeholder="可填写联系方式、时间安排等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReviewDialog = false">取消</el-button>
        <el-button type="primary" :loading="reviewing" @click="submitReview">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'

export default {
  name: 'IndustryApplications',
  setup() {
    const loading = ref(false)
    const rows = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const filterStatus = ref(null)
    const filterType = ref(null)
    const keyword = ref('')

    const showReviewDialog = ref(false)
    const reviewing = ref(false)
    const reviewFormRef = ref(null)
    const reviewForm = ref({ adminRemark: '' })
    const reviewId = ref(null)
    const reviewStatus = ref(1)

    const loadList = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        if (filterStatus.value !== null) params.status = filterStatus.value
        if (filterType.value !== null) params.type = filterType.value
        if (keyword.value) params.keyword = keyword.value

        const res = await api.activity.admin.getIndustryJoins(params)
        rows.value = res.data.records || []
        total.value = res.data.total || 0
      } catch (e) {
        ElMessage.error(e.message || '加载列表失败')
      } finally {
        loading.value = false
      }
    }

    const getStatusText = (s) => ({ 0: '待审核', 1: '通过', 2: '驳回' }[s] || '未知')
    const getStatusTag = (s) => ({ 0: 'warning', 1: 'success', 2: 'danger' }[s] || 'info')

    const formatDateTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN')
    }

    const openReview = (row, status) => {
      reviewId.value = row.id
      reviewStatus.value = status
      reviewForm.value.adminRemark = ''
      showReviewDialog.value = true
    }

    const resetReview = () => {
      reviewId.value = null
      reviewStatus.value = 1
      reviewForm.value = { adminRemark: '' }
      if (reviewFormRef.value) reviewFormRef.value.resetFields()
    }

    const submitReview = async () => {
      if (!reviewId.value) return
      reviewing.value = true
      try {
        await api.activity.admin.reviewIndustryJoin(reviewId.value, {
          status: reviewStatus.value,
          adminRemark: reviewForm.value.adminRemark
        })
        ElMessage.success('审核成功')
        showReviewDialog.value = false
        loadList()
      } catch (e) {
        ElMessage.error(e.message || '审核失败')
      } finally {
        reviewing.value = false
      }
    }

    onMounted(() => {
      loadList()
    })

    return {
      loading,
      rows,
      currentPage,
      pageSize,
      total,
      filterStatus,
      filterType,
      keyword,
      loadList,
      getStatusText,
      getStatusTag,
      formatDateTime,
      showReviewDialog,
      reviewing,
      reviewFormRef,
      reviewForm,
      reviewStatus,
      openReview,
      resetReview,
      submitReview
    }
  }
}
</script>

