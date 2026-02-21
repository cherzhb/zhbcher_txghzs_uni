<template>
  <view class="detail-page">
    <view class="header-section">
      <text class="page-title">{{ article.title }}</text>
      <text class="article-date">{{ article.date }}</text>
    </view>

    <view class="content-section">
      <view class="article-content">
        <text class="article-text">{{ article.content }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const article = ref({
  title: '2024年退休政策解读',
  date: '2024-01-15',
  content: `根据最新政策规定，退休年龄将逐步调整。具体变化如下：

一、退休年龄调整
男性职工退休年龄逐步延迟至65岁，女性职工延迟至60岁。

二、养老金计算
基础养老金 = (当地平均工资 + 本人指数化平均缴费工资) ÷ 2 × 缴费年限 × 1%
个人账户养老金 = 个人账户累计储存额 ÷ 计发月数

三、缴费年限
最低缴费年限为15年，缴费年限越长，养老金越高。

四、注意事项
1. 及时关注政策变化
2. 确保缴费记录准确
3. 合理规划退休时间`
})

onMounted(() => {
  // 可以根据 id 从后端加载文章详情
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding: 56rpx 48rpx;
  background: linear-gradient(180deg, #0D1117 0%, #161B22 100%);
}

.header-section {
  margin-bottom: 32rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #F0F6FC;
  display: block;
  margin-bottom: 16rpx;
}

.article-date {
  font-size: 28rpx;
  color: #8B949E;
}

.content-section {
  padding: 32rpx;
  background: rgba(22, 27, 34, 0.8);
  border: 1rpx solid rgba(240, 246, 252, 0.1);
  border-radius: 24rpx;
}

.article-content {
  line-height: 1.8;
}

.article-text {
  font-size: 30rpx;
  color: #C9D1D9;
  white-space: pre-wrap;
}
</style>
