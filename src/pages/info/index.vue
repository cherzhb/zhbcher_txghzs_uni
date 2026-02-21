<template>
<view class="info-page">
<!-- Header -->
<view class="header-section">
<text class="page-title">养老资讯</text>
<text class="page-subtitle">获取最新政策与健康信息</text>
</view>

<!-- 分类标签 -->
<scroll-view class="categories" scroll-x>
<view 
class="category-item" 
:class="{ active: activeCategory === '' }"
@click="selectCategory('')"
>
全部
</view>
<view 
class="category-item" 
:class="{ active: activeCategory === 'policy' }"
@click="selectCategory('policy')"
>
政策
</view>
<view 
class="category-item" 
:class="{ active: activeCategory === 'health' }"
@click="selectCategory('health')"
>
健康
</view>
<view 
class="category-item" 
:class="{ active: activeCategory === 'finance' }"
@click="selectCategory('finance')"
>
理财
</view>
<view 
class="category-item" 
:class="{ active: activeCategory === 'life' }"
@click="selectCategory('life')"
>
生活
</view>
</scroll-view>

<!-- 文章列表 -->
<view class="articles-list" v-if="articles.length > 0">
<view 
class="article-card" 
v-for="article in articles" 
:key="article.id"
@click="goToDetail(article.id)"
>
<view class="article-category">{{ article.categoryLabel }}</view>
<view class="article-title">{{ article.title }}</view>
<view class="article-summary">{{ article.summary }}</view>
<view class="article-meta">
<text class="view-count">👁 {{ article.viewCount }}</text>
<text class="publish-time">📅 {{ article.publishTime }}</text>
</view>
</view>
</view>

<!-- 空状态 -->
<view class="empty-state" v-if="articles.length === 0 && !loading">
<text class="empty-icon">📰</text>
<text class="empty-text">暂无文章</text>
</view>

<!-- 加载状态 -->
<view class="loading-state" v-if="loading">
<text class="loading-text">加载中...</text>
</view>
</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// 分类名称映射
const categoryNames = {
policy: '政策',
health: '健康',
finance: '理财',
life: '生活',
news: '新闻'
}

// 当前分类
const activeCategory = ref('')

// 文章列表
const articles = ref([])

// 加载状态
const loading = ref(false)

// 加载文章列表
const loadArticles = async () => {
loading.value = true

try {
const res = await uni.request({
url: 'https://uni.q-fan.cn/api/articles',
method: 'GET',
data: {
category: activeCategory.value || undefined,
limit: 50
}
})

if (res.statusCode === 200 && res.data) {
articles.value = res.data.map(a => ({
id: a.id,
title: a.title,
summary: a.summary,
category: a.category,
categoryLabel: categoryNames[a.category] || a.category,
viewCount: a.view_count || 0,
publishTime: a.created_at?.split('T')[0] || a.created_at?.split(' ')[0] || ''
}))
}
} catch (err) {
console.error('加载文章失败:', err)
} finally {
loading.value = false
}
}

// 选择分类
const selectCategory = (category) => {
activeCategory.value = category
loadArticles()
}

// 查看文章详情
const goToDetail = (id) => {
uni.navigateTo({
url: `/pages/info-detail/index?id=${id}`
})
}

onMounted(() => {
loadArticles()
})

onShow(() => {
loadArticles()
})
</script>

<style scoped>
.info-page {
min-height: 100vh;
padding: 56rpx 48rpx 200rpx;
background: linear-gradient(180deg, #0D1117 0%, #161B22 100%);
}

.header-section {
margin-bottom: 32rpx;
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
display: block;
margin-top: 8rpx;
}

/* 分类标签 */
.categories {
display: flex;
white-space: nowrap;
padding: 16rpx 0 32rpx;
margin-bottom: 16rpx;
}

.category-item {
display: inline-block;
padding: 16rpx 32rpx;
margin-right: 16rpx;
background: rgba(22, 27, 34, 0.8);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 32rpx;
font-size: 28rpx;
color: #8B949E;
}

.category-item.active {
background: linear-gradient(135deg, #58A6FF, #3FB950);
color: #FFFFFF;
border-color: transparent;
}

/* 文章列表 */
.articles-list {
display: flex;
flex-direction: column;
gap: 24rpx;
}

.article-card {
background: rgba(22, 27, 34, 0.8);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 24rpx;
padding: 32rpx;
}

.article-category {
display: inline-block;
padding: 8rpx 24rpx;
background: linear-gradient(135deg, #58A6FF, #3FB950);
color: #FFFFFF;
border-radius: 24rpx;
font-size: 22rpx;
font-weight: 500;
margin-bottom: 16rpx;
}

.article-title {
font-size: 32rpx;
font-weight: 600;
color: #F0F6FC;
margin-bottom: 12rpx;
line-height: 1.5;
display: block;
}

.article-summary {
font-size: 26rpx;
color: #8B949E;
line-height: 1.6;
margin-bottom: 16rpx;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
}

.article-meta {
display: flex;
gap: 32rpx;
font-size: 24rpx;
color: #8B949E;
}

.view-count, .publish-time {
display: flex;
align-items: center;
gap: 8rpx;
}

/* 空状态 */
.empty-state {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 160rpx 40rpx;
}

.empty-icon {
font-size: 128rpx;
margin-bottom: 32rpx;
opacity: 0.5;
}

.empty-text {
font-size: 30rpx;
color: #8B949E;
}

/* 加载状态 */
.loading-state {
display: flex;
justify-content: center;
padding: 80rpx 0;
}

.loading-text {
font-size: 28rpx;
color: #8B949E;
}
</style>
