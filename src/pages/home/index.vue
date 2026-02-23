<template>
<view class="home-page">
<!-- Header -->
<view class="header-section">
<text class="page-title">退休规划助手</text>
</view>

<!-- Main Countdown Card -->
<view class="countdown-section">
<view class="glass-card">
<view class="countdown-header">
<view class="countdown-left">
<text class="countdown-label">距离退休还有</text>
<view class="countdown-display-wrap">
<text class="countdown-display">{{ daysUntilRetirement || '--' }}</text>
<text class="countdown-unit">天</text>
</view>
</view>
<!-- Progress Ring -->
<view class="progress-ring">
<view class="progress-text">
<text class="progress-percent">{{ progressPercent }}%</text>
</view>
</view>
</view>
<!-- Quick Stats -->
<view class="stats-grid">
<view class="stat-card">
<text class="stat-label">现年</text>
<text class="stat-value">{{ currentAge || '--' }}岁</text>
</view>
<view class="stat-card highlight">
<text class="stat-label">退休年龄</text>
<text class="stat-value">{{ retirementAge }}岁</text>
</view>
</view>
</view>
</view>

<!-- Retirement Info Card -->
<view class="info-section">
<view class="glass-card">
<view class="glass-header">
<view class="header-icon">
<text class="icon-text">📅</text>
</view>
<text class="glass-title">退休信息</text>
</view>
<view class="retirement-date-box">
<view>
<text class="retirement-date-large">{{ retirementDate || 'YYYY年MM月DD日' }}</text>
<text class="retirement-weekday">{{ retirementWeekday || '周X' }}</text>
</view>
<view class="tag-group">
<text class="chip chip-primary">{{ genderText }}</text>
<text class="chip chip-success">企业职工</text>
</view>
</view>
<view class="info-rows">
<view class="info-row" @click="openGenderPicker">
<text class="info-label">性别</text>
<view class="info-value-wrap">
<text class="info-value">{{ genderText }}</text>
<text class="arrow">›</text>
</view>
</view>
<view class="info-row">
<text class="info-label">出生日期</text>
<picker mode="date" :value="birthDate" :start="startDate" :end="endDate" @change="onDateChange">
<view class="info-value-wrap">
<text class="info-value">{{ birthDate || '请选择' }}</text>
<text class="arrow">›</text>
</view>
</picker>
</view>
<view class="info-row" @click="openAgePicker">
<text class="info-label">退休年龄</text>
<view class="info-value-wrap">
<text class="info-value">{{ retirementAge }}岁</text>
<text class="arrow">›</text>
</view>
</view>
</view>
</view>
</view>

<!-- Tips -->
<view class="tips-section">
<text class="tips-title">温馨提示</text>
<view class="tips-list">
<text class="tips-item">1. 建议提前5-10年开始规划退休后的生活方式和财务安排</text>
<text class="tips-item">2. 确保缴费基数和年限准确无误，影响养老金领取金额</text>
<text class="tips-item">3. 了解当地社保政策，合理规划个人账户</text>
<text class="tips-item">4. 关注养老金调整政策，及时了解最新变化</text>
</view>
</view>

<!-- 未登录提示 -->
<view class="login-tip" v-if="!isLoggedIn">
<view class="glass-card">
<text class="login-tip-text">登录后可保存个人档案信息</text>
<button class="btn-primary" @click="goToLogin">去登录</button>
</view>
</view>
</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// 登录状态
const isLoggedIn = ref(false)

// 表单数据
const gender = ref(1)
const birthDate = ref('')
const retirementAge = ref(60)

// 性别选项
const genderOptions = [
{ text: '男', value: 1 },
{ text: '女', value: 2 }
]

// 退休年龄选项
const ageOptions = Array.from({ length: 21 }, (_, i) => (50 + i) + '岁')

