<template>
<view class="admin-page">
<!-- 左侧菜单 -->
<view class="sidebar">
<view class="sidebar-header">
<text class="logo">⚙️</text>
<text class="sidebar-title">管理后台</text>
</view>

<view class="sidebar-menu">
<view 
class="menu-item" 
:class="{ active: currentTab === 'users' }" 
@click="currentTab = 'users'"
>
<text class="menu-icon">👥</text>
<text class="menu-text">用户管理</text>
</view>

<view 
class="menu-item" 
:class="{ active: currentTab === 'articles' }" 
@click="currentTab = 'articles'"
>
<text class="menu-icon">📰</text>
<text class="menu-text">文章管理</text>
</view>

<view 
class="menu-item" 
:class="{ active: currentTab === 'password' }" 
@click="currentTab = 'password'"
>
<text class="menu-icon">🔐</text>
<text class="menu-text">修改密码</text>
</view>

<view 
class="menu-item" 
:class="{ active: currentTab === 'versions' }" 
@click="currentTab = 'versions'"
>
<text class="menu-icon">📱</text>
<text class="menu-text">版本管理</text>
</view>

<view class="menu-item menu-logout" @click="handleLogout">
<text class="menu-icon">🚪</text>
<text class="menu-text">退出登录</text>
</view>
</view>
</view>

<!-- 右侧内容区 -->
<view class="main-content">
<!-- 顶部统计 -->
<view class="stats-bar">
<view class="stat-item">
<text class="stat-value">{{ stats.users || 0 }}</text>
<text class="stat-label">用户</text>
</view>
<view class="stat-item">
<text class="stat-value">{{ stats.articles || 0 }}</text>
<text class="stat-label">文章</text>
</view>
<view class="stat-item">
<text class="stat-value">{{ stats.totalViews || 0 }}</text>
<text class="stat-label">浏览</text>
</view>
</view>

