import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    user: null,
    isLoggedIn: false
  }),

  getters: {
    token: (state) => state.token || uni.getStorageSync('token'),
    user: (state) => state.user || uni.getStorageSync('user'),
    isLoggedIn: (state) => !!state.token || !!uni.getStorageSync('token')
  },

  actions: {
    setToken(token) {
      this.token = token
      uni.setStorageSync('token', token)
    },

    setUser(user) {
      this.user = user
      this.isLoggedIn = true
      uni.setStorageSync('user', user)
    },

    logout() {
      this.token = ''
      this.user = null
      this.isLoggedIn = false
      uni.removeStorageSync('token')
      uni.removeStorageSync('user')
    }
  }
})
