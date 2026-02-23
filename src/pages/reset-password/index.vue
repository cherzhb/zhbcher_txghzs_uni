<template>
<view class="reset-page">
<view class="header-section">
<text class="page-title">忘记密码</text>
<text class="page-subtitle">通过邮箱验证码重置密码</text>
</view>

<view class="form-section">
<view class="glass-card">
<!-- 步骤指示器 -->
<view class="steps">
<view class="step" :class="{ active: step >= 1 }">
<text class="step-num">1</text>
<text class="step-text">验证身份</text>
</view>
<view class="step-line" :class="{ active: step >= 2 }"></view>
<view class="step" :class="{ active: step >= 2 }">
<text class="step-num">2</text>
<text class="step-text">设置密码</text>
</view>
</view>

<!-- 步骤1：验证身份 -->
<template v-if="step === 1">
<view class="form-group">
<text class="form-label">邮箱地址</text>
<input class="form-input" v-model="email" placeholder="请输入注册时的邮箱" />
</view>
<view class="form-group">
<text class="form-label">验证码</text>
<view class="code-row">
<input class="form-input code-input" v-model="code" placeholder="请输入验证码" />
<button class="btn-code" :disabled="countdown > 0" @click="sendCode">
{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
</button>
</view>
</view>
<view class="btn-section">
<button class="btn-primary" @click="nextStep">下一步</button>
</view>
</template>

<!-- 步骤2：设置新密码 -->
<template v-if="step === 2">
<view class="form-group">
<text class="form-label">新密码</text>
<input class="form-input" type="password" v-model="newPassword" placeholder="请输入新密码（至少6位）" />
</view>
<view class="form-group">
<text class="form-label">确认密码</text>
<input class="form-input" type="password" v-model="confirmPassword" placeholder="请再次输入新密码" />
</view>
<view class="btn-section">
<button class="btn-secondary" @click="step = 1">上一步</button>
<button class="btn-primary" @click="handleReset">确认重置</button>
</view>
</template>
</view>
</view>
</view>
</template>

<script setup>
import { ref } from 'vue'

const step = ref(1)
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const countdown = ref(0)

// 发送验证码
const sendCode = async () => {
if (!email.value) {
uni.showToast({ title: '请输入邮箱地址', icon: 'none' })
return
}

// 简单验证邮箱格式
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email.value)) {
uni.showToast({ title: '请输入正确的邮箱格式', icon: 'none' })
return
}

try {
uni.showLoading({ title: '发送中...' })
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/auth/send-code',
method: 'POST',
data: {
email: email.value,
type: 'reset'
}
})
uni.hideLoading()

if (res.statusCode === 200) {
uni.showToast({ title: '验证码已发送', icon: 'success' })
// 开发环境显示验证码
if (res.data && res.data.code) {
console.log('验证码:', res.data.code)
}
// 开始倒计时
countdown.value = 60
const timer = setInterval(() => {
countdown.value--
if (countdown.value <= 0) {
clearInterval(timer)
}
}, 1000)
} else {
uni.showToast({ title: res.data?.error || '发送失败', icon: 'none' })
}
} catch (err) {
uni.hideLoading()
uni.showToast({ title: '网络错误', icon: 'none' })
}
}

// 下一步
const nextStep = () => {
if (!email.value) {
uni.showToast({ title: '请输入邮箱地址', icon: 'none' })
return
}
if (!code.value) {
uni.showToast({ title: '请输入验证码', icon: 'none' })
return
}
step.value = 2
}

// 重置密码
const handleReset = async () => {
if (!newPassword.value) {
uni.showToast({ title: '请输入新密码', icon: 'none' })
return
}
if (newPassword.value.length < 6) {
uni.showToast({ title: '密码长度不能少于6位', icon: 'none' })
return
}
if (newPassword.value !== confirmPassword.value) {
uni.showToast({ title: '两次密码不一致', icon: 'none' })
return
}

try {
uni.showLoading({ title: '提交中...' })
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/auth/reset-password',
method: 'POST',
data: {
email: email.value,
code: code.value,
password: newPassword.value
}
})
uni.hideLoading()

if (res.statusCode === 200 && res.data && res.data.message) {
uni.showToast({ title: '密码重置成功', icon: 'success' })
setTimeout(() => {
uni.navigateBack()
}, 1500)
} else {
uni.showToast({ title: res.data?.error || '重置失败', icon: 'none' })
}
} catch (err) {
uni.hideLoading()
uni.showToast({ title: '网络错误', icon: 'none' })
}
}
</script>

<style scoped>
.reset-page {
min-height: 100vh;
padding: 56rpx 48rpx;
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
margin-top: 16rpx;
display: block;
}

/* Steps */
.steps {
display: flex;
align-items: center;
justify-content: center;
margin-bottom: 48rpx;
padding: 24rpx 0;
}

.step {
display: flex;
flex-direction: column;
align-items: center;
gap: 8rpx;
}

.step-num {
width: 56rpx;
height: 56rpx;
border-radius: 50%;
background: rgba(240, 246, 252, 0.1);
color: #8B949E;
font-size: 28rpx;
font-weight: 600;
display: flex;
align-items: center;
justify-content: center;
}

.step.active .step-num {
background: #58A6FF;
color: #FFFFFF;
}

.step-text {
font-size: 24rpx;
color: #8B949E;
}

.step.active .step-text {
color: #58A6FF;
}

.step-line {
flex: 1;
height: 4rpx;
background: rgba(240, 246, 252, 0.1);
margin: 0 24rpx;
margin-bottom: 32rpx;
}

.step-line.active {
background: #58A6FF;
}

/* Form */
.glass-card {
background: rgba(22, 27, 34, 0.8);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 24rpx;
padding: 32rpx;
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
height: 88rpx;
background: rgba(30, 37, 46, 0.9);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 16rpx;
padding: 0 24rpx;
font-size: 32rpx;
color: #F0F6FC;
box-sizing: border-box;
}

.code-row {
display: flex;
gap: 16rpx;
}

.code-input {
flex: 1;
}

.btn-code {
width: 220rpx;
height: 88rpx;
background: rgba(88, 166, 255, 0.2);
border: 1rpx solid rgba(88, 166, 255, 0.3);
border-radius: 16rpx;
font-size: 28rpx;
color: #58A6FF;
padding: 0;
}

.btn-code[disabled] {
opacity: 0.5;
}

.btn-section {
display: flex;
flex-direction: column;
gap: 24rpx;
margin-top: 32rpx;
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
</style>
