import api from '@/api'

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    localStorage.setItem('token', token)
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  },
  CLEAR_USER(state) {
    state.token = ''
    state.userInfo = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
}

const actions = {
  async login({ commit }, { username, password }) {
    const res = await api.user.login(username, password)
    commit('SET_TOKEN', res.data.token)
    commit('SET_USER_INFO', res.data.user)
    return res
  },
  async register({ commit }, { username, password, phone }) {
    const res = await api.user.register(username, password, phone)
    return res
  },
  async getUserInfo({ commit }) {
    const res = await api.user.getUserInfo()
    commit('SET_USER_INFO', res.data)
    return res
  },
  logout({ commit }) {
    commit('CLEAR_USER')
  }
}

const getters = {
  isLoggedIn: state => !!state.token,
  userType: state => state.userInfo?.userType || 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

