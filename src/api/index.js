const BASE_URL = 'https://uni.q-fan.cn/api'

export const request = (options) => {
  const token = uni.getStorageSync('token')
  
  const header = {
    'Content-Type': 'application/json',
    ...options.header
  }
  
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  return uni.request({
    url: BASE_URL + options.url,
    method: options.method || 'GET',
    data: options.data,
    header,
    ...options
  }).then(res => {
    if (res.statusCode === 200) {
      return res.data
    } else {
      throw new Error(res.data?.message || '请求失败')
    }
  })
}

export const authAPI = {
  login(data) {
    return request({
      url: '/auth/login',
      method: 'POST',
      data
    })
  },
  
  register(data) {
    return request({
      url: '/auth/register',
      method: 'POST',
      data
    })
  },
  
  getMe() {
    return request({
      url: '/auth/me',
      method: 'GET'
    })
  }
}

export const pensionAPI = {
  updateProfile(data) {
    return request({
      url: '/profile',
      method: 'POST',
      data
    })
  },
  
  getHistory() {
    return request({
      url: '/history',
      method: 'GET'
    })
  },
  
  recordHistory(data) {
    return request({
      url: '/history',
      method: 'POST',
      data
    })
  }
}