// 日期选择器范围
const startDate = '1940-01-01'
const endDate = computed(() => {
const d = new Date()
return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// 计算退休日期
const retirementDate = computed(() => {
if (!birthDate.value) return ''
const [year, month, day] = birthDate.value.split('-')
const retireYear = parseInt(year) + retirementAge.value
return `${retireYear}年${month}月${day}日`
})

// 计算退役日期的星期
const retirementWeekday = computed(() => {
if (!birthDate.value) return ''
const [year, month, day] = birthDate.value.split('-')
const retireDate = new Date(parseInt(year) + retirementAge.value, parseInt(month) - 1, parseInt(day))
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
return weekdays[retireDate.getDay()] || ''
})

// 计算距离退休天数
const daysUntilRetirement = computed(() => {
if (!birthDate.value) return null
const [year, month, day] = birthDate.value.split('-')
const retireDate = new Date(parseInt(year) + retirementAge.value, parseInt(month) - 1, parseInt(day))
const today = new Date()
const diff = Math.ceil((retireDate - today) / (1000 * 60 * 60 * 24))
return diff > 0 ? diff : 0
})

// 性别显示
const genderText = computed(() => gender.value === 1 ? '男' : '女')

// 计算年龄
const currentAge = computed(() => {
if (!birthDate.value) return ''
const [year, month, day] = birthDate.value.split('-')
const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
const today = new Date()
let age = today.getFullYear() - birth.getFullYear()
const monthDiff = today.getMonth() - birth.getMonth()
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
age--
}
return age
})

// 进度百分比
const progressPercent = computed(() => {
if (!birthDate.value) return 0
const [year, month, day] = birthDate.value.split('-')
const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
const retire = new Date(parseInt(year) + retirementAge.value, parseInt(month) - 1, parseInt(day))
const today = new Date()
const totalDays = (retire - birth) / (1000 * 60 * 60 * 24)
const passedDays = (today - birth) / (1000 * 60 * 60 * 24)
return Math.round(Math.min(Math.max(passedDays / totalDays, 0), 1) * 100)
})

// 加载用户数据
const loadUserData = async () => {
const token = uni.getStorageSync('token')
if (!token) return

isLoggedIn.value = true

try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/auth/me',
method: 'GET',
header: {
'Authorization': `Bearer ${token}`,
'Content-Type': 'application/json'
}
})

if (res.statusCode === 200 && res.data) {
if (res.data.gender !== null && res.data.gender !== undefined) {
gender.value = res.data.gender
}
if (res.data.birth_date) {
birthDate.value = res.data.birth_date
}
// 根据性别设置默认退休年龄
if (res.data.gender === 2) {
retirementAge.value = 55
} else {
retirementAge.value = 60
}
}
} catch (error) {
console.error('加载用户数据失败:', error)
}
}

// 性别选择器
const openGenderPicker = () => {
uni.showActionSheet({
itemList: ['男', '女'],
success: (res) => {
gender.value = res.tapIndex === 0 ? 1 : 2
retirementAge.value = gender.value === 1 ? 60 : 55
}
})
}

// 日期选择器变更
const onDateChange = (e) => {
birthDate.value = e.detail.value
}

// 退休年龄选择器
const openAgePicker = () => {
uni.showActionSheet({
itemList: ageOptions,
success: (res) => {
retirementAge.value = 50 + res.tapIndex
}
})
}

// 页面显示时加载数据
onShow(() => {
loadUserData()
})

onMounted(() => {
const token = uni.getStorageSync('token')
if (token) {
isLoggedIn.value = true
}
})

const goToLogin = () => {
uni.navigateTo({ url: '/pages/login/index' })
}
</script>

<style scoped>
.home-page {
min-height: 100vh;
padding: 56rpx 48rpx 200rpx;
background: linear-gradient(180deg, #0D1117 0%, #161B22 100%);
}

.header-section {
margin-bottom: 48rpx;
}

.page-title {
font-size: 56rpx;
font-weight: 600;
color: #F0F6FC;
}

/* Countdown Section */
.countdown-section {
margin-bottom: 48rpx;
}

.glass-card {
background: rgba(22, 27, 34, 0.8);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 24rpx;
padding: 32rpx;
backdrop-filter: blur(20rpx);
}

.countdown-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 32rpx;
}

.countdown-label {
font-size: 28rpx;
color: #8B949E;
margin-bottom: 16rpx;
display: block;
}