<!-- 用户管理 -->
<view class="content-panel" v-if="currentTab === 'users'">
<view class="panel-header">
<text class="panel-title">用户管理</text>
<text class="panel-subtitle">共 {{ users.length }} 个用户</text>
</view>
<scroll-view class="data-list" scroll-y>
<view class="user-card" v-for="user in users" :key="user.id">
<view class="user-card-header">
<view class="user-avatar">{{ (user.username || 'U')[0].toUpperCase() }}</view>
<view class="user-basic">
<text class="user-name">{{ user.username }}</text>
<text class="user-contact">{{ user.email || user.phone || '未绑定联系方式' }}</text>
</view>
<view class="user-tags">
<text class="tag-admin" v-if="user.is_admin">管理员</text>
<text class="tag-verified" v-if="user.is_verified">已验证</text>
</view>
</view>
<view class="user-card-body">
<view class="info-row">
<view class="info-item">
<text class="info-label">性别</text>
<text class="info-value">{{ user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未设置' }}</text>
</view>
<view class="info-item">
<text class="info-label">出生日期</text>
<text class="info-value">{{ user.birth_date || '未设置' }}</text>
</view>
<view class="info-item">
<text class="info-label">参保地</text>
<text class="info-value">{{ getLocationName(user.location_code) }}</text>
</view>
</view>
<view class="info-row">
<view class="info-item">
<text class="info-label">缴费年限</text>
<text class="info-value">{{ user.contribution_years || 0 }} 年</text>
</view>
<view class="info-item">
<text class="info-label">月工资</text>
<text class="info-value">{{ formatMoney(user.salary) }}</text>
</view>
<view class="info-item">
<text class="info-label">账户余额</text>
<text class="info-value">{{ formatMoney(user.account_balance) }}</text>
</view>
</view>
<view class="info-row">
<view class="info-item">
<text class="info-label">缴费指数</text>
<text class="info-value">{{ user.contribution_index || 1 }}</text>
</view>
<view class="info-item">
<text class="info-label">注册时间</text>
<text class="info-value">{{ formatDate(user.created_at) }}</text>
</view>
</view>
</view>
<view class="user-card-footer" v-if="!user.is_admin">
<button class="btn-delete-sm" @click="deleteUser(user.id)">删除用户</button>
</view>
</view>
</scroll-view>
</view>

<!-- 文章管理 -->
<view class="content-panel" v-if="currentTab === 'articles'">
<view class="panel-header">
<text class="panel-title">文章管理</text>
<button class="btn-add" @click="openArticleEditor()">+ 新增文章</button>
</view>
<scroll-view class="data-list" scroll-y>
<view class="data-item" v-for="article in articles" :key="article.id">
<view class="data-main">
<text class="data-title">{{ article.title }}</text>
<text class="data-desc">{{ article.category }} · 浏览 {{ article.view_count || 0 }}</text>
</view>
<view class="data-actions">
<button class="btn-edit-sm" @click="editArticle(article)">编辑</button>
<button class="btn-delete-sm" @click="deleteArticle(article.id)">删除</button>
</view>
</view>
</scroll-view>
</view>

<!-- 修改密码 -->
<view class="content-panel" v-if="currentTab === 'password'">
<view class="panel-header">
<text class="panel-title">修改密码</text>
</view>
<view class="form-container">
<view class="form-row">
<text class="form-label">原密码</text>
<input class="form-input" type="password" v-model="passwordForm.oldPassword" placeholder="请输入原密码" />
</view>
<view class="form-row">
<text class="form-label">新密码</text>
<input class="form-input" type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码（至少6位）" />
</view>
<view class="form-row">
<text class="form-label">确认密码</text>
<input class="form-input" type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
</view>
<button class="btn-submit" @click="changePassword">确认修改</button>
</view>
</view>

<!-- 版本管理 -->
<view class="content-panel" v-if="currentTab === 'versions'">
<view class="panel-header">
<text class="panel-title">版本管理</text>
<button class="btn-add" @click="openVersionEditor()">+ 发布版本</button>
</view>
<scroll-view class="data-list" scroll-y>
<view class="data-item" v-for="version in versions" :key="version.id">
<view class="data-main">
<text class="data-title">v{{ version.version }} ({{ version.platform }})</text>
<text class="data-desc">{{ version.update_type === 'force' ? '强制更新' : '可选更新' }} · {{ formatDate(version.created_at) }}</text>
</view>
</view>
</scroll-view>
</view>
</view>

<!-- 文章编辑弹窗 -->
<view class="modal-mask" v-if="showArticleEditor" @click="showArticleEditor = false">
<view class="modal-box" @click.stop>
<view class="modal-header">
<text class="modal-title">{{ articleForm.id ? '编辑文章' : '新增文章' }}</text>
<text class="modal-close" @click="showArticleEditor = false">×</text>
</view>
<scroll-view class="modal-body" scroll-y>
<view class="form-row">
<text class="form-label">标题</text>
<input class="form-input" v-model="articleForm.title" placeholder="请输入文章标题" />
</view>
<view class="form-row">
<text class="form-label">分类</text>
<picker :value="categoryIndex" :range="categoryNames" @change="onCategoryChange">
<view class="form-picker">{{ categoryNames[categoryIndex] }} ▼</view>
</picker>
</view>
<view class="form-row">
<text class="form-label">摘要</text>
<textarea class="form-textarea" v-model="articleForm.summary" placeholder="请输入文章摘要" />
</view>
<view class="form-row">
<text class="form-label">内容</text>
<textarea class="form-textarea" v-model="articleForm.content" placeholder="请输入文章内容" />
</view>
</scroll-view>
<view class="modal-footer">
<button class="btn-cancel" @click="showArticleEditor = false">取消</button>
<button class="btn-confirm" @click="saveArticle">保存</button>
</view>
</view>
</view>

<!-- 版本发布弹窗 -->
<view class="modal-mask" v-if="showVersionEditor" @click="showVersionEditor = false">
<view class="modal-box" @click.stop>
<view class="modal-header">
<text class="modal-title">发布新版本</text>
<text class="modal-close" @click="showVersionEditor = false">×</text>
</view>
<view class="modal-body">
<view class="form-row">
<text class="form-label">版本号</text>
<input class="form-input" v-model="versionForm.version" placeholder="如: 1.0.1" />
</view>
<view class="form-row">
<text class="form-label">版本代码</text>
<input class="form-input" type="number" v-model="versionForm.versionCode" placeholder="如: 101" />
</view>
<view class="form-row">
<text class="form-label">平台</text>
<picker :value="platformIndex" :range="platformNames" @change="onPlatformChange">
<view class="form-picker">{{ platformNames[platformIndex] }} ▼</view>
</picker>
</view>
<view class="form-row">
<text class="form-label">更新类型</text>
<picker :value="updateTypeIndex" :range="updateTypeNames" @change="onUpdateTypeChange">
<view class="form-picker">{{ updateTypeNames[updateTypeIndex] }} ▼</view>
</picker>
</view>
<view class="form-row">
<text class="form-label">更新内容</text>
<textarea class="form-textarea" v-model="versionForm.updateContent" placeholder="请输入更新内容" />
</view>
</view>
<view class="modal-footer">
<button class="btn-cancel" @click="showVersionEditor = false">取消</button>
<button class="btn-confirm" @click="saveVersion">发布</button>
</view>
</view>
</view>
</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const currentTab = ref('users')
const stats = ref({})
const users = ref([])
const articles = ref([])
const versions = ref([])

// 文章相关
const showArticleEditor = ref(false)
const articleForm = ref({ id: null, title: '', summary: '', content: '', category: 'policy' })
const categories = ['policy', 'health', 'finance', 'life', 'news']
const categoryNames = ['政策解读', '健康养生', '财务规划', '生活方式', '新闻资讯']
const categoryIndex = ref(0)

// 版本相关
const showVersionEditor = ref(false)
const versionForm = ref({ version: '', versionCode: '', platform: 'android', updateType: 'optional', updateContent: '' })
const platforms = ['android', 'ios']
const platformNames = ['Android', 'iOS']
const platformIndex = ref(0)
const updateTypes = ['optional', 'force']
const updateTypeNames = ['可选更新', '强制更新']
const updateTypeIndex = ref(0)

// 密码
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

const getToken = () => uni.getStorageSync('admin_token')

const formatDate = (date) => {
if (!date) return ''
return date.split('T')[0] || date.split(' ')[0]
}

const formatMoney = (value) => {
if (!value) return '¥0'
return '¥' + Number(value).toLocaleString()
}

const getLocationName = (code) => {
const locations = {
'110000': '北京市',
'120000': '天津市',
'310000': '上海市',
'440000': '广东省',
'440300': '深圳市',
'330000': '浙江省',
'320000': '江苏省',
'510000': '四川省',
'420000': '湖北省',
'370000': '山东省'
}
return locations[code] || code || '未设置'
}

// 加载数据
const loadStats = async () => {
try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/admin/stats',
header: { 'Authorization': `Bearer ${getToken()}` }
})
if (res.statusCode === 200) stats.value = res.data
} catch (e) { console.error(e) }
}

