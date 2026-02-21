<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (token) {
    console.log('用户已登录')
  }
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
page {
  background: #0D1117;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
}

/* 通用类 */
.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
