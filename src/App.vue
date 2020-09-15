<template>
  <div id="app" class="back-lord flex column">
    <my-header></my-header>
    <tab></tab>
    <!-- keep-alive 会将路由的状态存入缓存，如果不这样做每次切换路由都会重载对应的路由页，会浪费很多的性能 -->
    <div class="main relative">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
    <!-- 播放器 -->
    <player></player>
  </div>
</template>

<script>
import MyHeader from '@/components/MyHeader'
import Tab from '@/components/Tab'
import Player from '@/components/Player'

export default {
  components: {
    MyHeader,
    Tab,
    Player
  }
}
</script>

<style lang="stylus">
#app
  width 100%
  height 100%
  .main
    flex 1
    overflow hidden

// 路由出口的过度动效
.slider-enter, .slider-leave-to
  transform translateX(100%)
.slider-enter-active, .slider-leave-active
  transition transform 0.3s
.slider-enter-to, .slider-leave
  transform translateX(0)
</style>
