<template>
  <div class="product-detail-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <el-row :gutter="40" v-loading="loading">
          <el-col :span="12">
            <el-image :src="product.image || '/default-product.png'" fit="contain" style="width: 100%;" />
          </el-col>
          <el-col :span="12">
            <h1>{{ product.name }}</h1>
            <div class="price-section">
              <span class="current-price">¥{{ product.price }}</span>
              <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
            </div>
            <el-divider />
            <div class="product-info">
              <p><strong>分类：</strong>{{ categoryName }}</p>
              <p><strong>库存：</strong>{{ product.stock }}</p>
              <p><strong>销量：</strong>{{ product.sales }}</p>
              <p v-if="product.origin"><strong>产地：</strong>{{ product.origin }}</p>
              <p v-if="product.year"><strong>年份：</strong>{{ product.year }}</p>
            </div>
            <el-divider />
            <div class="quantity-section">
              <span>数量：</span>
              <el-input-number v-model="quantity" :min="1" :max="product.stock" />
            </div>
            <div class="action-buttons">
              <el-button type="primary" size="large" @click="addToCart">加入购物车</el-button>
              <el-button type="danger" size="large">立即购买</el-button>
            </div>
            <el-divider />
            <div class="description">
              <h3>产品描述</h3>
              <p v-html="product.description"></p>
            </div>
          </el-col>
        </el-row>
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
}

.price-section {
  margin: 20px 0;
}

.current-price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: bold;
  margin-right: 15px;
}

.original-price {
  font-size: 20px;
  color: #999;
  text-decoration: line-through;
}

.product-info {
  margin: 20px 0;
}

.product-info p {
  margin: 10px 0;
  font-size: 14px;
}

.quantity-section {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-buttons {
  margin: 30px 0;
  display: flex;
  gap: 15px;
}

.description {
  margin-top: 40px;
}

.description h3 {
  margin-bottom: 15px;
}
</style>

