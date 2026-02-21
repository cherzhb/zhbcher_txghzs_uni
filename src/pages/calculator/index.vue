<template>
<view class="calculator-page">
<!-- Header -->
<view class="header-section">
<text class="page-title">养老金测算</text>
<text class="page-subtitle">根据您的情况预估退休金</text>
</view>

<!-- 未登录提示 -->
<view class="not-logged" v-if="!isLoggedIn">
<view class="glass-card login-card">
<text class="login-icon">👤</text>
<text class="login-text">请先登录查看您的退休工资预测</text>
<button class="btn-primary" @click="goToLogin">去登录</button>
</view>
</view>

<!-- 已登录：显示结果和参数 -->
<template v-else>
<!-- Result Card - 预计每月可领取 -->
<view class="result-section">
<view class="glass-card result-card">
<view class="result-header">
<text class="result-label">预计每月可领取</text>
<view class="result-amount">
<text class="currency">¥</text>
<text class="number">{{ formatMoney(pensionResult.totalPension) }}</text>
</view>
</view>

<!-- 养老金构成 -->
<view class="pension-breakdown">
<view class="breakdown-boxes">
<view class="breakdown-box basic">
<text class="box-label">基础养老金</text>
<text class="box-value">¥{{ formatMoney(pensionResult.basicPension) }}</text>
</view>
<view class="breakdown-box personal">
<text class="box-label">个人账户养老金</text>
<text class="box-value">¥{{ formatMoney(pensionResult.personalPension) }}</text>
</view>
</view>

<view class="progress-bar-wrap">
<view class="progress-bar">
<view class="progress-basic" :style="{ width: pensionResult.basicPensionPercent + '%' }"></view>
<view class="progress-personal" :style="{ width: (100 - pensionResult.basicPensionPercent) + '%' }"></view>
</view>
<view class="progress-labels">
<text class="progress-label"><text class="dot basic"></text>基础养老金 {{ pensionResult.basicPensionPercent }}%</text>
<text class="progress-label"><text class="dot personal"></text>个人账户 {{ 100 - pensionResult.basicPensionPercent }}%</text>
</view>
</view>
</view>
</view>
</view>

<!-- Parameters 测算参数 -->
<view class="params-section">
<view class="glass-card">
<text class="section-title">测算参数</text>
<view class="params-grid">
<view class="param-item" @click="openGenderPicker">
<text class="param-label">性别</text>
<view class="param-value-wrap">
<text class="param-value">{{ genderText }}</text>
<text class="arrow">›</text>
</view>
</view>

<view class="param-item" @click="openDatePicker">
<text class="param-label">出生日期</text>
<picker mode="date" :value="birthDate" start="1940-01-01" :end="today" @change="onDateChange">
<view class="param-value-wrap">
<text class="param-value">{{ birthDate || '请选择' }}</text>
<text class="arrow">›</text>
</view>
</picker>
</view>

<view class="param-item" @click="openLocationPicker">
<text class="param-label">参保地</text>
<view class="param-value-wrap">
<text class="param-value">{{ locationInfo.name }}</text>
<text class="arrow">›</text>
</view>
</view>

<view class="param-item" @click="openYearsPicker">
<text class="param-label">缴费年限</text>
<view class="param-value-wrap">
<text class="param-value">{{ contributionYears }}年</text>
<text class="arrow">›</text>
</view>
</view>

<view class="param-item" @click="openSalaryPicker">
<text class="param-label">月工资</text>
<view class="param-value-wrap">
<text class="param-value">¥{{ formatMoney(salary) }}</text>
<text class="arrow">›</text>
</view>
</view>

<view class="param-item" @click="openBalancePicker">
<text class="param-label">账户余额</text>
<view class="param-value-wrap">
<text class="param-value">¥{{ formatMoney(accountBalance) }}</text>
<text class="arrow">›</text>
</view>
</view>