const loadUsers = async () => {
try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/admin/users',
header: { 'Authorization': `Bearer ${getToken()}` }
})
if (res.statusCode === 200) users.value = res.data
} catch (e) { console.error(e) }
}

const loadArticles = async () => {
try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/admin/articles',
header: { 'Authorization': `Bearer ${getToken()}` }
})
if (res.statusCode === 200) articles.value = res.data.list || res.data
} catch (e) { console.error(e) }
}

const loadVersions = async () => {
try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/admin/versions',
header: { 'Authorization': `Bearer ${getToken()}` }
})
if (res.statusCode === 200) versions.value = res.data
} catch (e) { console.error(e) }
}

// 用户操作
const deleteUser = (id) => {
uni.showModal({
title: '确认删除',
content: '确定要删除该用户吗？',
success: async (res) => {
if (res.confirm) {
try {
const resp = await uni.request({
url: `https://uni.q-fan.cn/api/admin/users/${id}`,
method: 'DELETE',
header: { 'Authorization': `Bearer ${getToken()}` }
})
if (resp.statusCode === 200) {
uni.showToast({ title: '已删除', icon: 'success' })
loadUsers()
loadStats()
}
} catch (e) {
uni.showToast({ title: '删除失败', icon: 'none' })
}
}
}
})
}

// 文章操作
const openArticleEditor = () => {
articleForm.value = { id: null, title: '', summary: '', content: '', category: 'policy' }
categoryIndex.value = 0
showArticleEditor.value = true
}

