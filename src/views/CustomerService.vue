<template>
  <div class="customer-service-page">
    <Header />
    <el-container class="chat-container">
      <el-main style="max-width: 1200px; margin: 0 auto; padding: 20px;">
        <el-card class="chat-card">
          <template #header>
            <div class="chat-header">
              <h2>智能客服</h2>
              <div class="header-tags" v-if="sessionId">
                <el-tag v-if="sessionStatus === 0" type="success">AI 对话中</el-tag>
                <el-tag v-else-if="sessionStatus === 2" type="warning">人工客服</el-tag>
                <el-tag v-else-if="sessionStatus === 1" type="info">已结束</el-tag>
              </div>
            </div>
          </template>

          <el-alert v-if="productConsultHint" type="success" :closable="false" show-icon style="margin-bottom: 16px;">
            {{ productConsultHint }}
          </el-alert>

          <!-- Tag区域 -->
          <div class="tag-area" v-if="tags.length > 0">
            <div class="tag-title">热门问题：</div>
            <div class="tag-list">
              <el-tag
                v-for="tag in tags"
                :key="tag.id"
                class="tag-item"
                :type="tag.hitCount > 10 ? 'success' : 'info'"
                effect="plain"
                @click="clickTag(tag)"
                :disabled="sessionStatus === 2 || clickingTagId === tag.id"
              >
                {{ tag.tagName }}
                <el-icon v-if="tag.hitCount > 10" class="hot-icon"><Star /></el-icon>
              </el-tag>
            </div>
          </div>

          <!-- 消息列表 -->
          <div class="message-list" ref="messageListRef" v-loading="loading">
            <div v-if="messages.length === 0" class="empty-message">
              <el-empty description="开始对话吧~" />
            </div>
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'message-item',
                message.senderType === 0 ? 'user-message' : message.senderType === 2 ? 'human-message' : 'ai-message'
              ]"
            >
              <div class="message-avatar">
                <el-avatar
                  :icon="message.senderType === 0 ? 'User' : 'ChatDotRound'"
                  :style="
                    message.senderType === 0
                      ? { backgroundColor: '#409EFF' }
                      : message.senderType === 2
                        ? { backgroundColor: '#E6A23C' }
                        : { backgroundColor: '#67C23A' }
                  "
                />
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.createTime) }}</div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-area">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              :placeholder="sessionStatus === 2 ? '人工客服接入中，消息将直达工作人员…' : '请输入您的问题…'"
              @keydown.ctrl.enter="sendMessage"
              :disabled="!sessionId || sending || sessionStatus === 1"
            />
            <div class="input-actions">
              <el-button
                v-if="sessionId && sessionStatus === 0"
                type="warning"
                plain
                :loading="transferring"
                @click="transferHuman"
              >
                转人工
              </el-button>
              <el-button
                type="primary"
                @click="sendMessage"
                :loading="sending"
                :disabled="!inputMessage.trim() || !sessionId || sessionStatus === 1"
              >
                发送
              </el-button>
              <el-button @click="endSession" :disabled="!sessionId || sessionStatus === 1">结束会话</el-button>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star } from '@element-plus/icons-vue'
import api from '@/api'
import Header from '@/components/Header.vue'

