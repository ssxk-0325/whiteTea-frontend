<template>
  <el-dialog
    :model-value="modelValue"
    title="沙箱模拟支付"
    width="440px"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-alert type="info" :closable="false" show-icon style="margin-bottom: 16px;">
      当前为演示环境，不调用真实支付网关，仅模拟支付成功与订单状态变更。
    </el-alert>
    <el-form label-width="100px">
      <el-form-item label="支付方式">
        <el-radio-group v-model="payType">
          <el-radio :label="1">微信支付（模拟）</el-radio>
          <el-radio :label="2">支付宝（模拟）</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">确认支付</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'SandboxPayDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const payType = ref(1)
    watch(
      () => props.modelValue,
      (v) => {
        if (v) payType.value = 1
      }
    )
    const onConfirm = () => {
      emit('confirm', payType.value)
    }
    return { payType, onConfirm }
  }
}
</script>