<view class="param-item" @click="openIndexPicker">
<text class="param-label">缴费指数</text>
<view class="param-value-wrap">
<text class="param-value">{{ contributionIndex.toFixed(1) }}</text>
<text class="arrow">›</text>
</view>
</view>
</view>
</view>
</view>

<!-- Assumptions Note 测算假设 -->
<view class="assumptions">
<view class="glass-card">
<text class="assumption-title">💡 测算假设</text>
<text class="assumption-notes">* 假设工资年增长率3%，个人账户年利率3%
* 基础养老金 = 月社平工资 × (1 + 缴费指数) / 2 × 缴费年限 × 1%
* 个人账户养老金 = 账户余额 ÷ 计发月数（{{ retirementInfo.months }}个月）</text>
</view>
</view>
</template>

<!-- Disclaimer -->
<view class="disclaimer">
<view class="glass-card disclaimer-card">
<text class="disclaimer-icon">⚠️</text>
<text class="disclaimer-text">本测算结果基于当前政策和假设条件推算，仅供参考。实际养老金待遇以社保部门核定为准。</text>
</view>
</view>
</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import dayjs from 'dayjs'

// 登录状态
const isLoggedIn = ref(false)

// 地区平均工资数据
const locationSalaries = {
'110000': { name: '北京', salary: 11500 },
'310000': { name: '上海', salary: 12100 },
'440300': { name: '深圳', salary: 12800 },
'440100': { name: '广州', salary: 11300 },
'320100': { name: '南京', salary: 10800 },
'330100': { name: '杭州', salary: 11000 },
'420100': { name: '武汉', salary: 9500 },
'430100': { name: '长沙', salary: 9200 },
'410100': { name: '郑州', salary: 8800 },
'320500': { name: '苏州', salary: 10500 }
}

// 用户信息
const gender = ref(1)
const birthDate = ref('')
const salary = ref(10000)
const accountBalance = ref(0)
const contributionYears = ref(15)
const contributionIndex = ref(1.0)
const locationCode = ref('110000')
const jobType = ref(1)

// 今天的日期
const today = dayjs().format('YYYY-MM-DD')

// 测算年龄
const age = computed(() => {
if (!birthDate.value) return 30
return dayjs().diff(dayjs(birthDate.value), 'year')
})

// 测算退休年龄和月份
const retirementInfo = computed(() => {
if (gender.value === 1) {
return { age: 60, months: 139, text: '60岁' }
}
if (gender.value === 2) {
if (jobType.value === 3 || jobType.value === 4) {
return { age: 55, months: 170, text: '55岁' }
}
return { age: 50, months: 195, text: '50岁' }
}
return { age: 60, months: 139, text: '60岁' }
})

// 距退休年数
const yearsToRetire = computed(() => {
return Math.max(0, retirementInfo.value.age - age.value)
})

// 地区信息
const locationInfo = computed(() => {
return locationSalaries[locationCode.value] || locationSalaries['110000']
})

// ========== 实时测算养老金 ==========
const pensionResult = computed(() => {
const yearsToRetireVal = yearsToRetire.value
const currentAvgSalary = locationInfo.value.salary
const salaryGrowthRate = 0.03

// 预测退休时的社平工资
const futureAvgSalary = currentAvgSalary * Math.pow(1 + salaryGrowthRate, yearsToRetireVal)

// 总缴费年限 = 已缴费年限 + 距退休年数
const totalContributionYears = contributionYears.value + yearsToRetireVal

const index = contributionIndex.value

// 每月存入个人账户金额（工资的8%）
const monthlyDeposit = salary.value * 0.08

// 剩余月数
const monthsRemaining = yearsToRetireVal * 12

// 预测退休时个人账户余额（现有余额 + 未来存入 + 利息）
const futureAccountBalance = accountBalance.value + monthlyDeposit * monthsRemaining * (1 + 0.03 / 12 * monthsRemaining / 2)

// 计发月数
const months = retirementInfo.value.months

// 基础养老金 = 退休时社平工资 × (1 + 缴费指数) / 2 × 缴费年限 × 1%
const basicPension = futureAvgSalary * (1 + index) / 2 * totalContributionYears * 0.01

// 个人账户养老金 = 账户余额 ÷ 计发月数
const personalPension = futureAccountBalance / months

// 总养老金
const totalPension = basicPension + personalPension

return {
basicPension: Math.round(basicPension),
personalPension: Math.round(personalPension),
totalPension: Math.round(totalPension),
basicPensionPercent: totalPension > 0 ? Math.round((basicPension / totalPension) * 100) : 0
}
})

