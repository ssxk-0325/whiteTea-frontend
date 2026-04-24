<template>
  <div class="admin-page">
    <h2>积分商城管理</h2>

    <div class="toolbar">
      <el-button type="primary" @click="openCreate">添加奖品</el-button>
      <el-button @click="loadList">刷新</el-button>
      <el-select v-model="filterType" placeholder="奖品类型" style="width: 160px" clearable @change="handleFilterChange">
        <el-option label="全部类型" :value="null" />
        <el-option label="实物奖品" :value="1" />
        <el-option label="优惠券" :value="2" />
        <el-option label="虚拟奖品" :value="3" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="上架状态" style="width: 140px" clearable @change="handleFilterChange">
        <el-option label="全部状态" :value="null" />
        <el-option label="上架" :value="1" />
        <el-option label="下架" :value="0" />
      </el-select>
      <el-input
        v-model="keyword"
        placeholder="搜索奖品名称"
        class="toolbar-search"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <el-table :data="rows" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="72" />
      <el-table-column label="图片" width="88">
        <template #default="scope">
          <el-image
            :src="scope.row.image || DEFAULT_PRODUCT_IMAGE"
            style="width: 56px; height: 56px"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
      <el-table-column label="类型" width="110">
        <template #default="scope">
          <el-tag :type="typeTag(scope.row.type)">{{ typeText(scope.row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="pointsRequired" label="所需积分" width="110" />
      <el-table-column label="券规则" width="120" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="scope.row.type === 2">{{ couponRuleText(scope.row.couponDiscountType) }}</span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" width="100">
        <template #default="scope">
          {{ scope.row.stock === null || scope.row.stock === undefined ? '不限' : scope.row.stock }}
        </template>
      </el-table-column>
      <el-table-column prop="totalExchanged" label="已兑" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadList"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑奖品' : '添加奖品'"
      width="560px"
      destroy-on-close
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="奖品名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
            <el-option label="实物奖品" :value="1" />
            <el-option label="优惠券" :value="2" />
            <el-option label="虚拟奖品" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 2" label="抵扣规则" prop="couponDiscountType">
          <el-select v-model="form.couponDiscountType" placeholder="下单抵扣金额（与结算页一致）" style="width: 100%">
            <el-option label="减 20 元（不超过商品总额）" :value="1" />
            <el-option label="减 30 元" :value="2" />
            <el-option label="减 50 元" :value="3" />
            <el-option label="减 80 元" :value="4" />
            <el-option label="减 5%（按商品总额）" :value="5" />
            <el-option label="减 12%（按商品总额）" :value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="所需积分" prop="pointsRequired">
          <el-input-number v-model="form.pointsRequired" :min="1" :max="9999999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
            <el-checkbox v-model="stockUnlimited">不限库存</el-checkbox>
            <el-input-number
              v-if="!stockUnlimited"
              v-model="form.stock"
              :min="0"
              :max="9999999"
              style="width: 200px"
            />
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="99999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="奖品图片" prop="image">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <el-upload
              :action="uploadImageUrl"
              :headers="uploadHeaders"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload"
              :show-file-list="false"
            >
              <el-button type="primary">上传图片</el-button>
            </el-upload>
            <el-input
              v-model="form.image"
              placeholder="如 /images/reward.jpg 或完整 URL"
              style="width: 280px"
            />
          </div>
          <el-image
            :src="form.image || DEFAULT_PRODUCT_IMAGE"
            style="margin-top: 10px; width: 80px; height: 80px"
            fit="cover"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="选填" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import store from '@/store'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'AdminRewards',
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const rows = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const filterType = ref(null)
    const filterStatus = ref(null)
    const keyword = ref('')

    const dialogVisible = ref(false)
    const editingId = ref(null)
    const formRef = ref(null)
    const stockUnlimited = ref(false)
    const uploadImageUrl = computed(() => '/api/upload/image')
    const uploadHeaders = computed(() => {
      const token = store.state.user.token
      return token ? { Authorization: `Bearer ${token}` } : {}
    })

    const defaultForm = () => ({
      name: '',
      description: '',
      image: '',
      pointsRequired: 100,
      stock: 0,
      type: 1,
      couponDiscountType: 1,
      status: 1,
      sortOrder: 0
    })

    const form = ref(defaultForm())

    const rules = {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      type: [{ required: true, message: '请选择类型', trigger: 'change' }],
      pointsRequired: [{ required: true, message: '请设置所需积分', trigger: 'change' }],
      sortOrder: [{ required: true, message: '请设置排序', trigger: 'change' }],
      status: [{ required: true, message: '请选择状态', trigger: 'change' }]
    }

    const typeText = (t) =>
      ({ 1: '实物', 2: '优惠券', 3: '虚拟' }[t] || '未知')

    const couponRuleText = (rule) =>
      ({
        1: '减20元',
        2: '减30元',
        3: '减50元',
        4: '减80元',
        5: '减5%',
        6: '减12%'
      }[rule] || '减20元')

    const typeTag = (t) =>
      ({ 1: 'primary', 2: 'warning', 3: 'success' }[t] || 'info')

    const loadList = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        if (filterType.value != null) params.type = filterType.value
        if (filterStatus.value != null) params.status = filterStatus.value
        if (keyword.value) params.keyword = keyword.value.trim()

        const res = await api.reward.admin.getList(params)
        rows.value = res.data?.records || []
        total.value = res.data?.total || 0
      } catch (e) {
        ElMessage.error(e.message || '加载失败')
      } finally {
        loading.value = false
      }
    }

    const handleFilterChange = () => {
      currentPage.value = 1
      loadList()
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadList()
    }

    watch(stockUnlimited, (unlimited) => {
      if (unlimited) {
        form.value.stock = 0
      }
    })

    const openCreate = () => {
      editingId.value = null
      stockUnlimited.value = false
      form.value = defaultForm()
      dialogVisible.value = true
    }

    const handleImageSuccess = (response) => {
      if (response.code === 200) {
        form.value.image = response.data
        ElMessage.success('图片上传成功')
      } else {
        ElMessage.error(response.message || '图片上传失败')
      }
    }

    const beforeImageUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isImage) {
        ElMessage.error('只能上传图片文件')
        return false
      }
      if (!isLt10M) {
        ElMessage.error('图片大小不能超过10MB')
        return false
      }
      return true
    }

    const openEdit = (row) => {
      editingId.value = row.id
      const su = row.stock === null || row.stock === undefined
      stockUnlimited.value = su
      form.value = {
        name: row.name,
        description: row.description || '',
        image: row.image || '',
        pointsRequired: row.pointsRequired,
        stock: su ? 0 : row.stock,
        type: row.type ?? 1,
        couponDiscountType: row.couponDiscountType != null ? row.couponDiscountType : 1,
        status: row.status ?? 1,
        sortOrder: row.sortOrder ?? 0
      }
      dialogVisible.value = true
    }

    const resetForm = () => {
      editingId.value = null
      form.value = defaultForm()
      stockUnlimited.value = false
      if (formRef.value) formRef.value.resetFields()
    }

    const buildPayload = () => {
      const payload = {
        name: form.value.name,
        description: form.value.description || null,
        image: form.value.image || null,
        pointsRequired: form.value.pointsRequired,
        stock: stockUnlimited.value ? null : form.value.stock,
        type: form.value.type,
        status: form.value.status,
        sortOrder: form.value.sortOrder
      }
      if (form.value.type === 2) {
        payload.couponDiscountType = form.value.couponDiscountType ?? 1
      }
      if (editingId.value) payload.id = editingId.value
      return payload
    }

    const submit = async () => {
      if (!formRef.value) return
      try {
        await formRef.value.validate()
      } catch {
        return
      }
      if (!stockUnlimited.value && (form.value.stock === null || form.value.stock === undefined)) {
        ElMessage.warning('请填写库存或勾选不限库存')
        return
      }
      saving.value = true
      try {
        const payload = buildPayload()
        if (editingId.value) {
          await api.reward.admin.update(payload)
          ElMessage.success('更新成功')
        } else {
          await api.reward.admin.create(payload)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadList()
      } catch (e) {
        ElMessage.error(e.message || '保存失败')
      } finally {
        saving.value = false
      }
    }

    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(`确定删除奖品「${row.name}」吗？`, '提示', {
          type: 'warning',
          confirmButtonText: '删除',
          cancelButtonText: '取消'
        })
        await api.reward.admin.delete(row.id)
        ElMessage.success('已删除')
        loadList()
      } catch (e) {
        if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
      }
    }

    onMounted(() => {
      loadList()
    })

    return {
      loading,
      saving,
      rows,
      currentPage,
      pageSize,
      total,
      filterType,
      filterStatus,
      keyword,
      dialogVisible,
      editingId,
      formRef,
      form,
      rules,
      stockUnlimited,
      DEFAULT_PRODUCT_IMAGE,
      typeText,
      couponRuleText,
      typeTag,
      loadList,
      handleFilterChange,
      handleSearch,
      openCreate,
      openEdit,
      uploadImageUrl,
      uploadHeaders,
      handleImageSuccess,
      beforeImageUpload,
      resetForm,
      submit,
      handleDelete
    }
  }
}
</script>
