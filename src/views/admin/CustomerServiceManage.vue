<template>
  <div class="admin-page cs-manage">
    <h2>客服会话</h2>
    <div class="toolbar cs-toolbar">
      <el-select v-model="filterStatus" placeholder="会话状态" clearable style="width: 160px" @change="loadSessions">
        <el-option label="进行中 / 转人工" :value="''" />
        <el-option label="进行中" :value="0" />
        <el-option label="转人工" :value="2" />
        <el-option label="已结束" :value="1" />
      </el-select>
      <el-input
        v-model="sessionKeyword"
        placeholder="会话号 / 用户名 / 昵称 / 用户ID"
        clearable
        style="width: 280px"
        @keyup.enter="loadSessions"
      />
      <el-button type="primary" @click="loadSessions">搜索</el-button>
      <el-button @click="loadSessions">刷新列表</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="9">
        <el-table
          :data="sessions"
          v-loading="loading"
          highlight-current-row
          @current-change="onSelectSession"
          row-key="rowKey"
          max-height="calc(100vh - 220px)"
        >
          <el-table-column label="会话号" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.session?.sessionNo }}</template>
          </el-table-column>
          <el-table-column label="用户" min-width="100" show-overflow-tooltip>
            <template #default="{ row }">{{ row.user?.username || '—' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="96">
            <template #default="{ row }">
              <el-tag size="small" :type="statusTagType(row.session?.status)">
                {{ statusText(row.session?.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="最后消息" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.session?.lastMessageTime || '—' }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!loading && sessions.length === 0" description="暂无会话" />
      </el-col>
      <el-col :span="15">
        <el-card v-if="current" shadow="never" class="chat-card">
          <template #header>
            <div class="chat-head">
              <span>{{ current.session?.sessionNo }}</span>
              <span class="muted">用户：{{ current.user?.username || current.session?.userId }}</span>
              <el-button
                type="danger"
                plain
                size="small"
                :disabled="current.session?.status === 1"
                @click="closeSession"
              >
                结束会话
              </el-button>
            </div>
          </template>
          <div class="msg-list" ref="msgListRef" v-loading="msgLoading">
            <div v-if="messages.length === 0" class="empty-inner">暂无消息</div>
            <div
              v-for="m in messages"
              :key="m.id"
              :class="['msg-row', m.senderType === 2 ? 'from-admin' : m.senderType === 0 ? 'from-user' : 'from-ai']"
            >
              <div class="msg-meta">
                {{ senderLabel(m.senderType) }}
                <span class="time">{{ m.createTime }}</span>
              </div>
              <div class="msg-bubble">{{ m.content }}</div>
            </div>
          </div>
          <div class="reply-box">
            <el-input
              v-model="replyText"
              type="textarea"
              :rows="3"
              placeholder="输入回复内容（将以上方「人工客服」身份发送）"
              :disabled="current.session?.status === 1 || sending"
            />
            <el-button type="primary" :loading="sending" :disabled="!replyText.trim() || current.session?.status === 1" @click="sendReply">
              发送
            </el-button>
          </div>
        </el-card>
        <el-empty v-else description="请从左侧选择会话" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

export default {
  name: 'CustomerServiceManage',
  setup() {
    const filterStatus = ref('')
    const sessionKeyword = ref('')
    const sessions = ref([])
    const loading = ref(false)
    const current = ref(null)
    const messages = ref([])
    const msgLoading = ref(false)
    const replyText = ref('')
    const sending = ref(false)
    const msgListRef = ref(null)
    let pollTimer = null

    const statusText = (s) => {
      if (s === 0) return '进行中'
      if (s === 1) return '已结束'
      if (s === 2) return '转人工'
      return '—'
    }

    const statusTagType = (s) => {
      if (s === 0) return 'primary'
      if (s === 2) return 'warning'
      if (s === 1) return 'info'
      return ''
    }

    const senderLabel = (t) => {
      if (t === 0) return '用户'
      if (t === 2) return '人工客服'
      return 'AI'
    }

    const loadSessions = async () => {
      loading.value = true
      try {
        const statusParam =
          filterStatus.value === '' || filterStatus.value == null ? undefined : filterStatus.value
        const res = await api.customerService.admin.listSessions(statusParam, sessionKeyword.value)
        const raw = res.data || []
        sessions.value = raw.map((item, i) => ({
          ...item,
          rowKey: item.session?.id ?? `k-${i}`
        }))
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    const scrollBottom = () => {
      nextTick(() => {
        const el = msgListRef.value
        if (el) el.scrollTop = el.scrollHeight
      })
    }

    const loadMessages = async () => {
      if (!current.value?.session?.id) return
      msgLoading.value = true
      try {
        const res = await api.customerService.admin.getMessages(current.value.session.id)
        messages.value = res.data || []
        scrollBottom()
      } catch (e) {
        console.error(e)
      } finally {
        msgLoading.value = false
      }
    }

    const onSelectSession = (row) => {
      current.value = row || null
      replyText.value = ''
      messages.value = []
      if (row?.session?.id) {
        loadMessages()
      }
    }

    const sendReply = async () => {
      const text = replyText.value.trim()
      if (!text || !current.value?.session?.id || sending.value) return
      sending.value = true
      try {
        await api.customerService.admin.reply(current.value.session.id, text)
        replyText.value = ''
        await loadMessages()
        await loadSessions()
        ElMessage.success('已发送')
      } catch (e) {
        ElMessage.error(e.message || '发送失败')
      } finally {
        sending.value = false
      }
    }

    const closeSession = async () => {
      if (!current.value?.session?.id) return
      try {
        await ElMessageBox.confirm('确定结束该会话吗？用户将无法继续发消息。', '结束会话', {
          type: 'warning'
        })
        await api.customerService.admin.close(current.value.session.id)
        ElMessage.success('会话已结束')
        current.value = null
        messages.value = []
        await loadSessions()
      } catch (e) {
        if (e !== 'cancel') ElMessage.error(e.message || '操作失败')
      }
    }

    watch(
      () => current.value?.session?.id,
      (id) => {
        if (pollTimer) {
          clearInterval(pollTimer)
          pollTimer = null
        }
        if (!id) return
        pollTimer = setInterval(() => {
          loadMessages()
        }, 4000)
      }
    )

    onMounted(() => {
      loadSessions()
    })

    onUnmounted(() => {
      if (pollTimer) clearInterval(pollTimer)
    })

    return {
      filterStatus,
      sessionKeyword,
      sessions,
      loading,
      current,
      messages,
      msgLoading,
      replyText,
      sending,
      msgListRef,
      statusText,
      statusTagType,
      senderLabel,
      loadSessions,
      onSelectSession,
      sendReply,
      closeSession
    }
  }
}
</script>

<style scoped>
.cs-manage .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.chat-card {
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.chat-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.chat-head {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.chat-head .muted {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  max-height: calc(100vh - 380px);
  background: var(--el-fill-color-light);
}

.empty-inner {
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 24px;
}

.msg-row {
  margin-bottom: 14px;
}

.msg-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.msg-meta .time {
  margin-left: 8px;
}

.msg-bubble {
  display: inline-block;
  max-width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  line-height: 1.5;
  word-break: break-word;
}

.from-user .msg-bubble {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
}

.from-ai .msg-bubble {
  background: #fff;
  border: 1px solid var(--el-border-color);
}

.from-admin .msg-bubble {
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-5);
}

.reply-box {
  padding: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
