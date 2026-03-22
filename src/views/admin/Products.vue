<template>
  <div class="admin-products">
    <h2>产品管理</h2>
    <div class="toolbar">
      <el-button type="primary" size="default" @click="showAddDialog = true" style="display: inline-block;">添加产品</el-button>
      <el-button size="default" @click="loadProducts" style="display: inline-block;">刷新</el-button>
    </div>
    
    <!-- 产品列表 -->
    <el-table :data="products" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="产品图片" width="100">
        <template #default="scope">
          <el-image
            :src="scope.row.image || DEFAULT_PRODUCT_IMAGE"
            style="width: 60px; height: 60px;"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="产品名称" width="200"></el-table-column>
      <el-table-column prop="categoryId" label="分类ID" width="100"></el-table-column>
      <el-table-column prop="price" label="价格" width="120">
        <template #default="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100"></el-table-column>
      <el-table-column prop="sales" label="销量" width="100"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editProduct(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteProduct(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadProducts"
      style="margin-top: 20px; text-align: center;"
    />

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingProduct ? '编辑产品' : '添加产品'"
      width="800px"
      @close="resetForm"
    >
      <el-form :model="productForm" label-width="100px" :rules="rules" ref="productFormRef">
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入产品名称"></el-input>
        </el-form-item>
        <el-form-item label="产品分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品图片" prop="image">
          <el-input v-model="productForm.image" placeholder="请输入图片路径，如：/images/product.jpg"></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="productForm.price" :min="0" :precision="2" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="productForm.originalPrice" :min="0" :precision="2" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="productForm.stock" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="productForm.unit" placeholder="如：克、斤、盒"></el-input>
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="productForm.specification" placeholder="请输入规格"></el-input>
        </el-form-item>
        <el-form-item label="产地">
          <el-input v-model="productForm.origin" placeholder="请输入产地"></el-input>
        </el-form-item>
        <el-form-item label="年份">
          <el-input v-model="productForm.year" placeholder="请输入年份"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="产品描述">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入产品描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProduct" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'AdminProducts',
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const showAddDialog = ref(false)
    const editingProduct = ref(null)
    const products = ref([])
    const categories = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const productFormRef = ref(null)

    const productForm = ref({
      name: '',
      categoryId: null,
      image: '',
      price: 0,
      originalPrice: null,
      stock: 0,
      unit: '',
      specification: '',
      origin: '',
      year: '',
      status: 1,
      description: ''
    })

    const rules = {
      name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
      categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
      price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
      stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
    }

    // 加载分类列表
    const loadCategories = async () => {
      try {
        const res = await api.category.getList()
        categories.value = res.data
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    }

    // 加载产品列表
    const loadProducts = async () => {
      loading.value = true
      try {
        const res = await api.product.getList({
          page: currentPage.value - 1,
          size: pageSize.value
        })
        products.value = res.data.content || []
        total.value = res.data.totalElements || 0
      } catch (error) {
        ElMessage.error('加载产品列表失败')
      } finally {
        loading.value = false
      }
    }

    // 编辑产品
    const editProduct = (product) => {
      editingProduct.value = product
      Object.assign(productForm.value, {
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        unit: product.unit || '',
        specification: product.specification || '',
        origin: product.origin || '',
        year: product.year || '',
        status: product.status,
        description: product.description || ''
      })
      showAddDialog.value = true
    }

    // 保存产品
    const saveProduct = async () => {
      if (!productFormRef.value) return
      
      await productFormRef.value.validate(async (valid) => {
        if (valid) {
          saving.value = true
          try {
            if (editingProduct.value) {
              // 更新
              await api.product.update(productForm.value)
              ElMessage.success('更新成功')
            } else {
              // 添加
              await api.product.add(productForm.value)
              ElMessage.success('添加成功')
            }
            showAddDialog.value = false
            loadProducts()
          } catch (error) {
            ElMessage.error(error.message || '保存失败')
          } finally {
            saving.value = false
          }
        }
      })
    }

    // 切换状态
    const toggleStatus = async (product) => {
      try {
        const newStatus = product.status === 1 ? 0 : 1
        await api.product.update({
          id: product.id,
          status: newStatus
        })
        ElMessage.success('操作成功')
        loadProducts()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    // 删除产品
    const deleteProduct = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个产品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.product.delete(id)
        ElMessage.success('删除成功')
        loadProducts()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 重置表单
    const resetForm = () => {
      editingProduct.value = null
      productForm.value = {
        name: '',
        categoryId: null,
        image: '',
        price: 0,
        originalPrice: null,
        stock: 0,
        unit: '',
        specification: '',
        origin: '',
        year: '',
        status: 1,
        description: ''
      }
      if (productFormRef.value) {
        productFormRef.value.resetFields()
      }
    }

    onMounted(() => {
      loadCategories()
      loadProducts()
    })

    return {
      loading,
      DEFAULT_PRODUCT_IMAGE,
      saving,
      showAddDialog,
      editingProduct,
      products,
      categories,
      currentPage,
      pageSize,
      total,
      productForm,
      productFormRef,
      rules,
      loadProducts,
      editProduct,
      saveProduct,
      toggleStatus,
      deleteProduct,
      resetForm
    }
  }
}
</script>

<style scoped>
.admin-products {
  padding: 32px !important;
  background: transparent !important;
  min-height: calc(100vh - 72px);
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

h2 {
  margin-bottom: 32px;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.5;
}

.toolbar {
  margin-bottom: 24px;
  display: flex !important;
  flex-direction: row !important;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.toolbar .el-button {
  min-width: 100px;
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
  border-radius: var(--radius-base);
  font-weight: 500;
  transition: var(--transition-base);
}

.toolbar .el-button--primary {
  background: var(--primary-gradient);
  border: none;
  box-shadow: var(--shadow-sm);
}

.toolbar .el-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.modern-table {
  border-radius: var(--radius-lg);
  overflow: visible;
  box-shadow: var(--shadow-base);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.modern-table :deep(.el-table__inner-wrapper) {
  overflow: visible;
}

.modern-table :deep(.el-table__header-wrapper) {
  overflow: visible;
}

.modern-table :deep(.el-table__header) {
  background: var(--primary-gradient);
  display: table-header-group;
}

.modern-table :deep(.el-table__header th) {
  background: transparent !important;
  color: white !important;
  font-weight: 600;
  border-bottom: none;
  padding: 16px 12px;
  text-align: center;
}

.modern-table :deep(.el-table__header th .cell) {
  color: white !important;
  font-weight: 600;
}

.modern-table :deep(.el-table__header th.is-leaf) {
  color: white !important;
}

.modern-table :deep(.el-table__header th .cell *) {
  color: white !important;
}

.modern-table :deep(.el-table__body tr:hover) {
  background: rgba(102, 126, 234, 0.05);
}

.modern-table :deep(.el-image) {
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
}

.modern-table :deep(.el-tag) {
  border-radius: var(--radius-full);
  font-weight: 500;
  padding: 4px 12px;
}

.modern-table :deep(.el-button) {
  border-radius: var(--radius-base);
  font-weight: 500;
  transition: var(--transition-base);
  margin: 0 4px;
}

.modern-table :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

:deep(.el-pagination) {
  margin-top: 32px;
  justify-content: center;
}

:deep(.el-pagination .el-pager li) {
  border-radius: var(--radius-base);
  transition: var(--transition-base);
}

:deep(.el-pagination .el-pager li.is-active) {
  background: var(--primary-gradient);
  color: white;
}

:deep(.el-dialog) {
  border-radius: var(--radius-xl);
}

:deep(.el-dialog__header) {
  background: var(--primary-gradient);
  padding: 24px 32px;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 700;
  font-size: var(--font-size-lg);
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-regular);
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
  border: 2px solid var(--border-light);
  transition: var(--transition-base);
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-base);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
</style>
