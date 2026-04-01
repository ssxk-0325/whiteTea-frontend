<template>
  <div class="checkout-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <el-alert type="warning" show-icon :closable="false" style="margin-bottom: 20px;">
          下单前若有疑问，请先
          <el-link type="primary" @click="router.push('/customer-service')">联系商家</el-link>
          确认规格、库存与发货时间。
        </el-alert>
        <h2>结算</h2>
        <el-row :gutter="20">
          <el-col :span="16">
            <!-- 配送方式 -->
            <el-card class="delivery-type-card">
              <template #header>
                <span>配送方式</span>
              </template>
              <el-radio-group v-model="deliveryType" class="delivery-type-group">
                <el-radio :label="1" border size="large">线上配送</el-radio>
                <el-radio :label="2" border size="large">线下自提</el-radio>
              </el-radio-group>
            </el-card>

            <!-- 线上配送：收货地址 -->
            <el-card v-if="deliveryType === 1" class="address-card">
              <template #header>
                <div class="card-header">
                  <span>收货地址</span>
                  <el-button type="primary" size="small" @click="showAddressDialog = true">新增地址</el-button>
                </div>
              </template>
              <el-radio-group v-model="selectedAddressId">
                <el-radio
                  v-for="address in addresses"
                  :key="address.id"
                  :label="address.id"
                  class="address-radio"
                >
                  <div class="address-info">
                    <div class="address-header">
                      <span class="receiver-name">{{ address.receiverName }}</span>
                      <span class="receiver-phone">{{ address.receiverPhone }}</span>
                      <el-tag v-if="address.isDefault === 1" type="danger" size="small">默认</el-tag>
                    </div>
                    <div class="address-detail">
                      {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
                    </div>
                  </div>
                </el-radio>
              </el-radio-group>
              <el-empty v-if="addresses.length === 0" description="暂无收货地址，请添加"></el-empty>
            </el-card>

            <!-- 线下自提：选择门店 -->
            <el-card v-if="deliveryType === 2" class="store-card">
              <template #header>
                <span>自提门店</span>
              </template>
              <el-radio-group v-model="selectedStoreId">
                <el-radio
                  v-for="store in storeList"
                  :key="store.id"
                  :label="store.id"
                  class="store-radio"
                >
                  <div class="store-info">
                    <div class="store-name">{{ store.name }}</div>
                    <div class="store-address">{{ store.address }}</div>
                    <div class="store-meta" v-if="store.phone || store.businessHours">
                      <span v-if="store.phone">电话：{{ store.phone }}</span>
                      <span v-if="store.businessHours" style="margin-left: 12px;">营业时间：{{ store.businessHours }}</span>
                    </div>
                  </div>
                </el-radio>
              </el-radio-group>
              <el-empty v-if="storeList.length === 0 && !storeLoading" description="暂无营业门店"></el-empty>
              <div v-if="storeLoading" style="padding: 20px; text-align: center;">加载门店中...</div>
            </el-card>

            <!-- 商品信息 -->
            <el-card class="products-card" style="margin-top: 20px;">
              <template #header>
                <span>商品信息</span>
              </template>
              <el-table :data="cartList" style="width: 100%">
                <el-table-column label="商品" width="300">
                  <template #default="scope">
                    <div class="product-cell">
                      <img :src="scope.row.product?.image || DEFAULT_PRODUCT_IMAGE" :alt="scope.row.product?.name" />
                      <span>{{ scope.row.product?.name }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="单价" width="120">
                  <template #default="scope">
                    ¥{{ formatPrice(scope.row.product?.price) }}
                  </template>
                </el-table-column>
                <el-table-column label="数量" width="100">
                  <template #default="scope">
                    {{ scope.row.quantity }}
                  </template>
                </el-table-column>
                <el-table-column label="小计" width="120">
                  <template #default="scope">
                    ¥{{ formatSubtotal(scope.row.product?.price, scope.row.quantity) }}
                  </template>
                </el-table-column>
              </el-table>
            </el-card>

            <el-card class="discount-card" style="margin-top: 20px;">
              <template #header>
                <span>优惠方式</span>
              </template>
              <el-form label-width="110px">
                <el-form-item label="下单模式">
                  <el-radio-group v-model="orderMode">
                    <el-radio :label="0">普通购买</el-radio>
                    <el-radio :label="1">拼团购买（9折）</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="优惠券">
                  <el-select v-model="selectedCouponId" clearable placeholder="可选未使用优惠券（不选则不使用）" style="width: 100%">
                    <el-option
                      v-for="coupon in availableCoupons"
                      :key="coupon.id"
                      :label="`${coupon.couponName}（${coupon.couponCode}）`"
                      :value="coupon.id"
                    />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="summary-card">
              <template #header>
                <span>订单摘要</span>
              </template>
              <div class="summary-item">
                <span>商品总价：</span>
                <span>¥{{ totalPrice.toFixed(2) }}</span>
              </div>
              <div class="summary-item">
                <span>运费：</span>
                <span>¥0.00</span>
              </div>
              <div class="summary-item">
                <span>拼团优惠：</span>
                <span>-¥{{ groupDiscount.toFixed(2) }}</span>
              </div>
              <div class="summary-item">
                <span>批发优惠：</span>
                <span>-¥{{ wholesaleDiscount.toFixed(2) }}</span>
              </div>
              <div class="summary-item">
                <span>优惠券抵扣：</span>
                <span>-¥{{ couponDiscount.toFixed(2) }}</span>
              </div>
              <el-divider />
              <div class="summary-item total">
                <span>应付总额：</span>
                <span class="total-price">¥{{ payAmount.toFixed(2) }}</span>
              </div>
              <div class="summary-item">
                <span>本单可得积分：</span>
                <span>{{ rewardPointsPreview }}</span>
              </div>
              <el-button
                type="primary"
                size="large"
                style="width: 100%; margin-top: 20px;"
                :loading="submitting"
                @click="submitOrder"
                :disabled="!canSubmit || cartList.length === 0"
              >
                提交订单
              </el-button>
            </el-card>
          </el-col>
        </el-row>

        <!-- 地址对话框 -->
        <el-dialog v-model="showAddressDialog" title="新增收货地址" width="600px">
          <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="收货人姓名" prop="receiverName">
              <el-input v-model="addressForm.receiverName" placeholder="请输入收货人姓名"></el-input>
            </el-form-item>
            <el-form-item label="收货人电话" prop="receiverPhone">
              <el-input v-model="addressForm.receiverPhone" placeholder="请输入收货人电话"></el-input>
            </el-form-item>
            <el-form-item label="省份" prop="province">
              <el-input v-model="addressForm.province" placeholder="请输入省份"></el-input>
            </el-form-item>
            <el-form-item label="城市" prop="city">
              <el-input v-model="addressForm.city" placeholder="请输入城市"></el-input>
            </el-form-item>
            <el-form-item label="区县" prop="district">
              <el-input v-model="addressForm.district" placeholder="请输入区县"></el-input>
            </el-form-item>
            <el-form-item label="详细地址" prop="detail">
              <el-input v-model="addressForm.detail" type="textarea" placeholder="请输入详细地址"></el-input>
            </el-form-item>
            <el-form-item label="设为默认">
              <el-switch v-model="addressForm.isDefault"></el-switch>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showAddressDialog = false">取消</el-button>
            <el-button type="primary" @click="saveAddress">确定</el-button>
          </template>
        </el-dialog>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/assets'

export default {
  name: 'Checkout',
  components: {
    Header
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const parseCartIdsFromRoute = () => {
      const q = route.query.cartIds
      if (q == null) return []
      const parts = Array.isArray(q) ? q : [q]
      const ids = []
      for (const p of parts) {
        String(p)
          .split(',')
          .map((s) => s.trim())
          .forEach((s) => {
            if (!s) return
            const n = Number(s)
            if (!Number.isNaN(n) && n > 0) ids.push(n)
          })
      }
      return [...new Set(ids)]
    }
    const cartList = ref([])
    const deliveryType = ref(1) // 1-线上配送 2-线下自提
    const addresses = ref([])
    const selectedAddressId = ref(null)
    const storeList = ref([])
    const selectedStoreId = ref(null)
    const storeLoading = ref(false)
    const showAddressDialog = ref(false)
    const submitting = ref(false)
    const addressFormRef = ref(null)
    const orderMode = ref(0)
    const availableCoupons = ref([])
    const selectedCouponId = ref(null)

    const addressForm = ref({
      receiverName: '',
      receiverPhone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    })

    const addressRules = {
      receiverName: [
        { required: true, message: '请输入收货人姓名', trigger: 'blur' }
      ],
      receiverPhone: [
        { required: true, message: '请输入收货人电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
      province: [
        { required: true, message: '请输入省份', trigger: 'blur' }
      ],
      city: [
        { required: true, message: '请输入城市', trigger: 'blur' }
      ],
      district: [
        { required: true, message: '请输入区县', trigger: 'blur' }
      ],
      detail: [
        { required: true, message: '请输入详细地址', trigger: 'blur' }
      ]
    }

    const loadCart = async () => {
      try {
        await store.dispatch('cart/getCartList')
        const all = store.state.cart.cartList
        const ids = parseCartIdsFromRoute()
        if (ids.length === 0) {
          ElMessage.warning('请先选择要结算的商品')
          router.push('/cart')
          return
        }
        cartList.value = all.filter((item) => ids.includes(item.id))
        if (cartList.value.length === 0 || cartList.value.length !== ids.length) {
          ElMessage.warning('所选商品已失效或变更，请返回购物车重新选择')
          router.push('/cart')
        }
      } catch (error) {
        ElMessage.error('加载购物车失败')
      }
    }

    const loadAddresses = async () => {
      try {
        const res = await api.address.getList()
        addresses.value = res.data
        // 如果有默认地址，自动选中
        const defaultAddress = addresses.value.find(addr => addr.isDefault === 1)
        if (defaultAddress) {
          selectedAddressId.value = defaultAddress.id
        } else if (addresses.value.length > 0) {
          selectedAddressId.value = addresses.value[0].id
        }
      } catch (error) {
        console.error('加载地址失败:', error)
      }
    }

    const loadStores = async () => {
      storeLoading.value = true
      try {
        const res = await api.store.getList()
        storeList.value = (res.data || []).filter(s => s.status === 1)
        if (storeList.value.length > 0 && !selectedStoreId.value) {
          selectedStoreId.value = storeList.value[0].id
        }
      } catch (error) {
        console.error('加载门店失败:', error)
      } finally {
        storeLoading.value = false
      }
    }

    const loadCoupons = async () => {
      try {
        const res = await api.activity.getMyCoupons({ status: 0 })
        availableCoupons.value = res.data || []
      } catch (error) {
        availableCoupons.value = []
      }
    }

    const canSubmit = computed(() => {
      if (deliveryType.value === 1) return !!selectedAddressId.value
      if (deliveryType.value === 2) return !!selectedStoreId.value
      return false
    })

    const saveAddress = async () => {
      if (!addressFormRef.value) return
      await addressFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const addressData = {
              ...addressForm.value,
              isDefault: addressForm.value.isDefault ? 1 : 0
            }
            await api.address.add(addressData)
            ElMessage.success('地址添加成功')
            showAddressDialog.value = false
            // 重置表单
            addressForm.value = {
              receiverName: '',
              receiverPhone: '',
              province: '',
              city: '',
              district: '',
              detail: '',
              isDefault: false
            }
            loadAddresses()
          } catch (error) {
            ElMessage.error('地址添加失败')
          }
        }
      })
    }

    const submitOrder = async () => {
      if (deliveryType.value === 1 && !selectedAddressId.value) {
        ElMessage.warning('请选择收货地址')
        return
      }
      if (deliveryType.value === 2 && !selectedStoreId.value) {
        ElMessage.warning('请选择自提门店')
        return
      }
      if (cartList.value.length === 0) {
        ElMessage.warning('购物车为空')
        return
      }

      submitting.value = true
      try {
        const orderData = {
          deliveryType: deliveryType.value,
          remark: '',
          orderMode: orderMode.value,
          couponId: selectedCouponId.value
        }
        if (deliveryType.value === 1) {
          const selectedAddress = addresses.value.find(addr => addr.id === selectedAddressId.value)
          orderData.addressId = selectedAddressId.value
          orderData.receiverName = selectedAddress.receiverName
          orderData.receiverPhone = selectedAddress.receiverPhone
          orderData.receiverAddress = `${selectedAddress.province || ''}${selectedAddress.city || ''}${selectedAddress.district || ''}${selectedAddress.detail || ''}`
        } else {
          orderData.storeId = selectedStoreId.value
        }
        orderData.cartIds = cartList.value.map((item) => item.id)
        const res = await api.order.create(orderData)
        ElMessage.success('订单创建成功')
        await store.dispatch('cart/getCartList')
        router.push(`/order/${res.data.id}`)
      } catch (error) {
        ElMessage.error(error.message || '订单创建失败')
      } finally {
        submitting.value = false
      }
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

    const totalQuantity = computed(() => {
      return cartList.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
    })

    const groupDiscount = computed(() => {
      if (orderMode.value !== 1) return 0
      return Number((totalPrice.value * 0.1).toFixed(2))
    })

    const wholesaleDiscountRate = computed(() => {
      if (totalQuantity.value >= 20) return 0.15
      if (totalQuantity.value >= 10) return 0.08
      return 0
    })

    const wholesaleDiscount = computed(() => Number((totalPrice.value * wholesaleDiscountRate.value).toFixed(2)))

    const selectedCoupon = computed(() => availableCoupons.value.find(c => c.id === selectedCouponId.value))

    const couponDiscount = computed(() => {
      const coupon = selectedCoupon.value
      if (!coupon) return 0
      const type = Number(coupon.couponType)
      if (type === 1) return Math.min(20, totalPrice.value)
      if (type === 2) return Math.min(30, totalPrice.value)
      if (type === 3) return Math.min(50, totalPrice.value)
      if (type === 4) return Math.min(80, totalPrice.value)
      if (type === 5) return Number((totalPrice.value * 0.05).toFixed(2))
      if (type === 6) return Number((totalPrice.value * 0.12).toFixed(2))
      return Math.min(10, totalPrice.value)
    })

    const payAmount = computed(() => {
      const v = totalPrice.value - groupDiscount.value - wholesaleDiscount.value - couponDiscount.value
      return Number(Math.max(v, 0).toFixed(2))
    })

    const rewardPointsPreview = computed(() => {
      const base = Math.floor(payAmount.value)
      return orderMode.value === 1 ? base + 10 : base
    })

    onMounted(() => {
      loadCart()
      loadAddresses()
      loadStores()
      loadCoupons()
    })

    watch(deliveryType, () => {
      selectedAddressId.value = null
      selectedStoreId.value = storeList.value.length > 0 ? storeList.value[0].id : null
      if (deliveryType.value === 1) {
        const defaultAddress = addresses.value.find(addr => addr.isDefault === 1)
        if (defaultAddress) selectedAddressId.value = defaultAddress.id
        else if (addresses.value.length > 0) selectedAddressId.value = addresses.value[0].id
      }
    })

    return {
      router,
      cartList,
      DEFAULT_PRODUCT_IMAGE,
      deliveryType,
      addresses,
      selectedAddressId,
      storeList,
      selectedStoreId,
      storeLoading,
      showAddressDialog,
      submitting,
      orderMode,
      availableCoupons,
      selectedCouponId,
      canSubmit,
      addressForm,
      addressRules,
      addressFormRef,
      totalPrice,
      groupDiscount,
      wholesaleDiscount,
      couponDiscount,
      payAmount,
      rewardPointsPreview,
      formatPrice,
      formatSubtotal,
      saveAddress,
      submitOrder
    }
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-radio {
  display: block;
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.address-radio:hover {
  border-color: #409eff;
}

.address-info {
  margin-left: 10px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.receiver-name {
  font-weight: bold;
  font-size: 16px;
}

.receiver-phone {
  color: #666;
}

.address-detail {
  color: #666;
  font-size: 14px;
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

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-item.total {
  font-size: 18px;
  font-weight: bold;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
}

.delivery-type-card {
  margin-bottom: 20px;
}

.delivery-type-group {
  display: flex;
  gap: 16px;
}

.store-card .store-radio {
  display: block;
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.store-card .store-radio:hover {
  border-color: #409eff;
}

.store-info {
  margin-left: 10px;
}

.store-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.store-address {
  color: #666;
  font-size: 14px;
}

.store-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
</style>

