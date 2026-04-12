<template>
  <div class="dashboard">
    <h2>数据统计</h2>
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="6">
        <el-card class="stat-card stat-card-user" shadow="hover">
          <div class="stat-item">
            <div class="stat-icon-wrapper icon-user">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <h3>总用户数</h3>
            <p class="stat-value">{{ stats.userCount }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-card-product" shadow="hover">
          <div class="stat-item">
            <div class="stat-icon-wrapper icon-product">
              <el-icon :size="32"><Goods /></el-icon>
            </div>
            <h3>总产品数</h3>
            <p class="stat-value">{{ stats.productCount }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-card-order" shadow="hover">
          <div class="stat-item">
            <div class="stat-icon-wrapper icon-order">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <h3>总订单数</h3>
            <p class="stat-value">{{ stats.orderCount }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card stat-card-sales" shadow="hover">
          <div class="stat-item">
            <div class="stat-icon-wrapper icon-sales">
              <el-icon :size="32"><CreditCard /></el-icon>
            </div>
            <h3>总销售额</h3>
            <p class="stat-value">¥{{ stats.totalSales }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 扇形图 - 订单状态分布 -->
      <el-col :span="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span style="display: block; text-align: center;">订单状态分布</span>
            </div>
          </template>
          <v-chart class="chart" :option="pieChartOption" :loading="loading" />
        </el-card>
      </el-col>

      <!-- 柱形图 - 月度销售额 -->
      <el-col :span="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span style="display: block; text-align: center;">月度销售额</span>
            </div>
          </template>
          <v-chart class="chart" :option="barChartOption" :loading="loading" />
        </el-card>
      </el-col>

      <!-- 折线图 - 用户增长趋势 -->
      <el-col :span="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span style="display: block; text-align: center;">用户增长趋势</span>
            </div>
          </template>
          <v-chart class="chart" :option="lineChartOption" :loading="loading" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Goods, Document, CreditCard } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import api from '@/api'

// 注册必要的组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'AdminDashboard',
  components: {
    User,
    Goods,
    Document,
    CreditCard,
    VChart
  },
  setup() {
    const loading = ref(false)
    const stats = ref({
      userCount: 0,
      productCount: 0,
      orderCount: 0,
      totalSales: '0.00'
    })
    
    const chartData = ref({
      orderStatus: [],
      monthlySales: [],
      userGrowth: []
    })

    // 扇形图配置 - 订单状态分布
    const pieChartOption = computed(() => {
      const colorMap = {
        '待付款': '#ff9f40',
        '待发货': '#4facfe',
        '待收货': '#00f2fe',
        '已完成': '#43e97b',
        '已取消': '#f5576c'
      }
      
      const data = chartData.value.orderStatus.map(item => ({
        value: item.value || 0,
        name: item.name,
        itemStyle: { color: colorMap[item.name] || '#909399' }
      }))
      
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: '10%',
          top: 'middle',
          align: 'left'
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            center: ['60%', '50%'],
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data
          }
        ]
      }
    })

    // 柱形图配置 - 月度销售额
    const barChartOption = computed(() => {
      const monthlySales = chartData.value.monthlySales || []
      const months = monthlySales.map(item => item.month)
      const sales = monthlySales.map(item => item.sales || 0)
      
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}<br/>{a}: ¥{c}'
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months.length > 0 ? months : ['1月', '2月', '3月', '4月', '5月', '6月'],
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '销售额',
            type: 'bar',
            barWidth: '60%',
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#667eea' },
                  { offset: 1, color: '#764ba2' }
                ]
              }
            },
            data: sales.length > 0 ? sales : [0, 0, 0, 0, 0, 0]
          }
        ]
      }
    })

    // 折线图配置 - 用户增长趋势
    const lineChartOption = computed(() => {
      const userGrowth = chartData.value.userGrowth || []
      const dates = userGrowth.map(item => item.date)
      const newUsers = userGrowth.map(item => item.count || 0)
      
      return {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a}: {c}人'
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates.length > 0 ? dates : ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}人'
          }
        },
        series: [
          {
            name: '新增用户',
            type: 'line',
            smooth: true,
            lineStyle: {
              color: '#43e97b',
              width: 3
            },
            itemStyle: {
              color: '#43e97b'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(67, 233, 123, 0.3)' },
                  { offset: 1, color: 'rgba(67, 233, 123, 0.1)' }
                ]
              }
            },
            data: newUsers.length > 0 ? newUsers : [0, 0, 0, 0, 0, 0, 0]
          }
        ]
      }
    })

    const loadStats = async () => {
      loading.value = true
      try {
        // 加载基础统计数据
        const res = await api.admin.getStats()
        if (res.data) {
          stats.value = {
            userCount: res.data.userCount || 0,
            productCount: res.data.productCount || 0,
            orderCount: res.data.orderCount || 0,
            totalSales: (res.data.totalSales || 0).toFixed(2)
          }
        }
        
        // 加载图表数据
        const chartRes = await api.admin.getChartData()
        if (chartRes.data) {
          chartData.value = {
            orderStatus: chartRes.data.orderStatus || [],
            monthlySales: chartRes.data.monthlySales || [],
            userGrowth: chartRes.data.userGrowth || []
          }
        }
      } catch (error) {
        // 如果接口不存在，使用默认值
        console.warn('统计接口未实现，使用默认值', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      loading,
      stats,
      chartData,
      pieChartOption,
      barChartOption,
      lineChartOption
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px !important;
  background-color: #f5f7fa !important;
  min-height: calc(100vh - 60px);
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

h2 {
  margin-bottom: 24px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.stat-item {
  text-align: center;
  padding: 20px 10px;
  position: relative;
}

.stat-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.icon-user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.icon-product {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.icon-order {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.icon-sales {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-item h3 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-card-user .stat-value {
  color: #667eea;
}

.stat-card-product .stat-value {
  color: #f5576c;
}

.stat-card-order .stat-value {
  color: #4facfe;
}

.stat-card-sales .stat-value {
  color: #43e97b;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stat-value {
    font-size: 28px;
  }
  
  .stat-icon-wrapper {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 24px;
  }
  
  .stat-icon-wrapper {
    width: 48px;
    height: 48px;
  }
  
  .stat-item h3 {
    font-size: 12px;
  }
}

/* 图表卡片样式 */
.chart-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.chart {
  height: 350px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式图表 */
@media (max-width: 1200px) {
  .chart {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .chart {
    height: 250px;
  }
}
</style>
