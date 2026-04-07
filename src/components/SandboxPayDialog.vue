<template>
  <el-dialog
    :model-value="modelValue"
    title="支付宝沙箱支付"
    width="460px"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
      将跳转至<strong>支付宝沙箱</strong>收银台完成付款。支付成功后以支付宝<strong>异步通知</strong>为准更新订单状态；本机开发时若通知未到达，请用内网穿透将异步通知地址暴露到公网，或在开放平台配置正确的外网地址。
    </el-alert>
    <p class="hint">
      请先在支付宝开放平台「沙箱」创建应用并配置密钥，然后在后端 <code>application.yml</code> 中设置
      <code>alipay.enabled=true</code> 及 app-id、app-private-key、alipay-public-key。
    </p>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" :disabled="!orderId" @click="goPay">
        前往支付宝支付
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { submitAlipayFormHtml } from '@/utils/alipaySubmit'

export default {
  name: 'SandboxPayDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    /** 订单ID */
    orderId: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['update:modelValue', 'success'],
  setup(props, { emit }) {
    const loading = ref(false)

    watch(
      () => props.modelValue,
      (v) => {
        if (!v) loading.value = false
      }
    )

    const goPay = async () => {
      const id = props.orderId
      if (id == null || id === '') {
        ElMessage.warning('订单信息缺失')
        return
      }
      loading.value = true
      try {
        const res = await api.order.alipayPagePay(id)
        const html = res.data?.formHtml
        if (!html) {
          throw new Error('未获取到支付表单')
        }
        emit('update:modelValue', false)
        emit('success')
        submitAlipayFormHtml(html)
      } catch (e) {
        ElMessage.error(e.message || '发起支付失败')
      } finally {
        loading.value = false
      }
    }

    return { loading, goPay }
  }
}
</script>

<style scoped>
.hint {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}
code {
  background: #f4f4f5;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
