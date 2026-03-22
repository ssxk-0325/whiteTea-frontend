<template>
  <div class="home">
    <el-container>
      <!-- 头部导航 -->
      <el-header>
        <Header />
      </el-header>
      
      <!-- 主要内容 -->
      <el-main>
        <!-- 轮播图 -->
        <div class="banner-container">
          <el-carousel :height="bannerHeight" :interval="5000" arrow="hover" indicator-position="outside">
            <el-carousel-item v-for="item in banners" :key="item.id">
              <div class="banner-item">
                <img :src="item.image" :alt="item.title" @load="onImageLoad" @error="onImageError" />
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 分类导航 -->
        <div class="category-section">
          <h2>产品分类</h2>
          <el-row :gutter="20">
            <el-col :span="6" v-for="category in categories" :key="category.id">
              <el-card class="category-card" @click="goToProducts(category.id)">
                <img :src="category.image || DEFAULT_CATEGORY_IMAGE" :alt="category.name" />
                <h3>{{ category.name }}</h3>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 热门产品 -->
        <div class="products-section">
          <h2>热门产品</h2>
          <el-row :gutter="20">
            <el-col :span="6" v-for="product in hotProducts" :key="product.id">
              <el-card class="product-card" @click="goToProductDetail(product.id)">
                <img :src="product.image || DEFAULT_PRODUCT_IMAGE" :alt="product.name" />
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p class="price">¥{{ product.price }}</p>
                  <el-button type="primary" size="small" @click.stop="addToCart(product.id)">加入购物车</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'
import store from '@/store'
import Header from '@/components/Header.vue'
import { HOME_BANNERS, DEFAULT_CATEGORY_IMAGE, DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'Home',
  components: {
    Header
  },
  setup() {
    const router = useRouter()
    const banners = ref([...HOME_BANNERS])
    const categories = ref([])
    const hotProducts = ref([])
    const bannerHeight = ref('500px')

    // 图片加载成功
    const onImageLoad = (event) => {
      // 可以根据图片实际尺寸调整轮播图高度
      const img = event.target
      if (img.naturalHeight > 0) {
        const aspectRatio = img.naturalWidth / img.naturalHeight
        // 保持宽高比，限制最大高度
        if (aspectRatio > 0) {
          const maxHeight = Math.min(600, window.innerWidth / aspectRatio)
          bannerHeight.value = `${Math.max(400, maxHeight)}px`
        }
      }
    }

    // 图片加载失败
    const onImageError = (event) => {
      console.error('轮播图加载失败:', event.target.src)
      event.target.style.display = 'none'
    }

    const loadCategories = async () => {
      try {
        const res = await api.category.getList()
        categories.value = res.data.slice(0, 4)
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    }

    const loadHotProducts = async () => {
      try {
        const res = await api.product.getHotProducts({ page: 0, size: 4 })
        hotProducts.value = res.data.content
      } catch (error) {
        console.error('加载热门产品失败:', error)
      }
    }

    const goToProducts = (categoryId) => {
      router.push({ name: 'Products', query: { categoryId } })
    }

    const goToProductDetail = (id) => {
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
      loadHotProducts()
    })

    return {
      banners,
      categories,
      hotProducts,
      bannerHeight,
      DEFAULT_CATEGORY_IMAGE,
      DEFAULT_PRODUCT_IMAGE,
      goToProducts,
      goToProductDetail,
      addToCart,
      onImageLoad,
      onImageError
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: transparent;
}

/* 轮播图容器 - 现代化设计 */
.banner-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto 60px;
  overflow: hidden;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  position: relative;
}

/* 轮播图项容器 - 现代化设计 */
.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-gradient);
  overflow: hidden;
  position: relative;
}

.banner-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  z-index: 1;
}

/* 轮播图图片样式 */
.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: var(--transition-slow);
  filter: brightness(0.95);
}

.banner-item:hover img {
  transform: scale(1.08);
  filter: brightness(1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-container {
    margin: 0 auto 20px;
    border-radius: 4px;
  }
}

.category-section,
.products-section {
  margin-top: 80px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 var(--spacing-base);
}

.category-section h2,
.products-section h2 {
  margin-bottom: 32px;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  position: relative;
  padding-bottom: 16px;
}

.category-section h2::after,
.products-section h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
}

/* 分类卡片 - 现代化设计 */
.category-card {
  text-align: center;
  cursor: pointer;
  transition: var(--transition-base);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-primary);
  box-shadow: var(--shadow-base);
  position: relative;
}

.category-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: var(--transition-base);
  z-index: 1;
}

.category-card:hover::before {
  opacity: 0.05;
}

.category-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-xl);
}

.category-card :deep(.el-card__body) {
  padding: 0;
  position: relative;
  z-index: 2;
}

.category-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: var(--transition-base);
}

.category-card:hover img {
  transform: scale(1.1);
}

.category-card h3 {
  padding: 20px;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  transition: var(--transition-base);
}

.category-card:hover h3 {
  color: var(--primary-color);
}

/* 产品卡片 - 现代化设计 */
.product-card {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .category-section,
  .products-section {
    margin-top: 40px;
    padding: 0 var(--spacing-base);
  }
  
  .category-section h2,
  .products-section h2 {
    font-size: var(--font-size-xl);
  }
  
  .banner-container {
    border-radius: var(--radius-md);
    margin-bottom: 32px;
  }
}
</style>

