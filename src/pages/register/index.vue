<template>
<view class="register-page">
<view class="header-section">
<text class="page-title">注册账号</text>
</view>

<!-- 注册方式切换 -->
<view class="register-type">
<view 
class="type-item" 
:class="{ active: registerType === 'phone' }" 
@click="switchToPhone"
>
<text class="type-text">手机注册</text>
</view>
<view 
class="type-item" 
:class="{ active: registerType === 'email' }" 
@click="registerType = 'email'"
>
<text class="type-text">邮箱注册</text>
</view>
</view>

<view class="form-section">
<view class="glass-card">
<view class="form-group">
<text class="form-label">用户名</text>
<input class="form-input" v-model="username" placeholder="请输入用户名" />
</view>

<!-- 手机注册 -->
<view v-if="registerType === 'phone'">
<view class="form-group">
<text class="form-label">手机号</text>
<input class="form-input" type="number" v-model="phone" placeholder="请输入手机号" />
</view>
</view>

<!-- 邮箱注册 -->
<view v-else>
<view class="form-group">
<text class="form-label">邮箱</text>
<input class="form-input" type="email" v-model="email" placeholder="请输入邮箱" />
</view>
</view>

<!-- 图形验证码 -->
<view class="form-group">
<text class="form-label">验证码</text>
<view class="captcha-row">
<input class="form-input captcha-input" v-model="captchaText" placeholder="请输入验证码" />
<view class="captcha-img" @click="refreshCaptcha">
<image v-if="captchaSvg" :src="captchaDataUrl" mode="aspectFit" class="captcha-image" />
<text v-else class="captcha-loading">点击获取</text>
</view>
</view>
</view>

<!-- 短信/邮件验证码 -->
<view class="form-group">
<text class="form-label">{{ registerType === 'phone' ? '短信验证码' : '邮箱验证码' }}</text>
<view class="code-row">
<input class="form-input code-input" v-model="verifyCode" placeholder="请输入验证码" />
<button class="btn-code" :disabled="countdown > 0" @click="sendCode">
{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
</button>
</view>
</view>

<view class="form-group">
<text class="form-label">密码</text>
<input class="form-input" type="password" v-model="password" placeholder="请输入密码（至少6位）" />
</view>
<view class="form-group">
<text class="form-label">确认密码</text>
<input class="form-input" type="password" v-model="confirmPassword" placeholder="请再次输入密码" />
</view>
</view>
</view>

<view class="agreement-section">
<checkbox :checked="agreed" @click="agreed = !agreed" />
<text class="agreement-text">我已阅读并同意</text>
<text class="agreement-link" @click="goToAgreement">《用户协议》</text>
<text class="agreement-text">和</text>
<text class="agreement-link" @click="goToPrivacy">《隐私政策》</text>
</view>

<view class="btn-section">
<button class="btn-primary" @click="handleRegister">注册</button>
<button class="btn-secondary" @click="goToLogin">已有账号？去登录</button>
</view>
</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const registerType = ref('email')
const username = ref('')
const phone = ref('')
const email = ref('')
const captchaText = ref('')
const captchaId = ref('')
const captchaSvg = ref('')
const verifyCode = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreed = ref(false)
const countdown = ref(0)

// 点击手机注册时提示
const switchToPhone = () => {
uni.showToast({ title: '手机注册暂未开放，敬请期待', icon: 'none' })
}

// 获取图形验证码
const refreshCaptcha = async () => {
try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/auth/captcha'
})
if (res.data) {
captchaId.value = res.data.captchaId
captchaSvg.value = res.data.svg
}
} catch (err) {
console.error('获取验证码失败:', err)
}
}

// 将SVG转为Data URL
const captchaDataUrl = ref('')
const updateCaptchaDataUrl = () => {
if (captchaSvg.value) {
captchaDataUrl.value = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(captchaSvg.value)
}
}

// 监听SVG变化
watch(captchaSvg, updateCaptchaDataUrl)

import { watch } from 'vue'

// 发送短信/邮件验证码
const sendCode = async () => {
if (!captchaText.value) {
uni.showToast({ title: '请先输入图形验证码', icon: 'none' })
return
}

if (registerType.value === 'phone') {
if (!phone.value) {
uni.showToast({ title: '请输入手机号', icon: 'none' })
return
}
const phoneRegex = /^1[3-9]\d{9}$/
if (!phoneRegex.test(phone.value)) {
uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
return
}
} else {
if (!email.value) {
uni.showToast({ title: '请输入邮箱', icon: 'none' })
return
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email.value)) {
uni.showToast({ title: '请输入正确的邮箱格式', icon: 'none' })
return
}
}

