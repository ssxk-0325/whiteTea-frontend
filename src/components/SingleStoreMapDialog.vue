<template>
  <el-dialog
    :model-value="modelValue"
    title="自提门店位置"
    width="min(92vw, 720px)"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="store" class="pickup-body">
      <div class="pickup-info">
        <h3 class="name">{{ store.name }}</h3>
        <p><strong>地址：</strong>{{ store.address || '-' }}</p>
        <p v-if="store.phone"><strong>电话：</strong>{{ store.phone }}</p>
        <p v-if="store.businessHours"><strong>营业时间：</strong>{{ store.businessHours }}</p>
        <p class="hint">门店配货完成后，请凭订单信息到店自提。</p>
      </div>
      <div id="single-store-map-host" class="map-host"></div>
      <p v-if="mapError" class="map-error">{{ mapError }}</p>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  store: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const mapError = ref('')
let map = null
let marker = null

const loadAMapScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof AMap !== 'undefined') {
      resolve()
      return
    }
    const amapKey = import.meta.env.VITE_AMAP_KEY || 'YOUR_AMAP_KEY'
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&callback=initSingleStoreMapCb`
    window.initSingleStoreMapCb = () => resolve()
    script.onerror = () => reject(new Error('地图脚本加载失败'))
    document.head.appendChild(script)
  })
}

const destroyMap = () => {
  if (marker) {
    marker.setMap(null)
    marker = null
  }
  if (map) {
    map.destroy()
    map = null
  }
}

const initMap = async () => {
  mapError.value = ''
  const s = props.store
  if (!s || s.longitude == null || s.latitude == null) {
    mapError.value = '暂无坐标信息，请查看上方文字地址。'
    return
  }
  await nextTick()
  try {
    await loadAMapScript()
  } catch {
    mapError.value = '地图加载失败，请配置 VITE_AMAP_KEY 或稍后再试。'
    return
  }
  if (typeof AMap === 'undefined') {
    mapError.value = '地图 API 不可用。'
    return
  }
  const el = document.getElementById('single-store-map-host')
  if (!el) return
  destroyMap()
  const center = [Number(s.longitude), Number(s.latitude)]
  map = new AMap.Map('single-store-map-host', {
    zoom: 16,
    center,
    mapStyle: 'amap://styles/normal'
  })
  marker = new AMap.Marker({
    position: center,
    title: s.name,
    map
  })
  const html = `<div style="padding:8px 10px;max-width:220px;"><strong>${s.name || ''}</strong><br/>${s.address || ''}</div>`
  const iw = new AMap.InfoWindow({ content: html, offset: new AMap.Pixel(0, -28) })
  marker.on('click', () => iw.open(map, center))
  iw.open(map, center)
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open && props.store) {
      await nextTick()
      await initMap()
    } else if (!open) {
      destroyMap()
    }
  }
)

watch(
  () => props.store,
  async (s) => {
    if (props.modelValue && s) {
      await nextTick()
      await initMap()
    }
  },
  { deep: true }
)
</script>

<style scoped>
.pickup-body {
  min-height: 120px;
}
.pickup-info {
  margin-bottom: 12px;
  line-height: 1.65;
  color: #303133;
}
.pickup-info .name {
  margin: 0 0 8px;
  font-size: 17px;
}
.pickup-info .hint {
  margin-top: 10px;
  font-size: 13px;
  color: #909399;
}
.map-host {
  width: 100%;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}
.map-error {
  margin-top: 8px;
  font-size: 13px;
  color: #e6a23c;
}
</style>
