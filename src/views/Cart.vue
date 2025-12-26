<template>
  <div class="cart-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>购物车</h2>
        <el-table :data="cartList" style="width: 100%" v-loading="loading">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="商品" width="300">
            <template #default="scope">
              <div class="product-cell">
                <img :src="scope.row.product?.image || '/default-product.png'" :alt="scope.row.product?.name" />
                <span>{{ scope.row.product?.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="scope">
              ¥{{ formatPrice(scope.row.product?.price) }}
            </template>
          </el-table-column>
          <el-table-column label="数量" width="150">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                @change="updateQuantity(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="scope">
              ¥{{ formatSubtotal(scope.row.product?.price, scope.row.quantity) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="danger" size="small" @click="removeItem(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="cart-footer">
          <el-button type="danger" @click="clearCart">清空购物车</el-button>
          <div class="total">
            <span>总计：¥{{ totalPrice.toFixed(2) }}</span>
            <el-button type="primary" size="large" @click="checkout">去结算</el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import Header from '@/components/Header.vue'

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

    const loadCart = async () => {
      loading.value = true
      try {
        await store.dispatch('cart/getCartList')
        // 这里需要根据实际API返回的数据结构调整
        cartList.value = store.state.cart.cartList
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
      if (cartList.value.length === 0) {
        ElMessage.warning('购物车为空')
        return
      }
      router.push('/checkout')
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
      return cartList.value.reduce((sum, item) => {
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
      cartList,
      totalPrice,
      formatPrice,
      formatSubtotal,
      updateQuantity,
      removeItem,
      clearCart,
      checkout
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-cell img {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.cart-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total span {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}
</style>