const editArticle = (article) => {
articleForm.value = {
id: article.id,
title: article.title,
summary: article.summary || '',
content: article.content || '',
category: article.category || 'policy'
}
categoryIndex.value = categories.indexOf(article.category || 'policy')
showArticleEditor.value = true
}

const saveArticle = async () => {
if (!articleForm.value.title) {
uni.showToast({ title: '请输入标题', icon: 'none' })
return
}
try {
const url = articleForm.value.id
? `https://uni.q-fan.cn/api/admin/articles/${articleForm.value.id}`
: 'https://uni.q-fan.cn/api/admin/articles'
const method = articleForm.value.id ? 'PUT' : 'POST'
const res = await uni.request({
url, method,
header: { 'Authorization': `Bearer ${getToken()}` },
data: {
title: articleForm.value.title,
summary: articleForm.value.summary,
content: articleForm.value.content,
category: articleForm.value.category,
is_published: true
}
})
if (res.statusCode === 200) {
uni.showToast({ title: '保存成功', icon: 'success' })
showArticleEditor.value = false
loadArticles()
loadStats()
}
} catch (e) {
uni.showToast({ title: '保存失败', icon: 'none' })
}
}

const deleteArticle = (id) => {
uni.showModal({
title: '确认删除',
content: '确定要删除该文章吗？',
success: async (res) => {
if (res.confirm) {
try {
const resp = await uni.request({
url: `https://uni.q-fan.cn/api/admin/articles/${id}`,
method: 'DELETE',
header: { 'Authorization': `Bearer ${getToken()}` }
})
if (resp.statusCode === 200) {
uni.showToast({ title: '已删除', icon: 'success' })
loadArticles()
loadStats()
}
} catch (e) {
uni.showToast({ title: '删除失败', icon: 'none' })
}
}
}
})
}

const onCategoryChange = (e) => {
categoryIndex.value = e.detail.value
articleForm.value.category = categories[e.detail.value]
}

// 密码操作
const changePassword = async () => {
if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
uni.showToast({ title: '请填写完整', icon: 'none' })
return
}
if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
uni.showToast({ title: '两次密码不一致', icon: 'none' })
return
}
if (passwordForm.value.newPassword.length < 6) {
uni.showToast({ title: '密码至少6位', icon: 'none' })
return
}
try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/admin/change-password',
method: 'POST',
header: { 'Authorization': `Bearer ${getToken()}` },
data: {
oldPassword: passwordForm.value.oldPassword,
newPassword: passwordForm.value.newPassword
}
})
if (res.statusCode === 200) {
uni.showToast({ title: '修改成功', icon: 'success' })
passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
} else {
uni.showToast({ title: res.data?.error || '修改失败', icon: 'none' })
}
} catch (e) {
uni.showToast({ title: '修改失败', icon: 'none' })
}
}

// 版本操作
const openVersionEditor = () => {
versionForm.value = { version: '', versionCode: '', platform: 'android', updateType: 'optional', updateContent: '' }
platformIndex.value = 0
updateTypeIndex.value = 0
showVersionEditor.value = true
}

const onPlatformChange = (e) => {
platformIndex.value = e.detail.value
versionForm.value.platform = platforms[e.detail.value]
}

const onUpdateTypeChange = (e) => {
updateTypeIndex.value = e.detail.value
versionForm.value.updateType = updateTypes[e.detail.value]
}

const saveVersion = async () => {
if (!versionForm.value.version || !versionForm.value.versionCode) {
uni.showToast({ title: '请填写完整', icon: 'none' })
return
}
try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/admin/versions',
method: 'POST',
header: { 'Authorization': `Bearer ${getToken()}` },
data: {
version: versionForm.value.version,
versionCode: parseInt(versionForm.value.versionCode),
platform: versionForm.value.platform,
updateType: versionForm.value.updateType,
updateContent: versionForm.value.updateContent
}
})
if (res.statusCode === 200) {
uni.showToast({ title: '发布成功', icon: 'success' })
showVersionEditor.value = false
loadVersions()
}
} catch (e) {
uni.showToast({ title: '发布失败', icon: 'none' })
}
}

