<template>
  <div class="products-page">
    <Header />
    <el-container>
      <el-aside width="200px" class="sidebar">
        <h3>产品分类</h3>
        <el-menu :default-active="activeCategory" @select="handleCategorySelect">
          <el-menu-item index="0">全部</el-menu-item>
          <el-menu-item v-for="category in categories" :key="category.id" :index="String(category.id)">
            {{ category.name }}
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <div class="search-bar">
          <el-input
            v-model="keyword"
            placeholder="搜索产品"
            @keyup.enter="handleSearch"
            style="width: 300px; margin-right: 10px;"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        <el-row :gutter="20">
          <el-col :span="6" v-for="product in products" :key="product.id">
            <el-card class="product-card" @click="goToDetail(product.id)">
              <img :src="product.image || '/default-product.png'" :alt="product.name" />
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="price">¥{{ product.price }}</p>
                <el-button type="primary" size="small" @click.stop="addToCart(product.id)">加入购物车</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadProducts"
          style="margin-top: 20px; text-align: center;"
        />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'Products',
  components: {
    Header
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()

    const categories = ref([])
    const products = ref([])
    const keyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(12)
    const total = ref(0)
    const activeCategory = ref('0')

    const loadCategories = async () => {
      try {
        const res = await api.category.getList()
        categories.value = res.data
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    }

    const loadProducts = async () => {
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        if (activeCategory.value !== '0') {
          params.categoryId = Number(activeCategory.value)
        }
        if (keyword.value) {
          params.keyword = keyword.value
        }
        const res = await api.product.getList(params)
        products.value = res.data.content
        total.value = res.data.totalElements
      } catch (error) {
        console.error('加载产品失败:', error)
      }
    }

    const handleCategorySelect = (key) => {
      activeCategory.value = key
      currentPage.value = 1
      loadProducts()
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadProducts()
    }

    const goToDetail = (id) => {
      // 检查是否登录，未登录则跳转到登录页
      if (!store.state.user.token) {
        ElMessage.warning('请先登录')
        router.push({
          path: '/login',
          query: { redirect: `/product/${id}` }
        })
        return
      }
      router.push({ name: 'ProductDetail', params: { id } })
    }

    const addToCart = async (productId) => {
      if (!store.state.user.token) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      try {
        await store.dispatch('cart/addToCart', { productId, quantity: 1 })
        ElMessage.success('已加入购物车')
      } catch (error) {
        ElMessage.error('加入购物车失败')
      }
    }

    onMounted(() => {
      loadCategories()
      if (route.query.categoryId) {
        activeCategory.value = String(route.query.categoryId)
      }
      loadProducts()
    })

    return {
      categories,
      products,
      keyword,
      currentPage,
      pageSize,
      total,
      activeCategory,
      loadProducts,
      handleCategorySelect,
      handleSearch,
      goToDetail,
      addToCart
    }
  }
}
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: transparent;
}

.sidebar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 32px 24px;
  min-height: calc(100vh - 72px);
  border-radius: var(--radius-lg);
  margin: 20px;
  box-shadow: var(--shadow-base);
}

.sidebar h3 {
  margin-bottom: 24px;
  font-size: var(--font-size-lg);
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar :deep(.el-menu) {
  border: none;
  background: transparent;
}

.sidebar :deep(.el-menu-item) {
  border-radius: var(--radius-base);
  margin-bottom: 8px;
  transition: var(--transition-base);
  font-weight: 500;
}

.sidebar :deep(.el-menu-item:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: var(--primary-color);
}

.sidebar :deep(.el-menu-item.is-active) {
  background: var(--primary-gradient);
  color: white;
  border-color: transparent;
}

.el-main {
  padding: 20px 32px;
}

.search-bar {
  margin-bottom: 32px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-bar :deep(.el-input) {
  flex: 1;
  max-width: 500px;
}

.search-bar :deep(.el-input__wrapper) {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
}

.search-bar :deep(.el-input__wrapper:hover) {
  box-shadow: var(--shadow-base);
}

.search-bar :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-bar :deep(.el-button) {
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 500;
  padding: 12px 24px;
}

.product-card {
  margin-bottom: 24px;
  cursor: pointer;
  transition: var(--transition-base);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-primary);
  box-shadow: var(--shadow-base);
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: var(--transition-base);
  z-index: 1;
}

.product-card:hover::before {
  opacity: 0.03;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.product-card :deep(.el-card__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  z-index: 2;
}

.product-card img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  transition: var(--transition-base);
}

.product-card:hover img {
  transform: scale(1.08);
}

.product-info {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-info h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}

.product-info .price {
  color: var(--danger-color);
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.product-info :deep(.el-button) {
  margin-top: auto;
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-weight: 500;
  border-radius: var(--radius-base);
  transition: var(--transition-base);
}

.product-info :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

:deep(.el-pagination) {
  margin-top: 40px;
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

/* 响应式 */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  
  .el-main {
    padding: 16px;
  }
}
</style>

