<template>
  <div class="header flex shaft-center cross-center back-lord no-shrink">
    <div class="default margin-top-0 margin-right-9"></div>
    <div class="app_name color-highlight size-max">{{app_name}}</div>
    <router-link to="/user" tag="div" class="icon-mine text-center color-highlight"></router-link>
  </div>
</template>

<script>
export default {
  data () {
    return {
      app_name: 'Psy Music'
    }
  }
}
</script>

<style lang="stylus">
.header
  height 44px
  position relative
  .default
    width 30px
    height 32px
    background-image url("../assets/imgs/default.png")
    background-size 100% 100%
    background-repeat no-repeat
  .icon-mine
    width 44px
    height 100%
    line-height 44px
    position absolute
    top 0
    right 0
    font-size 20px
</style>
