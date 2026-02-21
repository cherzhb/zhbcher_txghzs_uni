<template>
  <view class="version-page">
    <view class="header-section">
      <text class="page-title">版本管理</text>
    </view>

    <view class="version-list">
      <view class="version-item" v-for="(item, index) in versions" :key="index">
        <view class="version-header">
          <text class="version-number">v{{ item.version }}</text>
          <text class="version-date">{{ item.date }}</text>
        </view>
        <view class="version-content">
          <text class="version-desc">{{ item.description }}</text>
        </view>
      </view>
    </view>

    <view class="current-version">
      <text class="current-label">当前版本</text>
      <text class="current-value">v1.0.0</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const versions = ref([
  {
    version: '1.0.0',
    date: '2024-02-20',
    description: '1. 首次发布\n2. 支持退休倒计时功能\n3. 支持养老金计算\n4. 支持个人档案管理'
  },
  {
    version: '0.9.0',
    date: '2024-02-15',
    description: '1. Beta测试版本\n2. 基础功能开发完成'
  }
])
</script>

<style scoped>
.version-page {
  min-height: 100vh;
  padding: 56rpx 48rpx;
  background: linear-gradient(180deg, #0D1117 0%, #161B22 100%);
}

.header-section {
  margin-bottom: 32rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #F0F6FC;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.version-item {
  padding: 32rpx;
  background: rgba(22, 27, 34, 0.8);
  border: 1rpx solid rgba(240, 246, 252, 0.1);
  border-radius: 24rpx;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.version-number {
  font-size: 32rpx;
  font-weight: 600;
  color: #58A6FF;
}

.version-date {
  font-size: 24rpx;
  color: #8B949E;
}

.version-content {
  padding: 24rpx;
  background: rgba(30, 37, 46, 0.9);
  border-radius: 16rpx;
}

.version-desc {
  font-size: 28rpx;
  color: #C9D1D9;
  line-height: 1.8;
  white-space: pre-wrap;
}

.current-version {
  position: fixed;
  bottom: 100rpx;
  left: 48rpx;
  right: 48rpx;
  padding: 32rpx;
  background: rgba(88, 166, 255, 0.1);
  border: 1rpx solid rgba(88, 166, 255, 0.3);
  border-radius: 24rpx;
  text-align: center;
}

.current-label {
  font-size: 28rpx;
  color: #8B949E;
  display: block;
  margin-bottom: 8rpx;
}

.current-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #58A6FF;
}
</style>
