<template>
  <div class="admin-page">
    <h2>问答管理</h2>
    <div class="toolbar toolbar-wrap">
      <el-button type="primary" size="default" @click="showAddDialog = true">添加问题</el-button>
      <el-button size="default" @click="loadQuestions">刷新</el-button>
      <el-select v-model="filterCategory" @change="loadQuestions" style="width: 150px" clearable>
        <el-option label="全部分类" :value="null"></el-option>
        <el-option label="互动" :value="1"></el-option>
        <el-option label="文化" :value="2"></el-option>
        <el-option label="活动" :value="3"></el-option>
      </el-select>
      <el-select v-model="filterDifficulty" @change="loadQuestions" style="width: 150px" clearable>
        <el-option label="全部难度" :value="null"></el-option>
        <el-option label="简单" :value="1"></el-option>
        <el-option label="中等" :value="2"></el-option>
        <el-option label="困难" :value="3"></el-option>
      </el-select>
      <el-select v-model="filterQuizStatus" @change="loadQuestions" style="width: 130px" clearable placeholder="题目状态">
        <el-option label="全部状态" :value="null"></el-option>
        <el-option label="已发布" :value="1"></el-option>
        <el-option label="草稿" :value="0"></el-option>
      </el-select>
      <el-input
        v-model="questionKeyword"
        placeholder="题干或解析关键词"
        clearable
        style="width: 240px"
        @keyup.enter="loadQuestions"
      />
      <el-button type="primary" @click="loadQuestions">搜索</el-button>
    </div>
    
    <!-- 问题列表 -->
    <el-table :data="questions" style="width: 100%" v-loading="loading">
      <el-table-column prop="question" label="问题" min-width="260">
        <template #default="scope">
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {{ scope.row.question }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="100">
        <template #default="scope">
          <el-tag :type="getCategoryTag(scope.row.category)">{{ getCategoryText(scope.row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="难度" width="100">
        <template #default="scope">
          <el-tag :type="getDifficultyTag(scope.row.difficulty)">{{ getDifficultyText(scope.row.difficulty) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="150">
        <template #default="scope">
          <span>答题: {{ scope.row.viewCount }}</span>
          <span style="margin-left: 10px;">正确: {{ scope.row.correctCount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="editQuestion(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteQuestion(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadQuestions"
      style="margin-top: 20px; text-align: center;"
    />

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingQuestion ? '编辑问题' : '添加问题'"
      width="800px"
      @close="resetForm"
    >
      <el-form :model="questionForm" label-width="120px" :rules="rules" ref="questionFormRef">
        <el-form-item label="问题内容" prop="question">
          <el-input
            v-model="questionForm.question"
            type="textarea"
            :rows="3"
            placeholder="请输入问题内容"
          />
        </el-form-item>
        <el-form-item label="选项A" prop="optionA">
          <el-input v-model="questionForm.optionA" placeholder="请输入选项A"></el-input>
        </el-form-item>
        <el-form-item label="选项B" prop="optionB">
          <el-input v-model="questionForm.optionB" placeholder="请输入选项B"></el-input>
        </el-form-item>
        <el-form-item label="选项C" prop="optionC">
          <el-input v-model="questionForm.optionC" placeholder="请输入选项C"></el-input>
        </el-form-item>
        <el-form-item label="选项D" prop="optionD">
          <el-input v-model="questionForm.optionD" placeholder="请输入选项D"></el-input>
        </el-form-item>
        <el-form-item label="正确答案" prop="correctAnswer">
          <el-radio-group v-model="questionForm.correctAnswer">
            <el-radio :label="0">A</el-radio>
            <el-radio :label="1">B</el-radio>
            <el-radio :label="2">C</el-radio>
            <el-radio :label="3">D</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="答案解析">
          <el-input
            v-model="questionForm.explanation"
            type="textarea"
            :rows="3"
            placeholder="请输入答案解析"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="questionForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="互动" :value="1"></el-option>
            <el-option label="文化" :value="2"></el-option>
            <el-option label="活动" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="questionForm.difficulty" placeholder="请选择难度" style="width: 100%">
            <el-option label="简单" :value="1"></el-option>
            <el-option label="中等" :value="2"></el-option>
            <el-option label="困难" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题图片">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-upload
              :action="uploadImageUrl"
              :headers="uploadHeaders"
              :on-success="handleImageSuccess"
              :before-upload="beforeImageUpload"
              :show-file-list="false"
            >
              <el-button type="primary">上传图片</el-button>
            </el-upload>
            <el-image
              v-if="questionForm.image"
              :src="questionForm.image"
              style="width: 100px; height: 100px;"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="questionForm.status">
            <el-radio :label="1">发布</el-radio>
            <el-radio :label="0">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveQuestion" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import store from '@/store'

export default {
  name: 'AdminQuiz',
  setup() {
    const loading = ref(false)
    const saving = ref(false)
    const showAddDialog = ref(false)
    const editingQuestion = ref(null)
    const questions = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const filterCategory = ref(null)
    const filterDifficulty = ref(null)
    const filterQuizStatus = ref(null)
    const questionKeyword = ref('')
    const questionFormRef = ref(null)

    const questionForm = ref({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 0,
      explanation: '',
      category: 1,
      difficulty: 1,
      image: '',
      status: 1
    })

    const rules = {
      question: [{ required: true, message: '请输入问题内容', trigger: 'blur' }],
      optionA: [{ required: true, message: '请输入选项A', trigger: 'blur' }],
      optionB: [{ required: true, message: '请输入选项B', trigger: 'blur' }],
      optionC: [{ required: true, message: '请输入选项C', trigger: 'blur' }],
      optionD: [{ required: true, message: '请输入选项D', trigger: 'blur' }],
      correctAnswer: [{ required: true, message: '请选择正确答案', trigger: 'change' }],
      category: [{ required: true, message: '请选择分类', trigger: 'change' }],
      difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }]
    }

    const uploadImageUrl = computed(() => {
      return '/api/upload/image'
    })

    const uploadHeaders = computed(() => {
      const token = store.state.user.token
      const headers = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      return headers
    })

    const handleImageSuccess = (response) => {
      if (response.code === 200) {
        questionForm.value.image = response.data
        ElMessage.success('图片上传成功')
      } else {
        ElMessage.error(response.message || '上传失败')
      }
    }

    const beforeImageUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      if (!isLt10M) {
        ElMessage.error('图片大小不能超过10MB!')
        return false
      }
      return true
    }

    const loadQuestions = async () => {
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
        if (filterQuizStatus.value !== null) {
          params.status = filterQuizStatus.value
        }
        if (questionKeyword.value?.trim()) {
          params.keyword = questionKeyword.value.trim()
        }
        const res = await api.quiz.admin.getList(params)
        questions.value = res.data.records || []
        total.value = res.data.total || 0
      } catch (error) {
        ElMessage.error('加载问题列表失败')
      } finally {
        loading.value = false
      }
    }

    const editQuestion = (question) => {
      editingQuestion.value = question
      try {
        const options = JSON.parse(question.options)
        Object.assign(questionForm.value, {
          id: question.id,
          question: question.question,
          optionA: options[0] || '',
          optionB: options[1] || '',
          optionC: options[2] || '',
          optionD: options[3] || '',
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
          category: question.category,
          difficulty: question.difficulty,
          image: question.image || '',
          status: question.status
        })
      } catch (e) {
        ElMessage.error('解析选项失败')
      }
      showAddDialog.value = true
    }

    const saveQuestion = async () => {
      if (!questionFormRef.value) return
      
      await questionFormRef.value.validate(async (valid) => {
        if (valid) {
          saving.value = true
          try {
            const options = JSON.stringify([
              questionForm.value.optionA,
              questionForm.value.optionB,
              questionForm.value.optionC,
              questionForm.value.optionD
            ])
            
            const data = {
              ...questionForm.value,
              options: options
            }
            delete data.optionA
            delete data.optionB
            delete data.optionC
            delete data.optionD

            if (editingQuestion.value) {
              // 更新
              await api.quiz.admin.update(data)
              ElMessage.success('更新成功')
            } else {
              // 添加
              await api.quiz.admin.create(data)
              ElMessage.success('添加成功')
            }
            showAddDialog.value = false
            loadQuestions()
          } catch (error) {
            ElMessage.error(error.message || '保存失败')
          } finally {
            saving.value = false
          }
        }
      })
    }

    const deleteQuestion = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除这个问题吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await api.quiz.admin.delete(id)
        ElMessage.success('删除成功')
        loadQuestions()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    const resetForm = () => {
      editingQuestion.value = null
      questionForm.value = {
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 0,
        explanation: '',
        category: 1,
        difficulty: 1,
        image: '',
        status: 1
      }
      if (questionFormRef.value) {
        questionFormRef.value.resetFields()
      }
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

    onMounted(() => {
      loadQuestions()
    })

    return {
      loading,
      saving,
      showAddDialog,
      editingQuestion,
      questions,
      currentPage,
      pageSize,
      total,
      filterCategory,
      filterDifficulty,
      filterQuizStatus,
      questionKeyword,
      questionForm,
      questionFormRef,
      rules,
      uploadImageUrl,
      uploadHeaders,
      handleImageSuccess,
      beforeImageUpload,
      loadQuestions,
      editQuestion,
      saveQuestion,
      deleteQuestion,
      resetForm,
      getCategoryText,
      getCategoryTag,
      getDifficultyText,
      getDifficultyTag
    }
  }
}
</script>

<style scoped>
.toolbar-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
</style>
