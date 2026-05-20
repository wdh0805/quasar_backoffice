import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    user: null
  }),
  actions: {
    login(username, password) {
      if (username === 'admin' && password === 'admin') {
        this.isLoggedIn = true
        this.user = { name: 'Admin User' }
        return true
      }
      return false
    },
    logout() {
      this.isLoggedIn = false
      this.user = null
    }
  }
})
