<template>
  <ul class="tab flex space-around cross-center no-shrink">
    <router-link class="tab-item size-lord color-whiteTranslucent" to="/recommend" tag="li">
      <span class="tab-span block padding-bottom-5">推荐</span>
    </router-link>
    <router-link class="tab-item size-lord color-whiteTranslucent" to="/singer" tag="li">
      <span class="tab-span block padding-bottom-5">歌手</span>
    </router-link>
    <router-link class="tab-item size-lord color-whiteTranslucent" to="/ranking" tag="li">
      <span class="tab-span block padding-bottom-5">排行</span>
    </router-link>
    <router-link class="tab-item size-lord color-whiteTranslucent" to="/search" tag="li">
      <span class="tab-span block padding-bottom-5">搜索</span>
    </router-link>
  </ul>
</template>

<script>
export default {}
</script>

<style lang="stylus">
@import "../assets/stylus/variable.styl"

.tab
  height 44px
  .tab-item
    transform translate(0, 4px)
    &::after
      content ""
      display block
      width 100%
      height 2px
    &.router-link-active
      color $color-highlight
      &::after
        background $color-highlight
</style>
