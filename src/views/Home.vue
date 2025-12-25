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
                <img :src="category.image || '/default-category.png'" :alt="category.name" />
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
                <img :src="product.image || '/default-product.png'" :alt="product.name" />
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

export default {
  name: 'Home',
  components: {
    Header
  },
  setup() {
    const router = useRouter()
    const banners = ref([
      { id: 1, title: '福鼎白茶', image: '/images/福鼎白茶.jpg' },
      { id: 2, title: '优质茶叶', image: '/images/优质茶叶.jpg' }
    ])
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
}

/* 轮播图容器 */
.banner-container {
  width: 100%;
  max-width: 1920px;
  margin: 0 auto 40px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 轮播图项容器 */
.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
  position: relative;
}

/* 轮播图图片样式 - 填充容器，保持比例 */
.banner-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.banner-item:hover img {
  transform: scale(1.05);
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
  margin-top: 40px;
}

.category-section h2,
.products-section h2 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.category-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.product-card {
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
</style>

