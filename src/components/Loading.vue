<template>
  <div class="loading-container back-lord">
    <div class="loading flex column center">
      <div class="loading-git margin-bottom-10"></div>
      <div class="title size-sio color-whiteTranslucent-">{{title}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '正在加载...'
    }
  }
}
</script>

<style lang="stylus">
.loading-container
  position absolute
  top 0
  left 0
  right 0
  bottom 0
  .loading
    padding 50px 0
    .loading-git
      width 30px
      height 30px
      background-image url("../assets/imgs/loading.gif")
      background-size 100% 100%
</style>
