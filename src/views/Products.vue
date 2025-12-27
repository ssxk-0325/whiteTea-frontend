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
}

.sidebar {
  background-color: #fff;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.sidebar h3 {
  margin-bottom: 15px;
  color: #333;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 10px 0;
}

.product-info h3 {
  font-size: 16px;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-info .price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.search-bar {
  margin-bottom: 20px;
}
</style>

