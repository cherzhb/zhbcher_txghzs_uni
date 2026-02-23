<template>
<view class="records-page">
<view class="header-section">
<text class="page-title">我的记录</text>
</view>
<view class="records-list">
<view class="empty-state" v-if="records.length === 0">
<text class="empty-icon">📋</text>
<text class="empty-text">暂无记录</text>
<text class="empty-desc">开始记录您的退休规划吧</text>
</view>
<view class="record-item" v-for="(record, index) in records" :key="index">
<view class="record-header">
<text class="record-title">{{ record.title }}</text>
<text class="record-date">{{ formatDate(record.date) }}</text>
</view>
<view class="record-content">
<text class="record-text">{{ record.content }}</text>
</view>
</view>
</view>
</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const records = ref([])

const formatDate = (date) => {
if (!date) return ''
try {
const d = new Date(date)
const year = d.getFullYear()
const month = String(d.getMonth() + 1).padStart(2, '0')
const day = String(d.getDate()).padStart(2, '0')
return `${year}年${month}月${day}日`
} catch (e) {
return ''
}
}

onMounted(() => {
// 加载记录
const saved = uni.getStorageSync('pension_records')
if (saved && Array.isArray(saved)) {
records.value = saved
}
})
</script>

<style scoped>
.records-page {
min-height: 100vh;
padding: 56rpx 48rpx;
background: linear-gradient(180deg, #0D1117 0%, #161B22 100%);
}

.header-section {
margin-bottom: 32rpx;
}

.page-title {
font-size: 56rpx;
font-weight: 600;
color: #F0F6FC;
}

.records-list {
display: flex;
flex-direction: column;
gap: 24rpx;
}

.empty-state {
display: flex;
flex-direction: column;
align-items: center;
padding: 120rpx 0;
}

.empty-icon {
font-size: 120rpx;
margin-bottom: 32rpx;
}

.empty-text {
font-size: 32rpx;
color: #8B949E;
display: block;
margin-bottom: 16rpx;
}

.empty-desc {
font-size: 28rpx;
color: #484F58;
}

.record-item {
background: rgba(22, 27, 34, 0.8);
border: 1rpx solid rgba(240, 246, 252, 0.1);
border-radius: 24rpx;
padding: 32rpx;
}

.record-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 16rpx;
}

.record-title {
font-size: 32rpx;
font-weight: 600;
color: #F0F6FC;
}

.record-date {
font-size: 24rpx;
color: #8B949E;
}

.record-content {
background: rgba(30, 37, 46, 0.9);
border-radius: 16rpx;
padding: 24rpx;
}

.record-text {
font-size: 28rpx;
color: #8B949E;
line-height: 1.6;
}
</style>