// 退出
const handleLogout = () => {
uni.showModal({
title: '退出登录',
content: '确定要退出吗？',
success: (res) => {
if (res.confirm) {
uni.removeStorageSync('admin_token')
uni.removeStorageSync('admin_user')
uni.redirectTo({ url: '/pages/admin-login/index' })
}
}
})
}

// 检查登录状态
const checkAuth = () => {
const token = uni.getStorageSync('admin_token')
const user = uni.getStorageSync('admin_user')
if (!token || !user) {
uni.redirectTo({ url: '/pages/admin-login/index' })
return false
}
return true
}

onMounted(() => {
if (checkAuth()) {
loadStats()
loadUsers()
loadArticles()
loadVersions()
}
})

onShow(() => {
if (checkAuth()) {
loadStats()
loadUsers()
loadArticles()
loadVersions()
}
})
</script>

<style scoped>
.admin-page {
display: flex;
min-height: 100vh;
background: #0D1117;
}

/* 左侧菜单 */
.sidebar {
width: 320rpx;
min-width: 320rpx;
background: #161B22;
border-right: 1rpx solid #30363D;
display: flex;
flex-direction: column;
}

.sidebar-header {
padding: 32rpx 24rpx;
border-bottom: 1rpx solid #30363D;
display: flex;
align-items: center;
gap: 12rpx;
}

.logo {
font-size: 36rpx;
}

.sidebar-title {
font-size: 28rpx;
font-weight: 600;
color: #F0F6FC;
}

.sidebar-menu {
flex: 1;
padding: 16rpx 0;
}

.menu-item {
display: flex;
align-items: center;
gap: 12rpx;
padding: 24rpx 24rpx;
color: #8B949E;
cursor: pointer;
}

.menu-item.active {
background: rgba(88, 166, 255, 0.15);
color: #58A6FF;
border-left: 4rpx solid #58A6FF;
}

.menu-icon {
font-size: 28rpx;
}

.menu-text {
font-size: 26rpx;
}

.menu-logout {
color: #F85149;
margin-top: 16rpx;
border-top: 1rpx solid #30363D;
padding-top: 32rpx;
}

.sidebar-footer {
padding: 24rpx;
border-top: 1rpx solid #30363D;
display: flex;
align-items: center;
justify-content: center;
gap: 12rpx;
color: #F85149;
cursor: pointer;
background: rgba(248, 81, 73, 0.1);
}

/* 右侧内容 */
.main-content {
flex: 1;
display: flex;
flex-direction: column;
}

.stats-bar {
display: flex;
padding: 24rpx;
gap: 24rpx;
background: #161B22;
border-bottom: 1rpx solid #30363D;
}

.stat-item {
flex: 1;
text-align: center;
padding: 16rpx;
background: #0D1117;
border-radius: 12rpx;
}

.stat-value {
font-size: 40rpx;
font-weight: 600;
color: #58A6FF;
display: block;
}

.stat-label {
font-size: 22rpx;
color: #8B949E;
}

/* 内容面板 */
.content-panel {
flex: 1;
display: flex;
flex-direction: column;
padding: 24rpx;
}

.panel-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 24rpx;
}

.panel-title {
font-size: 32rpx;
font-weight: 600;
color: #F0F6FC;
}

.panel-subtitle {
font-size: 24rpx;
color: #8B949E;
}

/* 数据列表 */
.data-list {
flex: 1;
}

.data-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 24rpx;
background: #161B22;
border: 1rpx solid #30363D;
border-radius: 12rpx;
margin-bottom: 16rpx;
}

.data-main {
flex: 1;
}

.data-title {
font-size: 28rpx;
color: #F0F6FC;
display: block;
margin-bottom: 8rpx;
}

.data-desc {
font-size: 22rpx;
color: #8B949E;
}

.data-actions {
display: flex;
gap: 12rpx;
align-items: center;
}

.tag-admin {
font-size: 22rpx;
color: #3FB950;
background: rgba(63, 185, 80, 0.2);
padding: 8rpx 16rpx;
border-radius: 6rpx;
}

/* 按钮 */
.btn-add {
font-size: 24rpx;
color: #58A6FF;
background: rgba(88, 166, 255, 0.2);
padding: 12rpx 24rpx;
border-radius: 8rpx;
border: none;
}

