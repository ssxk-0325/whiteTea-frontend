<template>
  <div class="admin-categories">
    <h2>分类管理</h2>
    <div class="toolbar">
      <el-button type="primary" size="default" @click="showAddDialog = true" style="display: inline-block;">添加分类</el-button>
      <el-button size="default" @click="loadCategories" style="display: inline-block;">刷新</el-button>
    </div>
    
    <!-- 分类列表 -->
    <el-table :data="categories" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="分类图片" width="100">
        <template #default="scope">
          <el-image
            :src="scope.row.image || DEFAULT_CATEGORY_IMAGE"
            style="width: 60px; height: 60px;"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="分类名称" width="200"></el-table-column>
      <el-table-column prop="parentId" label="父分类ID" width="120">
        <template #default="scope">
          {{ scope.row.parentId === 0 ? '顶级分类' : scope.row.parentId }}
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editCategory(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteCategory(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingCategory ? '编辑分类' : '添加分类'"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="categoryForm" label-width="100px" :rules="rules" ref="categoryFormRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="父分类">
          <el-select v-model="categoryForm.parentId" placeholder="请选择父分类" style="width: 100%">
            <el-option label="顶级分类" :value="0" />
            <template v-for="category in categories" :key="category.id">
              <el-option
                v-if="!editingCategory || category.id !== editingCategory.id"
                :label="category.name"
                :value="category.id"
              />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="分类图片">
          <el-input v-model="categoryForm.image" placeholder="请输入图片路径，如：/images/category.jpg"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCategory" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import { DEFAULT_CATEGORY_IMAGE } from '@/constants/assets'

export default {
  name: 'AdminCategories',
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const showAddDialog = ref(false)
    const editingCategory = ref(null)
    const categories = ref([])
    const categoryFormRef = ref(null)

    const categoryForm = ref({
      name: '',
      parentId: 0,
      image: '',
      sortOrder: 0,
      status: 1,
      description: ''
    })

    const rules = {
      name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
    }

    // 加载分类列表
    const loadCategories = async () => {
      loading.value = true
      try {
        // 管理后台需要获取所有分类（包括禁用的）
        const res = await api.category.getAll()
        categories.value = res.data
      } catch (error) {
        ElMessage.error('加载分类列表失败')
      } finally {
        loading.value = false
      }
    }

    // 编辑分类
    const editCategory = (category) => {
      editingCategory.value = category
      Object.assign(categoryForm.value, {
        id: category.id,
        name: category.name,
        parentId: category.parentId,
        image: category.image || '',
        sortOrder: category.sortOrder,
        status: category.status,
        description: category.description || ''
      })
      showAddDialog.value = true
    }

    // 保存分类
    const saveCategory = async () => {
      if (!categoryFormRef.value) return
      
      await categoryFormRef.value.validate(async (valid) => {
        if (valid) {
          saving.value = true
          try {
            if (editingCategory.value) {
              // 更新
              await api.category.update(categoryForm.value)
              ElMessage.success('更新成功')
            } else {
              // 添加
              await api.category.add(categoryForm.value)
              ElMessage.success('添加成功')
            }
            showAddDialog.value = false
            loadCategories()
          } catch (error) {
            ElMessage.error(error.message || '保存失败')
          } finally {
            saving.value = false
          }
        }
      })
    }

    // 切换状态
    const toggleStatus = async (category) => {
      try {
        const newStatus = category.status === 1 ? 0 : 1
        await api.category.update({
          id: category.id,
          status: newStatus
        })
        ElMessage.success('操作成功')
        loadCategories()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    // 删除分类
    const deleteCategory = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // TODO: 需要后端添加删除接口
        ElMessage.warning('删除功能需要后端支持')
      } catch (error) {
        // 用户取消
      }
    }

    // 重置表单
    const resetForm = () => {
      editingCategory.value = null
      categoryForm.value = {
        name: '',
        parentId: 0,
        image: '',
        sortOrder: 0,
        status: 1,
        description: ''
      }
      if (categoryFormRef.value) {
        categoryFormRef.value.resetFields()
      }
    }

    onMounted(() => {
      loadCategories()
    })

    return {
      loading,
      DEFAULT_CATEGORY_IMAGE,
      saving,
      showAddDialog,
      editingCategory,
      categories,
      categoryForm,
      categoryFormRef,
      rules,
      loadCategories,
      editCategory,
      saveCategory,
      toggleStatus,
      deleteCategory,
      resetForm
    }
  }
}
</script>

<style scoped>
.admin-categories {
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