export default {
  name: 'CustomerService',
  components: {
    Header
  },
  setup() {
    const route = useRoute()
    const productConsultHint = computed(() => {
      const pid = route.query.productId
      if (!pid) return ''
      const name = route.query.productName
      const label = name ? String(name) : `商品 #${pid}`
      return `您正在咨询：${label}。可与商家确认价格、库存、发货与售后。`
    })

    const sessionId = ref(null)
    /** 0 进行中 1 已结束 2 转人工 */
    const sessionStatus = ref(0)
    const messages = ref([])
    const inputMessage = ref('')
    const loading = ref(false)
    const sending = ref(false)
    const transferring = ref(false)
    const messageListRef = ref(null)
    const tags = ref([])
    const clickingTagId = ref(null)
    let pollTimer = null

    // 创建或获取会话
    const createSession = async () => {
      try {
        loading.value = true
        const res = await api.customerService.createSession()
        sessionId.value = res.data.sessionId
        sessionStatus.value = res.data.status != null ? res.data.status : 0
        ElMessage.success('会话已建立')

        // 加载历史消息
        await loadMessages()
      } catch (error) {
        ElMessage.error('创建会话失败：' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }

    // 加载消息列表
    const loadMessages = async () => {
      if (!sessionId.value) return
      
      try {
        const res = await api.customerService.getMessages(sessionId.value)
        messages.value = res.data || []
        scrollToBottom()
      } catch (error) {
        console.error('加载消息失败：', error)
      }
    }

    // 发送消息
    const sendMessage = async () => {
      if (!inputMessage.value.trim() || !sessionId.value || sending.value) {
        return
      }

      const content = inputMessage.value.trim()
      inputMessage.value = ''

      try {
        sending.value = true

        // 先添加用户消息到界面（乐观更新）
        const userMessage = {
          id: Date.now(),
          sessionId: sessionId.value,
          senderType: 0,
          content: content,
          messageType: 0,
          createTime: new Date().toISOString()
        }
        messages.value.push(userMessage)
        scrollToBottom()

        // 使用HTTP接口发送消息并获取AI回复
        const res = await api.customerService.sendMessage(sessionId.value, content)
        if (res.data && res.data.status !== undefined) {
          sessionStatus.value = res.data.status
        }
        if (res.data && res.data.message) {
          messages.value.push(res.data.message)
          scrollToBottom()
        } else {
          await loadMessages()
        }
      } catch (error) {
        ElMessage.error('发送消息失败：' + (error.message || '未知错误'))
        // 如果失败，移除刚才添加的用户消息
        messages.value.pop()
      } finally {
        sending.value = false
      }
    }


    // 结束会话
    const endSession = async () => {
      if (!sessionId.value) return

      try {
        await api.customerService.endSession(sessionId.value)
        ElMessage.success('会话已结束')
        sessionId.value = null
        sessionStatus.value = 0
        messages.value = []
        if (pollTimer) {
          clearInterval(pollTimer)
          pollTimer = null
        }
      } catch (error) {
        ElMessage.error('结束会话失败：' + (error.message || '未知错误'))
      }
    }

    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messageListRef.value) {
          messageListRef.value.scrollTop = messageListRef.value.scrollHeight
        }
      })
    }

    // 格式化时间
    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`
      if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`
      
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const minute = date.getMinutes()
      return `${month}-${day} ${hour}:${minute.toString().padStart(2, '0')}`
    }

    // 加载Tag列表
    const loadTags = async () => {
      try {
        const res = await api.tag.getTopTags(10)
        tags.value = res.data || []
      } catch (error) {
        console.error('加载Tag失败：', error)
      }
    }

    const transferHuman = async () => {
      if (!sessionId.value || transferring.value || sessionStatus.value !== 0) return
      try {
        transferring.value = true
        const res = await api.customerService.transferHuman(sessionId.value)
        if (res.data && res.data.status !== undefined) {
          sessionStatus.value = res.data.status
        } else {
          sessionStatus.value = 2
        }
        await loadMessages()
        ElMessage.success('已提交转人工，请稍候')
      } catch (error) {
        ElMessage.error(error.message || '转人工失败')
      } finally {
        transferring.value = false
      }
    }

    // 点击Tag
    const clickTag = async (tag) => {
      if (!sessionId.value || clickingTagId.value === tag.id) {
        return
      }
      if (sessionStatus.value === 2) {
        ElMessage.info('转人工后请直接输入文字咨询，热门问题已暂停')
        return
      }

      try {
        clickingTagId.value = tag.id

        // 先添加用户消息（显示点击的Tag）
        const userMessage = {
          id: Date.now(),
          sessionId: sessionId.value,
          senderType: 0,
          content: tag.tagName,
          messageType: 0,
          createTime: new Date().toISOString()
        }
        messages.value.push(userMessage)
        scrollToBottom()

        // 调用API获取答案
        const res = await api.tag.clickTag(tag.id)
        if (res.data && res.data.answer) {
          // 添加AI回复
          const aiMessage = {
            id: Date.now() + 1,
            sessionId: sessionId.value,
            senderType: 1,
            content: res.data.answer,
            messageType: 0,
            createTime: new Date().toISOString()
          }
          messages.value.push(aiMessage)
          scrollToBottom()
        }
      } catch (error) {
        ElMessage.error('获取答案失败：' + (error.message || '未知错误'))
        // 如果失败，移除刚才添加的用户消息
        messages.value.pop()
      } finally {
        clickingTagId.value = null
      }
    }

    watch(
      () => [sessionStatus.value, sessionId.value],
      () => {
        if (pollTimer) {
          clearInterval(pollTimer)
          pollTimer = null
        }
        if (sessionStatus.value === 2 && sessionId.value) {
          pollTimer = setInterval(() => {
            loadMessages()
          }, 3500)
        }
      },
      { immediate: true }
    )

    onMounted(() => {
      createSession()
      loadTags()
    })

    onUnmounted(() => {
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
    })

    return {
      productConsultHint,
      sessionId,
      sessionStatus,
      messages,
      inputMessage,
      loading,
      sending,
      messageListRef,
      tags,
      clickingTagId,
      sendMessage,
      endSession,
      transferHuman,
      transferring,
      clickTag,
      formatTime,
      Star
    }
  }
}
</script>

