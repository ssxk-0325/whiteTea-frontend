<template>
  <div class="quiz-detail-page">
    <Header />
    <el-container>
      <el-main style="max-width: 800px; margin: 0 auto;">
        <div v-loading="loading">
          <div v-if="question">
            <!-- 问题卡片 -->
            <el-card class="question-card">
              <div class="question-header">
                <el-tag :type="getCategoryTag(question.category)" size="small">
                  {{ getCategoryText(question.category) }}
                </el-tag>
                <el-tag :type="getDifficultyTag(question.difficulty)" size="small">
                  {{ getDifficultyText(question.difficulty) }}
                </el-tag>
              </div>
              
              <h2 class="question-title">{{ question.question }}</h2>
              
              <div v-if="question.image" class="question-image">
                <el-image :src="question.image" fit="cover" style="width: 100%; max-height: 300px;" />
              </div>

              <!-- 选项 -->
              <div class="options-container">
                <el-radio-group v-model="selectedAnswer" :disabled="hasAnswered">
                  <el-radio
                    v-for="(option, index) in options"
                    :key="index"
                    :label="index"
                    class="option-item"
                    :class="{
                      'correct-answer': hasAnswered && index === question.correctAnswer,
                      'wrong-answer': hasAnswered && selectedAnswer === index && index !== question.correctAnswer
                    }"
                  >
                    <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                    <span class="option-text">{{ option }}</span>
                  </el-radio>
                </el-radio-group>
              </div>

              <!-- 答案解析 -->
              <div v-if="hasAnswered && question.explanation" class="explanation">
                <el-alert
                  :type="answerResult.isCorrect ? 'success' : 'error'"
                  :title="answerResult.isCorrect ? `回答正确！获得${getPointsReward()}积分` : '回答错误'"
                  :closable="false"
                >
                  <template #default>
                    <div style="margin-top: 10px;">
                      <strong>解析：</strong>{{ question.explanation }}
                    </div>
                  </template>
                </el-alert>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <el-button @click="goBack">返回</el-button>
                <el-button
                  v-if="!hasAnswered"
                  type="primary"
                  @click="submitAnswer"
                  :loading="submitting"
                >
                  提交答案
                </el-button>
                <el-button
                  v-else
                  type="primary"
                  @click="goToNext"
                >
                  下一题
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'QuizDetail',
  components: {
    Header
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const submitting = ref(false)
    const question = ref(null)
    const selectedAnswer = ref(null)
    const hasAnswered = ref(false)
    const answerResult = ref(null)

    const options = computed(() => {
      if (!question.value || !question.value.options) return []
      try {
        return JSON.parse(question.value.options)
      } catch (e) {
        return []
      }
    })

    const loadQuestion = async () => {
      loading.value = true
      try {
        const id = route.params.id
        const res = await api.quiz.getById(id)
        question.value = res.data
        // 检查是否已答题
        checkAnswerStatus()
      } catch (error) {
        ElMessage.error(error.message || '加载问题失败')
        router.push('/quiz')
      } finally {
        loading.value = false
      }
    }

    const checkAnswerStatus = async () => {
      try {
        const res = await api.quiz.getMyAnswers({})
        const answers = res.data || []
        const existingAnswer = answers.find(a => a.questionId === question.value.id)
        if (existingAnswer) {
          hasAnswered.value = true
          selectedAnswer.value = existingAnswer.userAnswer
          answerResult.value = {
            isCorrect: existingAnswer.isCorrect === 1
          }
        }
      } catch (error) {
        console.error('检查答题状态失败:', error)
      }
    }

    const submitAnswer = async () => {
      if (selectedAnswer.value === null) {
        ElMessage.warning('请选择一个答案')
        return
      }
      submitting.value = true
      try {
        const res = await api.quiz.submitAnswer(question.value.id, selectedAnswer.value)
        answerResult.value = {
          isCorrect: res.data.isCorrect === 1
        }
        hasAnswered.value = true
        ElMessage.success(res.data.isCorrect === 1 ? '回答正确！' : '回答错误')
      } catch (error) {
        ElMessage.error(error.message || '提交失败')
      } finally {
        submitting.value = false
      }
    }

    const goBack = () => {
      router.push('/quiz')
    }

    const goToNext = () => {
      router.push('/quiz')
    }

    const getCategoryText = (category) => {
      const categoryMap = {
        1: '互动',
        2: '文化',
        3: '活动'
      }
      return categoryMap[category] || '未知'
    }

    const getCategoryTag = (category) => {
      const tagMap = {
        1: 'success',
        2: 'warning',
        3: 'info'
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

    const getPointsReward = () => {
      if (!question.value) return 0
      const difficulty = question.value.difficulty
      if (difficulty === 1) return 5  // 简单
      if (difficulty === 2) return 10  // 中等
      if (difficulty === 3) return 15  // 困难
      return 0
    }

    onMounted(() => {
      loadQuestion()
    })

    return {
      loading,
      submitting,
      question,
      selectedAnswer,
      hasAnswered,
      answerResult,
      options,
      loadQuestion,
      submitAnswer,
      goBack,
      goToNext,
      getCategoryText,
      getCategoryTag,
      getDifficultyText,
      getDifficultyTag,
      getPointsReward
    }
  }
}
</script>

<style scoped>
.quiz-detail-page {
  min-height: 100vh;
}

.question-card {
  margin-top: 20px;
}

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.question-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: bold;
  line-height: 1.6;
}

.question-image {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
}

.options-container {
  margin: 30px 0;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 10px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  box-sizing: border-box;
}

.option-item:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.option-item.is-checked {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.option-item.correct-answer {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.option-item.wrong-answer {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.option-item .el-radio__input {
  margin-right: 12px;
}

.option-item .el-radio__label {
  display: flex;
  align-items: center;
  width: 100%;
}

.option-label {
  font-weight: bold;
  margin-right: 10px;
  color: #409eff;
}

.option-text {
  flex: 1;
  line-height: 1.6;
}

.explanation {
  margin: 20px 0;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}
</style>

