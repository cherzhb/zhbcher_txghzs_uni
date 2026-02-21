<template>
<view class="profile-page">
<view class="header-section">
<view class="user-info" @click="handleUserClick">
<view class="avatar">
<text class="avatar-text">{{ username ? username[0].toUpperCase() : 'U' }}</text>
</view>
<view class="user-details">
<text class="username">{{ username || '未登录' }}</text>
<text class="user-desc" v-if="username">{{ isAdmin ? '管理员' : '已登录' }}</text>
<text class="user-desc" v-else>点击登录</text>
</view>
</view>
</view>

<!-- 管理员入口 -->
<view class="menu-section" v-if="isAdmin">
<view class="glass-card admin-card" @click="goToAdmin">
<view class="menu-item">
<view class="menu-left">
<text class="menu-icon">⚙️</text>
<text class="menu-label">管理后台</text>
</view>
<text class="menu-arrow">›</text>
</view>
</view>
</view>

<view class="menu-section">
<view class="glass-card">
<view class="menu-item" @click="goToProfile">
<view class="menu-left">
<text class="menu-icon">👤</text>
<text class="menu-label">个人信息</text>
</view>
<text class="menu-arrow">›</text>
</view>
<view class="menu-item" @click="goToInfo">
<view class="menu-left">
<text class="menu-icon">📰</text>
<text class="menu-label">资讯中心</text>
</view>
<text class="menu-arrow">›</text>
</view>
</view>
</view>

<view class="menu-section">
<view class="glass-card">
<view class="menu-item" @click="goToResetPassword">
<view class="menu-left">
<text class="menu-icon">🔐</text>
<text class="menu-label">修改密码</text>
</view>
<text class="menu-arrow">›</text>
</view>
<view class="menu-item" @click="goToAgreement">
<view class="menu-left">
<text class="menu-icon">📋</text>
<text class="menu-label">用户协议</text>
</view>
<text class="menu-arrow">›</text>
</view>
<view class="menu-item" @click="goToPrivacy">
<view class="menu-left">
<text class="menu-icon">🔒</text>
<text class="menu-label">隐私政策</text>
</view>
<text class="menu-arrow">›</text>
</view>
<view class="menu-item" @click="goToVersion">
<view class="menu-left">
<text class="menu-icon">📱</text>
<text class="menu-label">版本管理</text>
</view>
<text class="menu-arrow">›</text>
</view>
</view>
</view>

<view class="version-section">
<text class="version-text">版本 1.0.0</text>
</view>

<view class="logout-section" v-if="isLoggedIn">
<button class="btn-logout" @click="handleLogout">退出登录</button>
</view>
</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const username = ref('')
const isLoggedIn = ref(false)
const isAdmin = ref(false)

// 页面显示时重新检查登录状态
onShow(() => {
const user = uni.getStorageSync('user')
if (user) {
username.value = user.username
isLoggedIn.value = true
isAdmin.value = user.isAdmin === true
} else {
username.value = ''
isLoggedIn.value = false
isAdmin.value = false
}
})

const handleUserClick = () => {
if (!isLoggedIn.value) {
uni.navigateTo({ url: '/pages/login/index' })
}
}

const goToAdmin = () => {
uni.navigateTo({ url: '/pages/admin/index' })
}

const goToProfile = () => {
if (!isLoggedIn.value) {
uni.showToast({ title: '请先登录', icon: 'none' })
return
}
uni.navigateTo({ url: '/pages/user-profile/index' })
}

const goToInfo = () => {
uni.switchTab({ url: '/pages/info/index' })
}

const goToResetPassword = () => {
if (!isLoggedIn.value) {
uni.showToast({ title: '请先登录', icon: 'none' })
return
}
uni.navigateTo({ url: '/pages/reset-password/index' })
}

const goToAgreement = () => {
uni.navigateTo({ url: '/pages/agreement/index' })
}

const goToPrivacy = () => {
uni.navigateTo({ url: '/pages/privacy/index' })
}

const goToVersion = () => {
uni.navigateTo({ url: '/pages/version/index' })
}

const handleLogout = () => {
uni.showModal({
title: '退出登录',
content: '确定要退出登录吗？',
success: (res) => {
if (res.confirm) {
uni.removeStorageSync('token')
uni.removeStorageSync('user')
uni.showToast({ title: '已退出登录', icon: 'success' })
setTimeout(() => {
username.value = ''
isLoggedIn.value = false
isAdmin.value = false
}, 1500)
}
}
})
}
</script>

<style scoped>
.profile-page {
min-height: 100vh;
padding: 56rpx 48rpx 200rpx;
background: linear-gradient(180deg, #0D1117 0%, #161B22 100%);
}

.header-section {
margin-bottom: 48rpx;
padding: 48rpx 0;
}

.user-info {
display: flex;
align-items: center;
gap: 32rpx;
}

.avatar {
width: 120rpx;
height: 120rpx;
background: linear-gradient(135deg, #58A6FF, #3FB950);
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
}

.avatar-text {
font-size: 56rpx;
font-weight: 600;
color: #FFFFFF;
}

.user-details {
flex: 1;
}

.username {
font-size: 40rpx;
font-weight: 600;
color: #F0F6FC;
display: block;
margin-bottom: 8rpx;
}

.user-desc {
font-size: 28rpx;
color: #8B949E;
}

.menu-section {
margin-bottom: 32rpx;
}

.glass-card {
background: rgba(22, 27, 34, 0.8);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 24rpx;
overflow: hidden;
}

.admin-card {
border-color: rgba(88, 166, 255, 0.3);
background: rgba(88, 166, 255, 0.1);
}

.menu-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 32rpx;
border-bottom: 1rpx solid rgba(240, 246, 252, 0.05);
}

.menu-item:last-child {
border-bottom: none;
}

.menu-left {
display: flex;
align-items: center;
gap: 24rpx;
}

.menu-icon {
font-size: 40rpx;
}

.menu-label {
font-size: 32rpx;
color: #F0F6FC;
}

.menu-arrow {
font-size: 40rpx;
color: #8B949E;
}

.version-section {
text-align: center;
margin-bottom: 48rpx;
}

.version-text {
font-size: 28rpx;
color: #8B949E;
}

.logout-section {
padding: 0 48rpx;
}

.btn-logout {
width: 100%;
height: 96rpx;
background: rgba(217, 38, 38, 0.2);
border: 2rpx solid rgba(217, 38, 38, 0.3);
border-radius: 48rpx;
font-size: 32rpx;
font-weight: 600;
color: #F85149;
}
</style>
