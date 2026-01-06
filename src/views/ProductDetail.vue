<template>
  <div class="product-detail-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1400px; margin: 0 auto; padding: 40px 32px;">
        <el-card class="detail-card" v-loading="loading">
          <el-row :gutter="60">
            <el-col :span="12">
              <div class="image-container">
                <el-image 
                  :src="product.image || '/default-product.png'" 
                  fit="contain" 
                  class="product-image"
                  :preview-src-list="[product.image || '/default-product.png']"
                />
              </div>
            </el-col>
            <el-col :span="12">
              <div class="product-header">
                <h1 class="product-title">{{ product.name }}</h1>
                <div class="price-section">
                  <span class="current-price">¥{{ product.price }}</span>
                  <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
                </div>
              </div>
              
              <el-divider class="modern-divider" />
              
              <div class="product-info-card">
                <div class="info-item">
                  <span class="info-label">分类</span>
                  <span class="info-value">{{ categoryName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">库存</span>
                  <span class="info-value">{{ product.stock }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">销量</span>
                  <span class="info-value">{{ product.sales }}</span>
                </div>
                <div class="info-item" v-if="product.origin">
                  <span class="info-label">产地</span>
                  <span class="info-value">{{ product.origin }}</span>
                </div>
                <div class="info-item" v-if="product.year">
                  <span class="info-label">年份</span>
                  <span class="info-value">{{ product.year }}</span>
                </div>
              </div>
              
              <el-divider class="modern-divider" />
              
              <div class="quantity-section">
                <span class="quantity-label">数量：</span>
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="product.stock"
                  :controls-position="'right'"
                  class="quantity-input"
                />
              </div>
              
              <div class="action-buttons">
                <el-button 
                  type="primary" 
                  size="large" 
                  @click="addToCart"
                  class="gradient-button"
                >
                  加入购物车
                </el-button>
                <el-button 
                  type="danger" 
                  size="large"
                  class="danger-button"
                >
                  立即购买
                </el-button>
              </div>
              
              <el-divider class="modern-divider" />
              
              <div class="description-card">
                <h3 class="description-title">产品描述</h3>
                <div class="description-content" v-html="product.description"></div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'ProductDetail',
  components: {
    Header
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const product = ref({})
    const categoryName = ref('')
    const quantity = ref(1)

    const loadProduct = async () => {
      loading.value = true
      try {
        const res = await api.product.getById(route.params.id)
        product.value = res.data
        if (product.value.categoryId) {
          const categories = await api.category.getList()
          const category = categories.data.find(c => c.id === product.value.categoryId)
          if (category) {
            categoryName.value = category.name
          }
        }
      } catch (error) {
        ElMessage.error('加载产品详情失败')
      } finally {
        loading.value = false
      }
    }

    const addToCart = async () => {
      if (!store.state.user.token) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      try {
        await store.dispatch('cart/addToCart', {
          productId: product.value.id,
          quantity: quantity.value
        })
        ElMessage.success('已加入购物车')
      } catch (error) {
        ElMessage.error('加入购物车失败')
      }
    }

    onMounted(() => {
      loadProduct()
    })

    return {
      loading,
      product,
      categoryName,
      quantity,
      addToCart
    }
  }
}
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background: transparent;
}

.detail-card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.detail-card :deep(.el-card__body) {
  padding: 40px;
}

.image-container {
  position: sticky;
  top: 100px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--bg-secondary);
  padding: 20px;
}

.product-image {
  width: 100%;
  border-radius: var(--radius-base);
  transition: var(--transition-base);
}

.product-image:hover {
  transform: scale(1.02);
}

.product-header {
  margin-bottom: 24px;
}

.product-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  line-height: 1.3;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 40px;
  font-weight: 700;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.original-price {
  font-size: var(--font-size-lg);
  color: var(--text-placeholder);
  text-decoration: line-through;
}

.modern-divider {
  margin: 32px 0;
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-base), transparent);
}

.product-info-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin: 24px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-lighter);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: var(--text-regular);
  font-size: var(--font-size-base);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-base);
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.quantity-label {
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--text-regular);
}

.quantity-input {
  flex: 1;
  max-width: 200px;
}

.quantity-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin: 32px 0;
}

.gradient-button {
  flex: 1;
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-base);
  height: 50px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
}

.gradient-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.danger-button {
  flex: 1;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  border: none;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-base);
  height: 50px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
}

.danger-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.description-card {
  margin-top: 40px;
  padding: 32px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.description-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
  position: relative;
  padding-bottom: 12px;
}

.description-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
}

.description-content {
  line-height: 1.8;
  color: var(--text-regular);
  font-size: var(--font-size-base);
}

.description-content :deep(p) {
  margin-bottom: 16px;
}

.description-content :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-base);
  margin: 16px 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .detail-card :deep(.el-card__body) {
    padding: 20px;
  }
  
  .product-title {
    font-size: var(--font-size-xl);
  }
  
  .current-price {
    font-size: var(--font-size-2xl);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .image-container {
    position: static;
    margin-bottom: 24px;
  }
}
</style>