// 格式化金额
const formatMoney = (num) => {
return new Intl.NumberFormat('zh-CN').format(Math.round(num))
}

// 性别显示
const genderText = computed(() => gender.value === 1 ? '男' : '女')

// 加载用户档案
const loadUserProfile = async () => {
const token = uni.getStorageSync('token')
if (!token) {
isLoggedIn.value = false
return
}

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
gender.value = res.data.gender || 1
birthDate.value = res.data.birth_date || ''
salary.value = res.data.salary || 10000
accountBalance.value = res.data.account_balance || 0
contributionYears.value = res.data.contribution_years || 15
contributionIndex.value = res.data.contribution_index || 1.0
locationCode.value = res.data.location_code || '110000'
jobType.value = res.data.job_type || 1
}
} catch (err) {
console.error('加载档案失败:', err)
}
}

// 选择器
const openGenderPicker = () => {
uni.showActionSheet({
itemList: ['男', '女'],
success: (res) => {
gender.value = res.tapIndex === 0 ? 1 : 2
}
})
}

const openDatePicker = () => {
// 由 picker 组件处理
}

const onDateChange = (e) => {
birthDate.value = e.detail.value
}

const openLocationPicker = () => {
const locations = Object.values(locationSalaries).map(l => l.name)
uni.showActionSheet({
itemList: locations,
success: (res) => {
const codes = Object.keys(locationSalaries)
locationCode.value = codes[res.tapIndex]
}
})
}

const openYearsPicker = () => {
const years = Array.from({ length: 46 }, (_, i) => i + '年')
uni.showActionSheet({
itemList: years,
success: (res) => {
contributionYears.value = res.tapIndex
}
})
}

const openSalaryPicker = () => {
uni.showModal({
title: '输入月工资',
editable: true,
placeholderText: '请输入月工资金额',
success: (res) => {
if (res.confirm && res.content) {
salary.value = parseInt(res.content) || 0
}
}
})
}

const openBalancePicker = () => {
uni.showModal({
title: '输入账户余额',
editable: true,
placeholderText: '请输入个人账户余额',
success: (res) => {
if (res.confirm && res.content) {
accountBalance.value = parseInt(res.content) || 0
}
}
})
}

const openIndexPicker = () => {
const indexes = Array.from({ length: 25 }, (_, i) => (0.6 + i * 0.1).toFixed(1))
uni.showActionSheet({
itemList: indexes,
success: (res) => {
contributionIndex.value = 0.6 + res.tapIndex * 0.1
}
})
}

const goToLogin = () => {
uni.navigateTo({ url: '/pages/login/index' })
}

// 页面显示时加载数据
onShow(() => {
loadUserProfile()
})

onMounted(() => {
const token = uni.getStorageSync('token')
if (token) {
isLoggedIn.value = true
}
})
</script>

<style scoped>
.calculator-page {
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
display: block;
}

.page-subtitle {
font-size: 28rpx;
color: #8B949E;
margin-top: 8rpx;
display: block;
}

/* Glass Card */
.glass-card {
background: rgba(22, 27, 34, 0.8);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 24rpx;
padding: 32rpx;
margin-bottom: 32rpx;
backdrop-filter: blur(20rpx);
}

/* Not Logged */
.not-logged {
margin-bottom: 32rpx;
}

.login-card {
text-align: center;
padding: 64rpx 32rpx;
}

.login-icon {
font-size: 96rpx;
display: block;
margin-bottom: 32rpx;
}

