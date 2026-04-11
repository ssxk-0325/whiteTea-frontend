<template>
  <div class="admin-page">
    <h2>产品管理</h2>
    <el-tabs v-model="activeTab" class="product-admin-tabs" @tab-change="onTabChange">
      <el-tab-pane label="产品列表" name="products">
        <div class="toolbar">
          <el-button type="primary" size="default" @click="openAddProduct">添加产品</el-button>
          <el-button size="default" @click="loadProducts">刷新</el-button>
        </div>

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
          <el-table-column prop="name" label="产品名称" min-width="200"></el-table-column>
          <el-table-column label="分类" min-width="120">
            <template #default="scope">
              {{ categoryNameById[scope.row.categoryId] ?? '—' }}
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" min-width="110">
            <template #default="scope">
              ¥{{ scope.row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" min-width="90"></el-table-column>
          <el-table-column prop="sales" label="销量" min-width="90"></el-table-column>
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
                {{ scope.row.status === 1 ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="280" fixed="right" align="center" header-align="center">
            <template #default="scope">
              <div class="admin-table-actions">
                <el-button size="small" @click="editProduct(scope.row)">编辑</el-button>
                <el-button
                  size="small"
                  :type="scope.row.status === 1 ? 'warning' : 'success'"
                  @click="toggleStatus(scope.row)"
                >
                  {{ scope.row.status === 1 ? '下架' : '上架' }}
                </el-button>
                <el-button size="small" type="danger" @click="deleteProduct(scope.row.id)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadProducts"
          style="margin-top: 20px; text-align: center;"
        />
      </el-tab-pane>

      <el-tab-pane label="分类管理" name="categories">
        <div class="toolbar">
          <el-button type="primary" size="default" @click="showCategoryDialog = true">添加分类</el-button>
          <el-button size="default" @click="loadAdminCategories">刷新</el-button>
        </div>

        <el-table :data="adminCategories" style="width: 100%" v-loading="categoryLoading">
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
          <el-table-column prop="name" label="分类名称" min-width="180"></el-table-column>
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
          <el-table-column label="操作" min-width="280" fixed="right" align="center" header-align="center">
            <template #default="scope">
              <div class="admin-table-actions">
                <el-button size="small" @click="editCategory(scope.row)">编辑</el-button>
                <el-button
                  size="small"
                  :type="scope.row.status === 1 ? 'warning' : 'success'"
                  @click="toggleCategoryStatus(scope.row)"
                >
                  {{ scope.row.status === 1 ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" @click="deleteCategory(scope.row.id)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 产品对话框 -->
    <el-dialog
      v-model="showProductDialog"
      :title="editingProduct ? '编辑产品' : '添加产品'"
      width="800px"
      @close="resetProductForm"
    >
      <el-form :model="productForm" label-width="100px" :rules="productRules" ref="productFormRef">
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入产品名称"></el-input>
        </el-form-item>
        <el-form-item label="产品分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in enabledCategoryOptions"
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
        <el-button @click="showProductDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProduct" :loading="savingProduct">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分类对话框 -->
    <el-dialog
      v-model="showCategoryDialog"
      :title="editingCategory ? '编辑分类' : '添加分类'"
      width="600px"
      @close="resetCategoryForm"
    >
      <el-form :model="categoryForm" label-width="100px" :rules="categoryRules" ref="categoryFormRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="父分类">
          <el-select v-model="categoryForm.parentId" placeholder="请选择父分类" style="width: 100%">
            <el-option label="顶级分类" :value="0" />
            <template v-for="category in adminCategories" :key="category.id">
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
        <el-button @click="showCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCategory" :loading="savingCategory">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import { DEFAULT_PRODUCT_IMAGE, DEFAULT_CATEGORY_IMAGE } from '@/constants/assets'

export default {
  name: 'AdminProducts',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const activeTab = ref('products')
    const loading = ref(false)
    const savingProduct = ref(false)
    const showProductDialog = ref(false)
    const editingProduct = ref(null)
    const products = ref([])
    const adminCategories = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const productFormRef = ref(null)

    const categoryLoading = ref(false)
    const savingCategory = ref(false)
    const showCategoryDialog = ref(false)
    const editingCategory = ref(null)
    const categoryFormRef = ref(null)

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

    const categoryForm = ref({
      name: '',
      parentId: 0,
      image: '',
      sortOrder: 0,
      status: 1,
      description: ''
    })

    const productRules = {
      name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
      categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
      price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
      stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
    }

    const categoryRules = {
      name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
    }

    const categoryNameById = computed(() => {
      const m = {}
      adminCategories.value.forEach((c) => {
        m[c.id] = c.name
      })
      return m
    })

    const enabledCategoryOptions = computed(() =>
      adminCategories.value.filter((c) => c.status === 1)
    )

    const syncTabFromRoute = () => {
      activeTab.value = route.query.tab === 'categories' ? 'categories' : 'products'
    }

    const onTabChange = (name) => {
      if (name === 'categories') {
        router.replace({ path: '/admin/products', query: { ...route.query, tab: 'categories' } })
      } else {
        const q = { ...route.query }
        delete q.tab
        router.replace({ path: '/admin/products', query: q })
      }
    }

    const loadAdminCategories = async () => {
      categoryLoading.value = true
      try {
        const res = await api.category.getAll()
        adminCategories.value = res.data
      } catch (error) {
        ElMessage.error('加载分类列表失败')
      } finally {
        categoryLoading.value = false
      }
    }

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

    const openAddProduct = () => {
      showProductDialog.value = true
    }

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
      showProductDialog.value = true
    }

    const saveProduct = async () => {
      if (!productFormRef.value) return

      await productFormRef.value.validate(async (valid) => {
        if (valid) {
          savingProduct.value = true
          try {
            if (editingProduct.value) {
              await api.product.update(productForm.value)
              ElMessage.success('更新成功')
            } else {
              await api.product.add(productForm.value)
              ElMessage.success('添加成功')
            }
            showProductDialog.value = false
            loadProducts()
          } catch (error) {
            ElMessage.error(error.message || '保存失败')
          } finally {
            savingProduct.value = false
          }
        }
      })
    }

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

    const resetProductForm = () => {
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
      showCategoryDialog.value = true
    }

    const saveCategory = async () => {
      if (!categoryFormRef.value) return

      await categoryFormRef.value.validate(async (valid) => {
        if (valid) {
          savingCategory.value = true
          try {
            if (editingCategory.value) {
              await api.category.update(categoryForm.value)
              ElMessage.success('更新成功')
            } else {
              await api.category.add(categoryForm.value)
              ElMessage.success('添加成功')
            }
            showCategoryDialog.value = false
            loadAdminCategories()
          } catch (error) {
            ElMessage.error(error.message || '保存失败')
          } finally {
            savingCategory.value = false
          }
        }
      })
    }

    const toggleCategoryStatus = async (category) => {
      try {
        const newStatus = category.status === 1 ? 0 : 1
        await api.category.update({
          id: category.id,
          status: newStatus
        })
        ElMessage.success('操作成功')
        loadAdminCategories()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    const deleteCategory = async (_id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        ElMessage.warning('删除功能需要后端支持')
      } catch (error) {
        // 用户取消
      }
    }

    const resetCategoryForm = () => {
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

    watch(
      () => route.query.tab,
      () => {
        syncTabFromRoute()
      }
    )

    onMounted(() => {
      syncTabFromRoute()
      loadAdminCategories()
      loadProducts()
    })

    return {
      activeTab,
      onTabChange,
      loading,
      savingProduct,
      showProductDialog,
      editingProduct,
      products,
      adminCategories,
      currentPage,
      pageSize,
      total,
      productForm,
      productFormRef,
      productRules,
      categoryLoading,
      savingCategory,
      showCategoryDialog,
      editingCategory,
      categoryForm,
      categoryFormRef,
      categoryRules,
      DEFAULT_PRODUCT_IMAGE,
      DEFAULT_CATEGORY_IMAGE,
      categoryNameById,
      enabledCategoryOptions,
      loadProducts,
      loadAdminCategories,
      openAddProduct,
      editProduct,
      saveProduct,
      toggleStatus,
      deleteProduct,
      resetProductForm,
      editCategory,
      saveCategory,
      toggleCategoryStatus,
      deleteCategory,
      resetCategoryForm
    }
  }
}
</script>

<style scoped>
.product-admin-tabs {
  margin-top: 8px;
}

.product-admin-tabs :deep(.el-tabs__content) {
  padding-top: 12px;
}
</style>