.countdown-display-wrap {
display: flex;
align-items: flex-end;
}

.countdown-display {
font-size: 112rpx;
font-weight: 700;
color: #58A6FF;
line-height: 1;
}

.countdown-unit {
font-size: 32rpx;
color: #8B949E;
margin-left: 8rpx;
margin-bottom: 16rpx;
}

.progress-ring {
width: 120rpx;
height: 120rpx;
background: rgba(88, 166, 255, 0.1);
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
}

.progress-percent {
font-size: 28rpx;
font-weight: 600;
color: #58A6FF;
}

/* Stats Grid */
.stats-grid {
display: flex;
gap: 24rpx;
}

.stat-card {
flex: 1;
background: rgba(30, 37, 46, 0.9);
border-radius: 16rpx;
padding: 24rpx;
}

.stat-card.highlight {
background: rgba(88, 166, 255, 0.15);
border: 1rpx solid rgba(88, 166, 255, 0.3);
}

.stat-label {
font-size: 24rpx;
color: #8B949E;
display: block;
margin-bottom: 8rpx;
}

.stat-value {
font-size: 40rpx;
font-weight: 600;
color: #F0F6FC;
}

/* Info Section */
.info-section {
margin-bottom: 48rpx;
}

.glass-header {
display: flex;
align-items: center;
gap: 24rpx;
margin-bottom: 32rpx;
}

.header-icon {
width: 80rpx;
height: 80rpx;
border-radius: 24rpx;
background: linear-gradient(135deg, #58A6FF, #3FB950);
display: flex;
align-items: center;
justify-content: center;
}

.icon-text {
font-size: 40rpx;
}

.glass-title {
font-size: 36rpx;
font-weight: 600;
color: #F0F6FC;
}

.retirement-date-box {
display: flex;
justify-content: space-between;
align-items: center;
padding: 32rpx;
background: rgba(88, 166, 255, 0.08);
border-radius: 16rpx;
margin-bottom: 32rpx;
}

.retirement-date-large {
font-size: 40rpx;
font-weight: 600;
color: #58A6FF;
display: block;
}

.retirement-weekday {
font-size: 28rpx;
color: #8B949E;
margin-top: 8rpx;
display: block;
}

.tag-group {
display: flex;
flex-direction: column;
gap: 16rpx;
}

.chip {
padding: 8rpx 24rpx;
border-radius: 32rpx;
font-size: 24rpx;
}

.chip-primary {
background: rgba(88, 166, 255, 0.2);
color: #58A6FF;
}

.chip-success {
background: rgba(63, 185, 80, 0.2);
color: #3FB950;
}

/* Info Rows */
.info-rows {
display: flex;
flex-direction: column;
gap: 16rpx;
}

.info-row {
display: flex;
justify-content: space-between;
align-items: center;
padding: 28rpx 32rpx;
background: rgba(30, 37, 46, 0.9);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 16rpx;
}

.info-label {
font-size: 30rpx;
color: #8B949E;
}

.info-value-wrap {
display: flex;
align-items: center;
gap: 16rpx;
}

.info-value {
font-size: 30rpx;
color: #F0F6FC;
font-weight: 500;
}

.arrow {
font-size: 32rpx;
color: #8B949E;
}

/* Tips Section */
.tips-section {
margin-bottom: 48rpx;
}

.tips-title {
font-size: 36rpx;
font-weight: 600;
color: #F0F6FC;
display: block;
margin-bottom: 32rpx;
}

.tips-list {
display: flex;
flex-direction: column;
gap: 24rpx;
}

.tips-item {
font-size: 28rpx;
color: #8B949E;
line-height: 1.6;
}

/* Login Tip */
.login-tip {
margin-top: 32rpx;
}

.login-tip .glass-card {
text-align: center;
}

.login-tip-text {
color: #8B949E;
font-size: 28rpx;
display: block;
margin-bottom: 24rpx;
}

.btn-primary {
width: 100%;
height: 88rpx;
background: linear-gradient(135deg, #58A6FF, #3FB950);
border-radius: 44rpx;
font-size: 32rpx;
font-weight: 600;
color: #FFFFFF;
border: none;
}
</style>