.login-text {
color: #8B949E;
font-size: 28rpx;
display: block;
margin-bottom: 32rpx;
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

/* Result Section */
.result-section {
margin-bottom: 32rpx;
}

.result-card {
padding: 32rpx;
}

.result-header {
margin-bottom: 32rpx;
}

.result-label {
font-size: 28rpx;
font-weight: 500;
color: #8B949E;
display: block;
margin-bottom: 16rpx;
}

.result-amount {
display: flex;
align-items: baseline;
}

.result-amount .currency {
font-size: 40rpx;
font-weight: 600;
color: #F0F6FC;
}

.result-amount .number {
font-size: 80rpx;
font-weight: 700;
color: #F0F6FC;
}

/* Pension Breakdown */
.pension-breakdown {
border-top: 1rpx solid rgba(240, 246, 252, 0.1);
padding-top: 24rpx;
}

.breakdown-boxes {
display: flex;
gap: 24rpx;
margin-bottom: 24rpx;
}

.breakdown-box {
flex: 1;
padding: 24rpx;
border-radius: 16rpx;
text-align: center;
}

.breakdown-box.basic {
background: rgba(88, 166, 255, 0.1);
border: 1rpx solid rgba(88, 166, 255, 0.2);
}

.breakdown-box.personal {
background: rgba(247, 129, 102, 0.1);
border: 1rpx solid rgba(247, 129, 102, 0.2);
}

.box-label {
display: block;
font-size: 24rpx;
color: #8B949E;
margin-bottom: 8rpx;
}

.box-value {
display: block;
font-size: 36rpx;
font-weight: 600;
color: #F0F6FC;
}

.progress-bar-wrap {
margin-top: 16rpx;
}

.progress-bar {
display: flex;
height: 16rpx;
border-radius: 8rpx;
overflow: hidden;
background: rgba(240, 246, 252, 0.1);
}

.progress-basic {
background: #58A6FF;
}

.progress-personal {
background: #F78166;
}

.progress-labels {
display: flex;
justify-content: space-between;
margin-top: 16rpx;
}

.progress-label {
display: flex;
align-items: center;
gap: 8rpx;
font-size: 24rpx;
color: #8B949E;
}

.progress-label .dot {
width: 16rpx;
height: 16rpx;
border-radius: 50%;
}

.progress-label .dot.basic {
background: #58A6FF;
}

.progress-label .dot.personal {
background: #F78166;
}

/* Params Section */
.params-section {
margin-bottom: 32rpx;
}

.section-title {
font-size: 36rpx;
font-weight: 600;
color: #F0F6FC;
display: block;
margin-bottom: 24rpx;
}

.params-grid {
display: flex;
flex-direction: column;
gap: 16rpx;
}

.param-item {
display: flex;
align-items: center;
justify-content: space-between;
padding: 28rpx 32rpx;
background: rgba(30, 37, 46, 0.9);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 16rpx;
}

.param-label {
font-size: 30rpx;
color: #8B949E;
}

.param-value-wrap {
display: flex;
align-items: center;
gap: 16rpx;
}

.param-value {
font-size: 30rpx;
color: #F0F6FC;
font-weight: 500;
}

.arrow {
font-size: 32rpx;
color: #8B949E;
}

/* Assumptions */
.assumptions {
margin-bottom: 32rpx;
}

.assumption-title {
font-size: 30rpx;
font-weight: 600;
color: #F0F6FC;
display: block;
margin-bottom: 16rpx;
}

.assumption-notes {
font-size: 24rpx;
color: #8B949E;
line-height: 1.8;
display: block;
white-space: pre-line;
}

/* Disclaimer */
.disclaimer {
margin-bottom: 32rpx;
}

.disclaimer-card {
display: flex;
align-items: flex-start;
gap: 16rpx;
}

.disclaimer-icon {
font-size: 32rpx;
}

.disclaimer-text {
font-size: 24rpx;
color: #8B949E;
line-height: 1.6;
flex: 1;
}
</style>
