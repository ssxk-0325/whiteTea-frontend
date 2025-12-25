<template>
  <div style="padding: 20px; background: red; color: white;">
    <h1>测试页面 - 如果你看到这个，说明路由工作正常</h1>
    <p>当前路由: {{ $route.path }}</p>
    <p>当前路由名称: {{ $route.name }}</p>
  </div>
</template>

<script>
export default {
  name: 'Test'
}
</script>