.btn-edit-sm, .btn-delete-sm {
font-size: 22rpx;
padding: 8rpx 16rpx;
border-radius: 6rpx;
border: none;
}

.btn-edit-sm {
color: #58A6FF;
background: rgba(88, 166, 255, 0.2);
}

.btn-delete-sm {
color: #F85149;
background: rgba(248, 81, 73, 0.2);
}

/* 表单 */
.form-container {
background: #161B22;
border: 1rpx solid #30363D;
border-radius: 12rpx;
padding: 32rpx;
}

.form-row {
margin-bottom: 24rpx;
}

.form-label {
font-size: 26rpx;
color: #8B949E;
display: block;
margin-bottom: 12rpx;
}

.form-input, .form-textarea, .form-picker {
width: 100%;
background: #0D1117;
border: 1rpx solid #30363D;
border-radius: 8rpx;
padding: 20rpx;
font-size: 28rpx;
color: #F0F6FC;
box-sizing: border-box;
}

.form-textarea {
min-height: 120rpx;
}

.btn-submit {
width: 100%;
height: 80rpx;
background: linear-gradient(135deg, #58A6FF, #3FB950);
border-radius: 40rpx;
font-size: 28rpx;
font-weight: 600;
color: #FFF;
border: none;
margin-top: 24rpx;
}

/* 弹窗 */
.modal-mask {
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.7);
display: flex;
align-items: center;
justify-content: center;
z-index: 999;
}

.modal-box {
width: 90%;
max-width: 600rpx;
max-height: 80vh;
background: #161B22;
border: 1rpx solid #30363D;
border-radius: 16rpx;
display: flex;
flex-direction: column;
}

.modal-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 24rpx;
border-bottom: 1rpx solid #30363D;
}

.modal-title {
font-size: 32rpx;
font-weight: 600;
color: #F0F6FC;
}

.modal-close {
font-size: 40rpx;
color: #8B949E;
}

.modal-body {
flex: 1;
padding: 24rpx;
overflow-y: auto;
}

.modal-footer {
display: flex;
gap: 16rpx;
padding: 24rpx;
border-top: 1rpx solid #30363D;
}

.btn-cancel, .btn-confirm {
flex: 1;
height: 72rpx;
border-radius: 36rpx;
font-size: 28rpx;
border: none;
}

.btn-cancel {
background: #30363D;
color: #8B949E;
}

.btn-confirm {
background: #58A6FF;
color: #FFF;
}

/* 用户卡片 */
.user-card {
background: #161B22;
border: 1rpx solid #30363D;
border-radius: 16rpx;
margin-bottom: 24rpx;
overflow: hidden;
}

.user-card-header {
display: flex;
align-items: center;
padding: 24rpx;
border-bottom: 1rpx solid #30363D;
}

.user-avatar {
width: 80rpx;
height: 80rpx;
background: linear-gradient(135deg, #58A6FF, #3FB950);
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 36rpx;
font-weight: 600;
color: #FFF;
margin-right: 20rpx;
}

.user-basic {
flex: 1;
}

.user-name {
font-size: 30rpx;
font-weight: 600;
color: #F0F6FC;
display: block;
margin-bottom: 6rpx;
}

.user-contact {
font-size: 24rpx;
color: #8B949E;
}

.user-tags {
display: flex;
gap: 12rpx;
}

.tag-verified {
font-size: 22rpx;
color: #58A6FF;
background: rgba(88, 166, 255, 0.2);
padding: 8rpx 16rpx;
border-radius: 6rpx;
}

.user-card-body {
padding: 20rpx 24rpx;
}

.info-row {
display: flex;
margin-bottom: 16rpx;
}

.info-row:last-child {
margin-bottom: 0;
}

.info-item {
flex: 1;
}

.info-label {
font-size: 22rpx;
color: #8B949E;
display: block;
margin-bottom: 6rpx;
}

.info-value {
font-size: 26rpx;
color: #F0F6FC;
}

.user-card-footer {
padding: 16rpx 24rpx;
border-top: 1rpx solid #30363D;
text-align: right;
}
</style>
