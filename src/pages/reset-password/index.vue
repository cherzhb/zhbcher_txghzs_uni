<template>
  <view class="reset-page">
    <view class="header-section">
      <text class="page-title">重置密码</text>
    </view>

    <view class="form-section">
      <view class="glass-card">
        <view class="form-group">
          <text class="form-label">原密码</text>
          <input class="form-input" type="password" v-model="oldPassword" placeholder="请输入原密码" />
        </view>

        <view class="form-group">
          <text class="form-label">新密码</text>
          <input class="form-input" type="password" v-model="newPassword" placeholder="请输入新密码" />
        </view>

        <view class="form-group">
          <text class="form-label">确认密码</text>
          <input class="form-input" type="password" v-model="confirmPassword" placeholder="请再次输入新密码" />
        </view>
      </view>
    </view>

    <view class="btn-section">
      <button class="btn-primary" @click="handleReset">确认修改</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const handleReset = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  if (newPassword.value.length < 6) {
    uni.showToast({ title: '密码长度不能少于6位', icon: 'none' })
    return
  }

  try {
    const token = uni.getStorageSync('token')
    uni.showLoading({ title: '提交中...' })

    const res = await uni.request({
      url: 'https://uni.q-fan.cn/api/auth/reset-password',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      }
    })

    uni.hideLoading()

    if (res.data && res.data.message) {
      uni.showToast({ title: '密码修改成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.data?.error || '修改失败', icon: 'none' })
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
  font-size: 48rpx;
  font-weight: 600;
  color: #F0F6FC;
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

.btn-section {
  margin-top: 48rpx;
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
</style>