try {
uni.showLoading({ title: '发送中...' })
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/auth/send-code',
method: 'POST',
data: {
phone: registerType.value === 'phone' ? phone.value : undefined,
email: registerType.value === 'email' ? email.value : undefined,
type: 'register',
captchaId: captchaId.value,
captchaText: captchaText.value
}
})
uni.hideLoading()

if (res.statusCode === 200) {
uni.showToast({ title: '验证码已发送', icon: 'success' })
startCountdown()
// 清空图形验证码，需要重新获取
captchaText.value = ''
refreshCaptcha()
} else {
uni.showToast({ title: res.data?.error || '发送失败', icon: 'none' })
refreshCaptcha()
}
} catch (err) {
uni.hideLoading()
uni.showToast({ title: '网络错误', icon: 'none' })
refreshCaptcha()
}
}

const startCountdown = () => {
countdown.value = 60
const timer = setInterval(() => {
countdown.value--
if (countdown.value <= 0) {
clearInterval(timer)
}
}, 1000)
}

const handleRegister = async () => {
if (!username.value || !verifyCode.value || !password.value || !confirmPassword.value) {
uni.showToast({ title: '请填写完整信息', icon: 'none' })
return
}

if (registerType.value === 'phone' && !phone.value) {
uni.showToast({ title: '请输入手机号', icon: 'none' })
return
}

if (registerType.value === 'email' && !email.value) {
uni.showToast({ title: '请输入邮箱', icon: 'none' })
return
}

if (password.value !== confirmPassword.value) {
uni.showToast({ title: '两次密码不一致', icon: 'none' })
return
}

if (password.value.length < 6) {
uni.showToast({ title: '密码长度不能少于6位', icon: 'none' })
return
}

if (!agreed.value) {
uni.showToast({ title: '请先同意用户协议', icon: 'none' })
return
}

try {
uni.showLoading({ title: '注册中...' })

const data = {
username: username.value,
code: verifyCode.value,
password: password.value
}

if (registerType.value === 'phone') {
data.phone = phone.value
} else {
data.email = email.value
}

const res = await uni.request({
url: 'https://uni.q-fan.cn/api/auth/register',
method: 'POST',
data
})
uni.hideLoading()

if (res.data && res.data.message) {
uni.showToast({ title: '注册成功', icon: 'success' })
setTimeout(() => {
uni.redirectTo({ url: '/pages/login/index' })
}, 1500)
} else {
uni.showToast({ title: res.data?.error || '注册失败', icon: 'none' })
}
} catch (err) {
uni.hideLoading()
uni.showToast({ title: '网络错误', icon: 'none' })
}
}

const goToLogin = () => {
uni.redirectTo({ url: '/pages/login/index' })
}

const goToAgreement = () => {
uni.navigateTo({ url: '/pages/agreement/index' })
}

const goToPrivacy = () => {
uni.navigateTo({ url: '/pages/privacy/index' })
}

onMounted(() => {
refreshCaptcha()
})
</script>

<style scoped>
.register-page {
min-height: 100vh;
padding: 56rpx 48rpx;
background: linear-gradient(180deg, #0D1117 0%, #161B22 100%);
}

.header-section {
margin-bottom: 32rpx;
text-align: center;
}

.page-title {
font-size: 48rpx;
font-weight: 600;
color: #F0F6FC;
}

.register-type {
display: flex;
gap: 24rpx;
margin-bottom: 32rpx;
}

.type-item {
flex: 1;
padding: 24rpx;
text-align: center;
background: rgba(22, 27, 34, 0.8);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 16rpx;
}

.type-item.active {
background: rgba(88, 166, 255, 0.2);
border-color: rgba(88, 166, 255, 0.3);
}

.type-text {
font-size: 28rpx;
color: #8B949E;
}

.type-item.active .type-text {
color: #58A6FF;
font-weight: 600;
}

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

.captcha-row {
display: flex;
gap: 16rpx;
align-items: center;
}

.captcha-input {
flex: 1;
}

.captcha-img {
width: 200rpx;
height: 88rpx;
background: rgba(30, 37, 46, 0.9);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 16rpx;
display: flex;
align-items: center;
justify-content: center;
overflow: hidden;
}

.captcha-image {
width: 100%;
height: 100%;
}

.captcha-loading {
font-size: 24rpx;
color: #58A6FF;
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
display: flex;
align-items: center;
justify-content: center;
}

.btn-code[disabled] {
background: rgba(48, 54, 61, 0.8);
border-color: rgba(48, 54, 61, 0.8);
color: #8B949E;
}

.agreement-section {
display: flex;
align-items: center;
flex-wrap: wrap;
margin: 32rpx 0;
padding: 0 16rpx;
}

.agreement-text {
font-size: 26rpx;
color: #8B949E;
margin-left: 8rpx;
}

.agreement-link {
font-size: 26rpx;
color: #58A6FF;
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
