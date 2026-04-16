<template>
  <div class="cart-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1400px; margin: 0 auto; padding: 40px 32px;">
        <div class="page-header">
          <h2 class="page-title">购物车</h2>
        </div>
        <el-card class="cart-card" v-loading="loading">
          <el-table
            v-if="!loading && cartList.length > 0"
            ref="tableRef"
            row-key="id"
            :data="cartList"
            style="width: 100%"
            class="modern-table"
            @selection-change="handleSelectionChange"
          >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="商品" min-width="300" align="center" show-overflow-tooltip>
            <template #default="scope">
              <div class="product-cell">
                <img :src="scope.row.product?.image || DEFAULT_PRODUCT_IMAGE" :alt="scope.row.product?.name" />
                <span>{{ scope.row.product?.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="140" align="right">
            <template #default="scope">
              <span class="price-text">¥{{ formatPrice(scope.row.product?.price) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="180" align="center">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                :max="scope.row.product?.stock != null ? scope.row.product.stock : undefined"
                @change="updateQuantity(scope.row)"
                class="quantity-input"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="140" align="right">
            <template #default="scope">
              <span class="price-text">¥{{ formatSubtotal(scope.row.product?.price, scope.row.quantity) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button type="danger" size="small" @click="removeItem(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!loading && cartList.length === 0" class="empty-cart">
          <div class="empty-cart-icon">
            <el-icon :size="120"><ShoppingCart /></el-icon>
          </div>
          <h3 class="empty-cart-title">购物车是空的</h3>
          <p class="empty-cart-desc">快去挑选心仪的商品吧~</p>
          <el-button type="primary" size="large" @click="goShopping" class="go-shopping-btn">
            <el-icon><Goods /></el-icon>
            去购物
          </el-button>
        </div>
        </el-card>
        <div class="cart-footer" v-if="cartList.length > 0">
          <el-button type="danger" @click="clearCart" class="clear-button">清空购物车</el-button>
          <div class="total-section">
            <div class="total-info">
              <span class="total-label">已选合计（{{ selectedRows.length }} 件）：</span>
              <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              @click="checkout"
              class="checkout-button"
              :disabled="selectedRows.length === 0"
            >
              去结算
            </el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart, Goods } from '@element-plus/icons-vue'
import Header from '@/components/Header.vue'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'Cart',
  components: {
    Header
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const cartList = ref([])
    const tableRef = ref(null)
    const selectedRows = ref([])

    const handleSelectionChange = (rows) => {
      selectedRows.value = rows
    }

    const loadCart = async () => {
      loading.value = true
      try {
        await store.dispatch('cart/getCartList')
        cartList.value = store.state.cart.cartList
        await nextTick()
        if (tableRef.value && cartList.value.length > 0) {
          cartList.value.forEach((row) => {
            tableRef.value.toggleRowSelection(row, true)
          })
        }
      } catch (error) {
        ElMessage.error('加载购物车失败')
      } finally {
        loading.value = false
      }
    }

    const updateQuantity = async (item) => {
      try {
        await store.dispatch('cart/updateQuantity', {
          cartId: item.id,
          quantity: item.quantity
        })
      } catch (error) {
        ElMessage.error('更新数量失败')
      }
    }

    const removeItem = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await store.dispatch('cart/removeCartItem', id)
        ElMessage.success('删除成功')
        loadCart()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    const clearCart = async () => {
      try {
        await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await store.dispatch('cart/clearCart')
        ElMessage.success('清空成功')
        loadCart()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('清空失败')
        }
      }
    }

    const checkout = () => {
      if (selectedRows.value.length === 0) {
        ElMessage.warning('请先勾选要结算的商品')
        return
      }
      const cartIds = selectedRows.value.map((r) => r.id).join(',')
      router.push({ path: '/checkout', query: { cartIds } })
    }

    const goShopping = () => {
      router.push('/products')
    }

    const formatPrice = (price) => {
      if (!price) return '0.00'
      return Number(price).toFixed(2)
    }

    const formatSubtotal = (price, quantity) => {
      if (!price || !quantity) return '0.00'
      return (Number(price) * Number(quantity)).toFixed(2)
    }

    const totalPrice = computed(() => {
      return selectedRows.value.reduce((sum, item) => {
        const price = item.product?.price ? Number(item.product.price) : 0
        const quantity = item.quantity || 0
        return sum + price * quantity
      }, 0)
    })

    onMounted(() => {
      loadCart()
    })

    return {
      loading,
      tableRef,
      selectedRows,
      handleSelectionChange,
      DEFAULT_PRODUCT_IMAGE,
      cartList,
      totalPrice,
      formatPrice,
      formatSubtotal,
      updateQuantity,
      removeItem,
      clearCart,
      checkout,
      goShopping,
      ShoppingCart,
      Goods
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: transparent;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.cart-card {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
}

.cart-card :deep(.el-card__body) {
  padding: 32px;
}

.modern-table {
  border-radius: var(--radius-base);
  overflow: hidden;
  width: 100%;
}

.modern-table :deep(.el-table) {
  width: 100% !important;
}

.modern-table :deep(.el-table__body-wrapper) {
  width: 100%;
}

.modern-table :deep(.el-table__header) {
  background: var(--bg-secondary);
}

.modern-table :deep(.el-table__header th) {
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: 600;
  border-bottom: 2px solid var(--border-light);
  padding: 16px 12px;
}

.modern-table :deep(.el-table__body td) {
  padding: 20px 12px;
  border-bottom: 1px solid var(--border-lighter);
}

.modern-table :deep(.el-table__row) {
  transition: var(--transition-base);
}

.modern-table :deep(.el-table__row:hover) {
  background: rgba(102, 126, 234, 0.03);
}

.modern-table :deep(.el-table__row:last-child td) {
  border-bottom: none;
}

.product-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 auto;
}

.product-cell img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
  flex-shrink: 0;
}

.product-cell:hover img {
  transform: scale(1.05);
  box-shadow: var(--shadow-base);
}

.product-cell span {
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-word;
}

.price-text {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.quantity-input {
  width: 100%;
}

.quantity-input :deep(.el-input-number) {
  width: 100%;
}

.quantity-input :deep(.el-input__wrapper) {
  width: 100%;
}

.cart-footer {
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.clear-button {
  border-radius: var(--radius-base);
  font-weight: 500;
  transition: var(--transition-base);
}

.clear-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.total-section {
  display: flex;
  align-items: center;
  gap: 32px;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.total-label {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-regular);
}

.total-price {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.checkout-button {
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-base);
  padding: 14px 40px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
}

.checkout-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 400px;
}

.empty-cart-icon {
  color: var(--text-placeholder);
  margin-bottom: 24px;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-cart-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.empty-cart-desc {
  font-size: var(--font-size-base);
  color: var(--text-regular);
  margin: 0 0 32px 0;
}

.go-shopping-btn {
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-weight: 600;
  font-size: var(--font-size-base);
  padding: 14px 40px;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 8px;
}

.go-shopping-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 响应式 */
@media (max-width: 768px) {
  .cart-footer {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .total-section {
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
  
  .checkout-button {
    width: 100%;
  }
}
</style>

