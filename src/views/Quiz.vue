<template>
  <div class="quiz-page">
    <Header />
    <el-container>
      <el-main style="max-width: 1200px; margin: 0 auto;">
        <h2>趣味问答</h2>
        <p class="subtitle">测试你对福鼎白茶的了解；「培训专区」为批发培训配套题目，与通用问答区分</p>

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <el-radio-group v-model="filterCategory" @change="loadQuestions">
            <el-radio-button :label="null">全部分类</el-radio-button>
            <el-radio-button :label="1">互动</el-radio-button>
            <el-radio-button :label="2">文化</el-radio-button>
            <el-radio-button :label="3">活动</el-radio-button>
            <el-radio-button :label="4">培训专区</el-radio-button>
          </el-radio-group>
          <el-radio-group v-model="filterDifficulty" @change="loadQuestions" style="margin-left: 20px;">
            <el-radio-button :label="null">全部难度</el-radio-button>
            <el-radio-button :label="1">简单</el-radio-button>
            <el-radio-button :label="2">中等</el-radio-button>
            <el-radio-button :label="3">困难</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="keyword"
            placeholder="搜索问题"
            style="width: 300px; margin-left: 20px;"
            @keyup.enter="loadQuestions"
            clearable
          >
            <template #append>
              <el-button @click="loadQuestions">搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-cards" v-if="userStore.isLoggedIn">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalCount || 0 }}</div>
              <div class="stat-label">已答题数</div>
            </div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ statistics.correctCount || 0 }}</div>
              <div class="stat-label">答对题数</div>
            </div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ formatRate(statistics.correctRate) }}%</div>
              <div class="stat-label">正确率</div>
            </div>
          </el-card>
        </div>

        <el-result
          v-if="trainingQuizForbidden"
          class="training-access-result"
          icon="warning"
          title="暂无权限查看"
          sub-title="「培训专区」问答仅对已通过「批发与培训」产业报名审核的用户开放（管理员不受限）。您可先报名批发与培训场次，审核通过后再访问本分类。"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/services/wholesale-training')">去批发培训服务</el-button>
            <el-button @click="clearTrainingQuizFilter">浏览其他分类</el-button>
          </template>
        </el-result>

        <!-- 问题列表 -->
        <div v-else v-loading="loading" class="questions-container">
          <el-empty v-if="!loading && questions.length === 0" description="暂无问题"></el-empty>
          <div v-else>
            <el-row :gutter="20">
              <el-col :span="8" v-for="question in questions" :key="question.id">
                <el-card class="question-card" @click="goToQuestion(question.id)">
                  <div class="question-header">
                    <el-tag :type="getCategoryTag(question.category)" size="small">
                      {{ getCategoryText(question.category) }}
                    </el-tag>
                    <el-tag :type="getDifficultyTag(question.difficulty)" size="small">
                      {{ getDifficultyText(question.difficulty) }}
                    </el-tag>
                    <el-tag
                      v-if="question.answerStatus === 1"
                      type="success"
                      size="small"
                      class="answer-status-tag"
                    >
                      已答
                    </el-tag>
                    <el-tag
                      v-if="question.answerStatus === 2"
                      type="danger"
                      size="small"
                      class="answer-status-tag"
                    >
                      错误
                    </el-tag>
                  </div>
                  <h3 class="question-title">{{ question.question }}</h3>
                  <div class="question-stats">
                    <span>答题次数: {{ question.viewCount }}</span>
                    <span>正确率: {{ formatQuestionRate(question.correctCount, question.viewCount) }}%</span>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="loadQuestions"
            style="margin-top: 20px; text-align: center;"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'Quiz',
  components: {
    Header
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const loading = ref(false)
    const questions = ref([])
    const currentPage = ref(1)
    const pageSize = ref(12)
    const total = ref(0)
    const filterCategory = ref(null)
    const filterDifficulty = ref(null)
    const keyword = ref('')
    const statistics = ref({
      totalCount: 0,
      correctCount: 0,
      wrongCount: 0,
      correctRate: 0
    })
    const trainingQuizForbidden = ref(false)

    const userStore = computed(() => ({
      isLoggedIn: store.getters['user/isLoggedIn']
    }))

    const loadQuestions = async () => {
      if (filterCategory.value !== 4) {
        trainingQuizForbidden.value = false
      }
      loading.value = true
      try {
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value
        }
        if (filterCategory.value !== null) {
          params.category = filterCategory.value
        }
        if (filterDifficulty.value !== null) {
          params.difficulty = filterDifficulty.value
        }
        if (keyword.value) {
          params.keyword = keyword.value
        }
        const listConfig = filterCategory.value === 4 ? { skipGlobalErrorMsg: true } : {}
        const res = await api.quiz.getList(params, listConfig)
        trainingQuizForbidden.value = false
        questions.value = res.data.records || []
        total.value = res.data.total || 0
      } catch (error) {
        if (
          filterCategory.value === 4 &&
          error.message &&
          error.message.includes('暂无权限查看培训专区')
        ) {
          trainingQuizForbidden.value = true
          questions.value = []
          total.value = 0
        } else {
          console.error('加载问题失败:', error)
        }
      } finally {
        loading.value = false
      }
    }

    const loadStatistics = async () => {
      if (!userStore.value.isLoggedIn) return
      try {
        const res = await api.quiz.getMyStatistics()
        statistics.value = res.data || {}
      } catch (error) {
        console.error('加载统计失败:', error)
      }
    }

    const goToQuestion = (id) => {
      if (!userStore.value.isLoggedIn) {
        ElMessage.warning('请先登录')
        router.push('/login?redirect=/quiz/' + id)
        return
      }
      router.push(`/quiz/${id}`)
    }

    const clearTrainingQuizFilter = () => {
      filterCategory.value = null
      trainingQuizForbidden.value = false
      router.replace({ path: '/quiz' })
      loadQuestions()
    }

    const formatRate = (rate) => {
      if (!rate) return 0
      return Math.round(rate * 100) / 100
    }

    const formatQuestionRate = (correct, total) => {
      if (!total || total === 0) return 0
      return Math.round((correct / total) * 100 * 100) / 100
    }

    const getCategoryText = (category) => {
      const categoryMap = {
        1: '互动',
        2: '文化',
        3: '活动',
        4: '培训专区'
      }
      return categoryMap[category] || '未知'
    }

    const getCategoryTag = (category) => {
      const tagMap = {
        1: 'success',
        2: 'warning',
        3: 'info',
        4: 'primary'
      }
      return tagMap[category] || 'info'
    }

    const getDifficultyText = (difficulty) => {
      const difficultyMap = {
        1: '简单',
        2: '中等',
        3: '困难'
      }
      return difficultyMap[difficulty] || '未知'
    }

    const getDifficultyTag = (difficulty) => {
      const tagMap = {
        1: 'success',
        2: 'warning',
        3: 'danger'
      }
      return tagMap[difficulty] || 'info'
    }

    const applyCategoryFromRoute = () => {
      const c = route.query.category
      if (c === undefined || c === null || c === '') return
      const n = parseInt(String(c), 10)
      if (!Number.isNaN(n) && n >= 1 && n <= 4) {
        filterCategory.value = n
      }
    }

    onMounted(() => {
      applyCategoryFromRoute()
      loadQuestions()
      loadStatistics()
    })

    watch(
      () => route.query.category,
      () => {
        applyCategoryFromRoute()
        loadQuestions()
        if (userStore.value.isLoggedIn) {
          loadStatistics()
        }
      }
    )

    return {
      loading,
      questions,
      currentPage,
      pageSize,
      total,
      filterCategory,
      filterDifficulty,
      keyword,
      statistics,
      userStore,
      loadQuestions,
      loadStatistics,
      goToQuestion,
      formatRate,
      formatQuestionRate,
      getCategoryText,
      getCategoryTag,
      getDifficultyText,
      getDifficultyTag,
      trainingQuizForbidden,
      clearTrainingQuizFilter
    }
  }
}
</script>

<style scoped>
.quiz-page {
  min-height: 100vh;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.training-access-result {
  margin: 20px 0;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
}

.stat-content {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.questions-container {
  min-height: 400px;
}

.question-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}

.question-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.answer-status-tag {
  margin-left: auto;
}

.question-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  min-height: 60px;
}

.question-stats {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 12px;
  margin-top: 10px;
}
</style>

