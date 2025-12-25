import api from '@/api'

const state = {
  cartList: [],
  cartCount: 0
}

const mutations = {
  SET_CART_LIST(state, list) {
    state.cartList = list
    state.cartCount = list.length
  },
  ADD_TO_CART(state, item) {
    const index = state.cartList.findIndex(cart => cart.productId === item.productId)
    if (index > -1) {
      state.cartList[index].quantity += item.quantity
    } else {
      state.cartList.push(item)
    }
    state.cartCount = state.cartList.length
  },
  UPDATE_CART_ITEM(state, { id, quantity }) {
    const item = state.cartList.find(cart => cart.id === id)
    if (item) {
      item.quantity = quantity
    }
  },
  REMOVE_CART_ITEM(state, id) {
    const index = state.cartList.findIndex(cart => cart.id === id)
    if (index > -1) {
      state.cartList.splice(index, 1)
      state.cartCount = state.cartList.length
    }
  },
  CLEAR_CART(state) {
    state.cartList = []
    state.cartCount = 0
  }
}

const actions = {
  async getCartList({ commit }) {
    const res = await api.cart.getList()
    commit('SET_CART_LIST', res.data)
    return res
  },
  async addToCart({ commit }, { productId, quantity }) {
    const res = await api.cart.add(productId, quantity)
    await this.dispatch('cart/getCartList')
    return res
  },
  async updateQuantity({ commit }, { cartId, quantity }) {
    const res = await api.cart.update(cartId, quantity)
    commit('UPDATE_CART_ITEM', { id: cartId, quantity })
    return res
  },
  async removeCartItem({ commit }, id) {
    const res = await api.cart.remove(id)
    commit('REMOVE_CART_ITEM', id)
    return res
  },
  async clearCart({ commit }) {
    const res = await api.cart.clear()
    commit('CLEAR_CART')
    return res
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

