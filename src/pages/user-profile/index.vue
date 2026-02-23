<template>
  <view class="user-profile-page">
    <view class="header-section">
      <text class="page-title">个人信息</text>
    </view>

    <!-- 加载中 -->
    <view class="loading-section" v-if="isLoading">
      <view class="glass-card loading-card">
        <text class="loading-text">正在加载数据...</text>
      </view>
    </view>

    <!-- 内容 -->
    <block v-else>
      <!-- 基础信息 -->
      <view class="section">
        <view class="glass-card">
          <text class="section-title">基础信息</text>

          <view class="form-item">
            <text class="form-label">用户名</text>
            <text class="form-value">{{ user.username }}</text>
          </view>

          <view class="form-item">
            <text class="form-label">邮箱</text>
            <text class="form-value">{{ user.email || '未设置' }}</text>
          </view>

          <view class="form-item" @click="openGenderPicker">
            <text class="form-label">性别</text>
            <view class="form-value-wrap">
              <text class="form-value">{{ genderText }}</text>
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="form-item" @click="showDatePicker = true">
            <text class="form-label">出生日期</text>
            <view class="form-value-wrap">
              <text class="form-value">{{ birthDateDisplay || '请选择' }}</text>
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="form-item" @click="openJobTypePicker">
            <text class="form-label">岗位类型</text>
            <view class="form-value-wrap">
              <text class="form-value">{{ jobTypeText }}</text>
              <text class="arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 测算参数 -->
      <view class="section">
        <view class="glass-card">
          <text class="section-title">测算参数</text>

          <view class="form-item" @click="openLocationPicker">
            <text class="form-label">参保地</text>
            <view class="form-value-wrap">
              <text class="form-value">{{ locationName }}</text>
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="form-item" @click="openYearsPicker">
            <text class="form-label">已缴费年限</text>
            <view class="form-value-wrap">
              <text class="form-value">{{ contributionYears }}年</text>
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="form-item" @click="openSalaryInput">
            <text class="form-label">月工资</text>
            <view class="form-value-wrap">
              <text class="form-value">¥{{ formatMoney(salary) }}</text>
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="form-item" @click="openBalanceInput">
            <text class="form-label">个人账户余额</text>
            <view class="form-value-wrap">
              <text class="form-value">¥{{ formatMoney(accountBalance) }}</text>
              <text class="arrow">›</text>
            </view>
          </view>

          <view class="form-item" @click="openIndexPicker">
            <text class="form-label">缴费指数</text>
            <view class="form-value-wrap">
              <text class="form-value">{{ contributionIndex.toFixed(1) }}</text>
              <text class="arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <view class="btn-section">
        <button class="btn-primary" @click="handleSave">保存修改</button>
      </view>
    </block>

    <!-- 日期选择器弹窗 -->
    <view class="date-picker-mask" v-if="showDatePicker" @click="showDatePicker = false">
      <view class="date-picker-popup" @click.stop>
        <view class="date-picker-header">
          <text class="date-picker-cancel" @click="showDatePicker = false">取消</text>
          <text class="date-picker-title">选择出生日期</text>
          <text class="date-picker-confirm" @click="confirmDate">确定</text>
        </view>
        <picker-view class="date-picker-view" :value="datePickerValue" @change="onDatePickerChange">
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in years" :key="index">{{ item }}年</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in months" :key="index">{{ item }}月</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in days" :key="index">{{ item }}日</view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 地区平均工资数据
const locationSalaries = {
  '110000': { name: '北京', salary: 11500 },
  '310000': { name: '上海', salary: 12100 },
  '440300': { name: '深圳', salary: 12800 },
  '440100': { name: '广州', salary: 11300 },
  '320100': { name: '南京', salary: 10800 },
  '330100': { name: '杭州', salary: 11000 },
  '420100': { name: '武汉', salary: 9500 },
  '430100': { name: '长沙', salary: 9200 },
  '410100': { name: '郑州', salary: 8800 },
  '320500': { name: '苏州', salary: 10500 }
}

