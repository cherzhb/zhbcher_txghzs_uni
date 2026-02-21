<template>
<view class="admin-login-page">
<view class="login-container">
<view class="login-header">
<text class="logo">⚙️</text>
<text class="title">管理后台</text>
<text class="subtitle">退休规划助手</text>
</view>

<view class="login-form">
<view class="form-group">
<text class="form-label">管理员账号</text>
<input class="form-input" v-model="username" placeholder="请输入管理员账号" />
</view>
<view class="form-group">
<text class="form-label">密码</text>
<input class="form-input" type="password" v-model="password" placeholder="请输入密码" />
</view>
<button class="btn-login" @click="handleLogin" :disabled="loading">
{{ loading ? '登录中...' : '登录' }}
</button>
</view>

<view class="login-footer">
<text class="footer-text">© 2026 退休规划助手</text>
</view>
</view>
</view>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
if (!username.value || !password.value) {
uni.showToast({ title: '请填写完整', icon: 'none' })
return
}

loading.value = true

try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/auth/login',
method: 'POST',
data: {
username: username.value,
password: password.value
}
})

if (res.data && res.data.token) {
// 检查是否是管理员
if (!res.data.user.isAdmin) {
uni.showToast({ title: '非管理员账号', icon: 'none' })
loading.value = false
return
}

// 存储到独立的管理后台存储
uni.setStorageSync('admin_token', res.data.token)
uni.setStorageSync('admin_user', res.data.user)

uni.showToast({ title: '登录成功', icon: 'success' })

setTimeout(() => {
uni.redirectTo({ url: '/pages/admin/index' })
}, 1000)
} else {
uni.showToast({ title: res.data?.message || '登录失败', icon: 'none' })
}
} catch (err) {
uni.showToast({ title: '网络错误', icon: 'none' })
} finally {
loading.value = false
}
}
</script>

<style scoped>
.admin-login-page {
min-height: 100vh;
display: flex;
align-items: center;
justify-content: center;
background: linear-gradient(135deg, #0D1117 0%, #161B22 50%, #1C2128 100%);
padding: 48rpx;
}

.login-container {
width: 100%;
max-width: 600rpx;
}

.login-header {
text-align: center;
margin-bottom: 80rpx;
}

.logo {
font-size: 80rpx;
display: block;
margin-bottom: 24rpx;
}

.title {
font-size: 48rpx;
font-weight: 600;
color: #F0F6FC;
display: block;
margin-bottom: 12rpx;
}

.subtitle {
font-size: 28rpx;
color: #8B949E;
}

.login-form {
background: rgba(22, 27, 34, 0.8);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 24rpx;
padding: 48rpx 32rpx;
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

.form-input::placeholder {
color: #484F58;
}

.btn-login {
width: 100%;
height: 96rpx;
background: linear-gradient(135deg, #58A6FF, #3FB950);
border-radius: 48rpx;
font-size: 32rpx;
font-weight: 600;
color: #FFFFFF;
border: none;
margin-top: 16rpx;
}

.btn-login[disabled] {
opacity: 0.6;
}

.login-footer {
text-align: center;
margin-top: 48rpx;
}

.footer-text {
font-size: 24rpx;
color: #484F58;
}
</style>
