<template>
  <div id="app">
    <router-view />
    <IndustryServiceFloatButton />
    <CustomerServiceFloatButton />
  </div>
</template>

<script>
import IndustryServiceFloatButton from './components/IndustryServiceFloatButton.vue'
import CustomerServiceFloatButton from './components/CustomerServiceFloatButton.vue'

export default {
  name: 'App',
  components: {
    IndustryServiceFloatButton,
    CustomerServiceFloatButton
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  background-attachment: fixed;
}
</style>

