<template>
  <view class="login-page">
    <view class="header-section">
      <text class="page-title">登录</text>
    </view>

    <view class="form-section">
      <view class="glass-card">
        <view class="form-group">
          <text class="form-label">用户名</text>
          <input class="form-input" v-model="username" placeholder="请输入用户名" />
        </view>

        <view class="form-group">
          <text class="form-label">密码</text>
          <input class="form-input" type="password" v-model="password" placeholder="请输入密码" />
        </view>

        <view class="forgot-section">
          <text class="forgot-link" @click="goToReset">忘记密码？</text>
        </view>
      </view>
    </view>

    <view class="btn-section">
      <button class="btn-primary" @click="handleLogin">登录</button>
      <button class="btn-secondary" @click="goToRegister">注册账号</button>
    </view>

    <view class="agreement-section">
      <text class="agreement-text">登录即表示同意</text>
      <text class="agreement-link" @click="goToAgreement">《用户协议》</text>
      <text class="agreement-text">和</text>
      <text class="agreement-link" @click="goToPrivacy">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '登录中...' })
    
    const res = await uni.request({
      url: 'https://uni.q-fan.cn/api/auth/login',
      method: 'POST',
      data: {
        username: username.value,
        password: password.value
      }
    })

    uni.hideLoading()

    if (res.data && res.data.token) {
      uni.setStorageSync('token', res.data.token)
      uni.setStorageSync('user', res.data.user)
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/index' })
      }, 1500)
    } else {
      uni.showToast({ title: res.data?.message || '登录失败', icon: 'none' })
    }
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: '网络错误', icon: 'none' })
  }
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' })
}

const goToReset = () => {
  uni.navigateTo({ url: '/pages/reset-password/index' })
}

const goToAgreement = () => {
  uni.navigateTo({ url: '/pages/agreement/index' })
}

const goToPrivacy = () => {
  uni.navigateTo({ url: '/pages/privacy/index' })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 120rpx 48rpx;
  background: linear-gradient(180deg, #0D1117 0%, #161B22 100%);
}

.header-section {
  margin-bottom: 80rpx;
  text-align: center;
}

.page-title {
  font-size: 64rpx;
  font-weight: 600;
  color: #F0F6FC;
}

.glass-card {
  background: rgba(22, 27, 34, 0.8);
  border: 1rpx solid rgba(240, 246, 252, 0.1);
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  margin-bottom: 48rpx;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #8B949E;
  display: block;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 96rpx;
  background: rgba(30, 37, 46, 0.9);
  border: 1rpx solid rgba(240, 246, 252, 0.1);
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  color: #F0F6FC;
  box-sizing: border-box;
}

.btn-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn-primary {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #58A6FF, #3FB950);
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  border: none;
}

.btn-secondary {
  width: 100%;
  height: 96rpx;
  background: rgba(30, 37, 46, 0.9);
  border: 1rpx solid rgba(240, 246, 252, 0.1);
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: #8B949E;
}

.forgot-section {
  text-align: right;
  margin-top: 16rpx;
}

.forgot-link {
  font-size: 26rpx;
  color: #58A6FF;
}

.agreement-section {
  text-align: center;
  margin-top: 32rpx;
}

.agreement-text {
  font-size: 26rpx;
  color: #8B949E;
}

.agreement-link {
  font-size: 26rpx;
  color: #58A6FF;
}
</style>
