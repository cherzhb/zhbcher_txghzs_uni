<template>
  <view class="agreement-page">
    <view class="header-section">
      <text class="page-title">用户协议</text>
    </view>

    <view class="content-section">
      <view class="agreement-content">
        <text class="section-title">一、服务条款</text>
        <text class="section-text">欢迎使用退休规划助手！本协议是您与退休规划助手之间关于使用本服务的法律协议。请您仔细阅读以下条款。</text>
        
        <text class="section-title">二、用户注册</text>
        <text class="section-text">1. 用户应提供真实、准确、完整的个人资料。
2. 用户应妥善保管账号和密码，因账号密码泄露造成的损失由用户自行承担。
3. 用户不得将账号转让、出借给他人使用。</text>
        
        <text class="section-title">三、使用规则</text>
        <text class="section-text">1. 用户不得利用本服务从事违法活动。
2. 用户不得干扰本服务的正常运行。
3. 用户不得侵犯他人的合法权益。</text>
        
        <text class="section-title">四、隐私保护</text>
        <text class="section-text">我们重视用户的隐私保护，具体内容请查看《隐私政策》。</text>
        
        <text class="section-title">五、免责声明</text>
        <text class="section-text">1. 本服务仅供参考，不构成任何投资建议。
2. 因不可抗力导致的服务中断，我们不承担责任。</text>
        
        <text class="section-title">六、协议修改</text>
        <text class="section-text">我们有权随时修改本协议，修改后的协议一经公布即生效。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
</script>

<style scoped>
.agreement-page {
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

.agreement-content {
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