// 岗位类型
const jobTypes = [
  { value: 1, text: '企业管理人员' },
  { value: 2, text: '企业普通职工' },
  { value: 3, text: '事业单位人员' },
  { value: 4, text: '公务员' }
]

// 加载状态
const isLoading = ref(true)

// 用户基础信息
const user = ref({
  username: '',
  email: ''
})

// 个人信息字段
const gender = ref(1)
const birthDate = ref('')
const jobType = ref(1)
const locationCode = ref('110000')
const salary = ref(10000)
const accountBalance = ref(0)
const contributionYears = ref(15)
const contributionIndex = ref(1.0)

// 日期选择器
const showDatePicker = ref(false)
const datePickerValue = ref([0, 0, 0])

// 生成年份列表 (1940-当前年份)
const currentYear = new Date().getFullYear()
const years = computed(() => {
  const arr = []
  for (let i = currentYear; i >= 1940; i--) {
    arr.push(i)
  }
  return arr
})

// 生成月份列表
const months = computed(() => {
  return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
})

// 生成日期列表
const days = computed(() => {
  const year = years.value[datePickerValue.value[0]] || currentYear
  const month = parseInt(months.value[datePickerValue.value[1]] || '01')
  // 获取该月的天数
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))
})

// 日期选择器变更
const onDatePickerChange = (e) => {
  datePickerValue.value = e.detail.value
}

// 确认日期选择
const confirmDate = () => {
  const year = years.value[datePickerValue.value[0]]
  const month = months.value[datePickerValue.value[1]]
  const day = days.value[datePickerValue.value[2]]
  birthDate.value = `${year}-${month}-${day}`
  showDatePicker.value = false
}

// 显示日期格式化
const birthDateDisplay = computed(() => {
  if (!birthDate.value) return ''
  const [year, month, day] = birthDate.value.split('-')
  return `${year}年${month}月${day}日`
})

// 计算属性
const genderText = computed(() => gender.value === 1 ? '男' : '女')
const jobTypeText = computed(() => {
  const found = jobTypes.find(j => j.value === jobType.value)
  return found ? found.text : '企业普通职工'
})
const locationName = computed(() => {
  const loc = locationSalaries[locationCode.value]
  return loc ? loc.name : '北京'
})

// 格式化金额
const formatMoney = (num) => {
  return Math.round(num).toLocaleString('zh-CN')
}

