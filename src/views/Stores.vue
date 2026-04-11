<template>
  <div class="stores-page">
    <Header />
    <el-container style="height: calc(100vh - 60px);">
      <!-- 左侧门店列表 -->
      <el-aside width="350px" class="store-list-sidebar">
        <div class="sidebar-header">
          <h2>门店列表</h2>
          <el-alert
            title="提示"
            type="info"
            :closable="false"
            show-icon
            style="margin-top: 10px; font-size: 12px;"
          >
            <template #default>
              <span>本系统为课程设计演示，门店数据为虚构示例，不代表真实商户</span>
            </template>
          </el-alert>
        </div>
        <div class="store-list">
          <el-card
            v-for="store in stores"
            :key="store.id"
            class="store-card"
            :class="{ active: selectedStoreId === store.id }"
            @click="selectStore(store)"
            shadow="hover"
          >
            <div class="store-info">
              <h3>{{ store.name }}</h3>
              <p class="store-address">
                <el-icon><Location /></el-icon>
                {{ store.address }}
              </p>
              <p class="store-phone" v-if="store.phone">
                <el-icon><Phone /></el-icon>
                {{ store.phone }}
              </p>
              <p class="store-hours" v-if="store.businessHours">
                <el-icon><Clock /></el-icon>
                {{ store.businessHours }}
              </p>
              <el-button
                type="primary"
                size="small"
                @click.stop="locateStore(store)"
                style="margin-top: 10px;"
              >
                定位
              </el-button>
            </div>
          </el-card>
        </div>
      </el-aside>

      <!-- 右侧地图区域 -->
      <el-main style="padding: 0;">
        <div id="map-container" style="width: 100%; height: 100%;"></div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Location, Phone, Clock } from '@element-plus/icons-vue'
import Header from '@/components/Header.vue'
import api from '@/api'

const stores = ref([])
const selectedStoreId = ref(null)
let map = null
let markers = []
let infoWindows = []

// 加载门店列表
const loadStores = async () => {
  try {
    const res = await api.store.getList()
    if (res.code === 200) {
      stores.value = res.data || []
    }
  } catch (error) {
    console.error('加载门店列表失败:', error)
    ElMessage.error('加载门店列表失败')
  }
}

// 初始化地图
const initMap = () => {
  // 检查是否已加载高德地图API
  if (typeof AMap === 'undefined') {
    ElMessage.error('地图API加载失败，请检查网络连接')
    return
  }

  // 默认中心点：福鼎市（如果没有门店，使用这个坐标）
  let center = [120.216389, 27.324444]
  
  // 如果有门店，使用第一个门店的坐标作为中心点
  if (stores.value.length > 0 && stores.value[0].longitude && stores.value[0].latitude) {
    center = [stores.value[0].longitude, stores.value[0].latitude]
  }

  // 创建地图实例
  map = new AMap.Map('map-container', {
    zoom: 13, // 初始缩放级别
    center: center,
    mapStyle: 'amap://styles/normal' // 地图样式
  })

  // 添加门店标记
  addStoreMarkers()
}

// 添加门店标记
const addStoreMarkers = () => {
  if (!map || stores.value.length === 0) return

  // 清除已有标记
  clearMarkers()

  stores.value.forEach(store => {
    if (!store.longitude || !store.latitude) return

    const position = [store.longitude, store.latitude]

    // 创建标记
    const marker = new AMap.Marker({
      position: position,
      title: store.name,
      map: map
    })

    // 创建信息窗口内容
    const infoWindow = new AMap.InfoWindow({
      content: createInfoWindowContent(store),
      offset: new AMap.Pixel(0, -30)
    })

    // 点击标记显示信息窗口
    marker.on('click', () => {
      // 关闭其他信息窗口
      infoWindows.forEach(iw => iw.close())
      infoWindow.open(map, marker.getPosition())
      selectedStoreId.value = store.id
    })

    markers.push(marker)
    infoWindows.push(infoWindow)
  })

  // 门店分散在较大范围时，自动缩放视野以包含全部标记
  if (markers.length > 0) {
    map.setFitView(markers, false, [80, 80, 80, 80], 16)
  }
}

// 创建信息窗口内容
const createInfoWindowContent = (store) => {
  return `
    <div style="padding: 10px; min-width: 200px;">
      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">${store.name}</h3>
      <p style="margin: 5px 0; color: #666; font-size: 14px;">
        <strong>地址：</strong>${store.address || '暂无'}
      </p>
      ${store.phone ? `<p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>电话：</strong>${store.phone}</p>` : ''}
      ${store.businessHours ? `<p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>营业时间：</strong>${store.businessHours}</p>` : ''}
      ${store.description ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">${store.description}</p>` : ''}
    </div>
  `
}

// 清除所有标记
const clearMarkers = () => {
  markers.forEach(marker => {
    marker.setMap(null)
  })
  infoWindows.forEach(iw => {
    iw.close()
  })
  markers = []
  infoWindows = []
}

// 选择门店
const selectStore = (store) => {
  selectedStoreId.value = store.id
  locateStore(store)
}

// 定位门店
const locateStore = (store) => {
  if (!map || !store.longitude || !store.latitude) return

  const position = [store.longitude, store.latitude]
  
  // 移动地图中心到门店位置
  map.setCenter(position)
  map.setZoom(16)

  // 找到对应的标记并打开信息窗口
  const index = stores.value.findIndex(s => s.id === store.id)
  if (index >= 0 && infoWindows[index]) {
    // 关闭其他信息窗口
    infoWindows.forEach(iw => iw.close())
    infoWindows[index].open(map, position)
  }
}

// 加载高德地图API
const loadAMapScript = () => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (typeof AMap !== 'undefined') {
      resolve()
      return
    }

    // 从环境变量或配置中获取API Key
    // 如果没有配置，使用一个公开的测试key（有调用限制）
    // 建议：在 .env 文件中配置 VITE_AMAP_KEY=你的高德地图Key
    const amapKey = import.meta.env.VITE_AMAP_KEY || 'YOUR_AMAP_KEY'
    
    // 创建script标签
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&callback=initAMap`
    
    // 全局回调函数
    window.initAMap = () => {
      resolve()
    }

    script.onerror = () => {
      reject(new Error('地图API加载失败，请检查API Key配置'))
    }

    document.head.appendChild(script)
  })
}

onMounted(async () => {
  try {
    // 先加载门店数据（不依赖地图API）
    await loadStores()
    // 然后加载高德地图API
    await loadAMapScript()
    // 地图API加载完成后，初始化地图
    if (typeof AMap !== 'undefined') {
      initMap()
    }
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.warning('地图API加载失败，门店列表仍可正常查看。如需使用地图功能，请配置高德地图API Key')
  }
})

onBeforeUnmount(() => {
  // 清理地图资源
  if (map) {
    map.destroy()
    map = null
  }
  clearMarkers()
})
</script>

<style scoped>
.stores-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.store-list-sidebar {
  background-color: #f5f5f5;
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
}

.sidebar-header {
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.store-list {
  padding: 10px;
}

.store-card {
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.store-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.store-card.active {
  border: 2px solid #409eff;
}

.store-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.store-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.store-address,
.store-phone,
.store-hours {
  display: flex;
  align-items: center;
}

#map-container {
  min-height: 500px;
}
</style>

