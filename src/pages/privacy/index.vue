<template>
  <view class="privacy-page">
    <view class="header-section">
      <text class="page-title">隐私政策</text>
    </view>

    <view class="content-section">
      <view class="privacy-content">
        <text class="section-title">一、信息收集</text>
        <text class="section-text">我们收集以下信息：
1. 注册信息：用户名、密码、邮箱
2. 个人信息：性别、出生日期、退休年龄
3. 使用数据：登录记录、计算记录</text>
        
        <text class="section-title">二、信息使用</text>
        <text class="section-text">我们使用收集的信息用于：
1. 提供、维护和改进我们的服务
2. 发送服务相关通知
3. 进行数据分析以改善用户体验</text>
        
        <text class="section-title">三、信息保护</text>
        <text class="section-text">我们采取以下措施保护您的信息：
1. 数据加密存储
2. 访问权限控制
3. 定期安全审计</text>
        
        <text class="section-title">四、信息共享</text>
        <text class="section-text">未经您的同意，我们不会向第三方披露您的个人信息，但以下情况除外：
1. 法律法规要求
2. 政府部门要求
3. 保护我们或用户的权益</text>
        
        <text class="section-title">五、用户权利</text>
        <text class="section-text">您有权：
1. 查询和更正您的个人信息
2. 删除您的账号
3. 撤回授权同意</text>
        
        <text class="section-title">六、联系我们</text>
        <text class="section-text">如有任何问题，请通过以下方式联系我们：
邮箱：support@txghzs.com</text>
      </view>
    </view>
  </view>
</template>

<script setup>
</script>

<style scoped>
.privacy-page {
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

.content-section {
  padding: 32rpx;
  background: rgba(22, 27, 34, 0.8);
  border: 1rpx solid rgba(240, 246, 252, 0.1);
  border-radius: 24rpx;
}

.privacy-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #58A6FF;
  display: block;
  margin-top: 16rpx;
}

.section-text {
  font-size: 28rpx;
  color: #C9D1D9;
  line-height: 1.8;
  display: block;
}
</style>