<style scoped>
.customer-service-page {
  min-height: 100vh;
  background: transparent;
}

.chat-container {
  padding: 32px;
}

.chat-card {
  height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.chat-card :deep(.el-card__header) {
  padding: 24px 32px;
  background: var(--primary-gradient);
  border-bottom: none;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: white;
}

.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fafafa;
  min-height: 400px;
  max-height: calc(100vh - 300px);
}

.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  flex-direction: row-reverse;
}

.ai-message,
.human-message {
  flex-direction: row;
}

.message-avatar {
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.user-message .message-content {
  align-items: flex-end;
}

.ai-message .message-content,
.human-message .message-content {
  align-items: flex-start;
}

.message-text {
  padding: 12px 16px;
  border-radius: 8px;
  word-wrap: break-word;
  line-height: 1.5;
}

.user-message .message-text {
  background-color: #409EFF;
  color: white;
  border-bottom-right-radius: 2px;
}

.ai-message .message-text {
  background-color: white;
  color: #303133;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 2px;
}

.human-message .message-text {
  background-color: #fff7e6;
  color: #303133;
  border: 1px solid #f5dab1;
  border-bottom-left-radius: 2px;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  padding: 0 5px;
}

.input-area {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background-color: white;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.tag-area {
  padding: 20px 32px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid var(--border-lighter);
}

.tag-title {
  font-size: var(--font-size-base);
  color: var(--text-regular);
  margin-bottom: 16px;
  font-weight: 600;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-item {
  cursor: pointer;
  transition: var(--transition-base);
  padding: 10px 20px;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-full);
  font-weight: 500;
}

.tag-item:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.05);
  box-shadow: var(--shadow-md);
}

.tag-item:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.hot-icon {
  margin-left: 6px;
  color: var(--danger-color);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
  min-height: 400px;
  max-height: calc(100vh - 400px);
}

.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.message-item {
  display: flex;
  margin-bottom: 24px;
  animation: fadeInUp 0.4s ease-out;
}

.user-message {
  flex-direction: row-reverse;
}

.ai-message,
.human-message {
  flex-direction: row;
}

.message-avatar {
  margin: 0 12px;
}

.message-avatar :deep(.el-avatar) {
  box-shadow: var(--shadow-base);
  transition: var(--transition-base);
}

.message-item:hover .message-avatar :deep(.el-avatar) {
  transform: scale(1.1);
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.user-message .message-content {
  align-items: flex-end;
}

.ai-message .message-content,
.human-message .message-content {
  align-items: flex-start;
}

.message-text {
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  word-wrap: break-word;
  line-height: 1.6;
  font-size: var(--font-size-base);
  box-shadow: var(--shadow-sm);
}

.user-message .message-text {
  background: var(--primary-gradient);
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message .message-text {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  border-bottom-left-radius: 4px;
}

.human-message .message-text {
  background: #fff7e6;
  color: var(--text-primary);
  border: 1px solid #f5dab1;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: var(--font-size-xs);
  color: var(--text-placeholder);
  margin-top: 6px;
  padding: 0 6px;
}

.input-area {
  padding: 24px 32px;
  border-top: 1px solid var(--border-lighter);
  background: white;
}

.input-area :deep(.el-textarea__inner) {
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-light);
  transition: var(--transition-base);
  font-size: var(--font-size-base);
}

.input-area :deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.input-actions :deep(.el-button) {
  border-radius: var(--radius-lg);
  font-weight: 500;
  padding: 12px 24px;
}

.input-actions :deep(.el-button--primary) {
  background: var(--primary-gradient);
  border: none;
  box-shadow: var(--shadow-md);
}

.input-actions :deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 响应式 */
@media (max-width: 768px) {
  .chat-container {
    padding: 16px;
  }
  
  .chat-card {
    height: calc(100vh - 100px);
  }
  
  .message-content {
    max-width: 85%;
  }
}
</style>