// 加载用户数据
const loadUserData = async () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  // 获取本地存储的用户基础信息
  const userData = uni.getStorageSync('user')
  if (userData) {
    user.value = userData
  }

  isLoading.value = true

  try {
    const res = await uni.request({
      url: 'https://uni.q-fan.cn/api/auth/me',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (res.statusCode === 200 && res.data) {
      gender.value = res.data.gender || 1
      birthDate.value = res.data.birth_date || ''
      jobType.value = res.data.job_type || 1
      locationCode.value = res.data.location_code || '110000'
      salary.value = res.data.salary || 10000
      accountBalance.value = res.data.account_balance || 0
      contributionYears.value = res.data.contribution_years || 15
      contributionIndex.value = res.data.contribution_index || 1.0

      // 更新用户名
      if (res.data.username) {
        user.value.username = res.data.username
      }
      if (res.data.email) {
        user.value.email = res.data.email
      }

      // 更新日期选择器的值
      if (res.data.birth_date) {
        const [year, month, day] = res.data.birth_date.split('-')
        const yearIndex = years.value.indexOf(parseInt(year))
        const monthIndex = parseInt(month) - 1
        const dayIndex = parseInt(day) - 1
        datePickerValue.value = [
          yearIndex >= 0 ? yearIndex : 0,
          monthIndex,
          dayIndex
        ]
      }
    }
  } catch (err) {
    console.error('加载用户数据失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 选择器方法
const openGenderPicker = () => {
  uni.showActionSheet({
    itemList: ['男', '女'],
    success: (res) => {
      gender.value = res.tapIndex === 0 ? 1 : 2
    }
  })
}

const openJobTypePicker = () => {
  uni.showActionSheet({
    itemList: jobTypes.map(j => j.text),
    success: (res) => {
      jobType.value = jobTypes[res.tapIndex].value
    }
  })
}

const openLocationPicker = () => {
  uni.showActionSheet({
    itemList: Object.values(locationSalaries).map(l => l.name),
    success: (res) => {
      const codes = Object.keys(locationSalaries)
      locationCode.value = codes[res.tapIndex]
    }
  })
}

const openYearsPicker = () => {
  const years = Array.from({ length: 46 }, (_, i) => i + '年')
  uni.showActionSheet({
    itemList: years,
    success: (res) => {
      contributionYears.value = res.tapIndex
    }
  })
}

const openSalaryInput = () => {
  uni.showModal({
    title: '输入月工资',
    editable: true,
    placeholderText: '请输入月工资金额',
    content: String(salary.value),
    success: (res) => {
      if (res.confirm && res.content) {
        salary.value = parseInt(res.content) || 0
      }
    }
  })
}

const openBalanceInput = () => {
  uni.showModal({
    title: '输入个人账户余额',
    editable: true,
    placeholderText: '请输入个人账户余额',
    content: String(accountBalance.value),
    success: (res) => {
      if (res.confirm && res.content) {
        accountBalance.value = parseInt(res.content) || 0
      }
    }
  })
}

const openIndexPicker = () => {
  const indexes = Array.from({ length: 25 }, (_, i) => (0.6 + i * 0.1).toFixed(1))
  uni.showActionSheet({
    itemList: indexes,
    success: (res) => {
      contributionIndex.value = 0.6 + res.tapIndex * 0.1
    }
  })
}

// 保存修改
const handleSave = async () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  try {
    const res = await uni.request({
      url: 'https://uni.q-fan.cn/api/auth/profile',
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        gender: gender.value,
        birth_date: birthDate.value,
        job_type: jobType.value,
        location_code: locationCode.value,
        salary: salary.value,
        account_balance: accountBalance.value,
        contribution_years: contributionYears.value,
        contribution_index: contributionIndex.value
      }
    })

    if (res.statusCode === 200) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.data?.error || '保存失败', icon: 'none' })
    }
  } catch (err) {
    console.error('保存失败:', err)
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

onMounted(() => {
  loadUserData()
  // 设置日期选择器默认值为当前日期往前30年
  const defaultYear = currentYear - 30
  const yearIndex = years.value.indexOf(defaultYear)
  datePickerValue.value = [yearIndex >= 0 ? yearIndex : 0, 0, 0]
})
</script>

<style scoped>
.user-profile-page {
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
}

/* Loading */
.loading-section {
  margin-bottom: 32rpx;
}

.loading-card {
  text-align: center;
  padding: 64rpx 32rpx;
}

.loading-text {
  color: #8B949E;
  font-size: 28rpx;
}

.section {
  margin-bottom: 32rpx;
}

.glass-card {
  background: rgba(22, 27, 34, 0.8);
  border: 1rpx solid rgba(240, 246, 252, 0.1);
  border-radius: 24rpx;
  padding: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #58A6FF;
  display: block;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid rgba(88, 166, 255, 0.2);
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid rgba(240, 246, 252, 0.05);
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 30rpx;
  color: #8B949E;
}

.form-value {
  font-size: 30rpx;
  color: #F0F6FC;
}

.form-value-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.arrow {
  font-size: 32rpx;
  color: #8B949E;
}

.btn-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx 48rpx;
  background: rgba(13, 17, 23, 0.95);
  backdrop-filter: blur(20rpx);
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

/* Date Picker */
.date-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.date-picker-popup {
  width: 100%;
  background: #1e252e;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
}

.date-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid rgba(240, 246, 252, 0.1);
}

.date-picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #F0F6FC;
}

.date-picker-cancel {
  font-size: 28rpx;
  color: #8B949E;
  padding: 16rpx 24rpx;
}

.date-picker-confirm {
  font-size: 28rpx;
  color: #58A6FF;
  padding: 16rpx 24rpx;
  font-weight: 600;
}

.date-picker-view {
  height: 500rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #F0F6FC;
}
</style>
