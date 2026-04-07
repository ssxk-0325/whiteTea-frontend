/**
 * 支付宝电脑网站支付返回的 HTML 表单，由浏览器提交到支付宝网关
 */
export function submitAlipayFormHtml(formHtml) {
  if (!formHtml || typeof formHtml !== 'string') {
    throw new Error('无效的支付表单')
  }
  const wrapper = document.createElement('div')
  wrapper.style.display = 'none'
  wrapper.innerHTML = formHtml
  document.body.appendChild(wrapper)
  const form = wrapper.querySelector('form')
  if (!form) {
    document.body.removeChild(wrapper)
    throw new Error('未解析到支付表单')
  }
  form.submit()
}
