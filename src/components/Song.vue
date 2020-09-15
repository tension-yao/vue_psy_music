<template>
  <div class="song flex cross-center" @click="selectItem(item, index)">
    <div class="song-ranking margin-right-30" v-if="ranking">
      <div class="rank text-center size-max" :class="rankingCls">{{rankingText}}</div>
    </div>
    <div class="song-copyWriting size-lord flex column space-center">
      <div class="song-name text-overflow">{{item.songname}}</div>
      <div class="singer-name color-lord text-overflow">{{item.singer}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number
    },
    ranking: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    selectItem (item, index) {
      // 基础组件不做业务逻辑，所以派发一个事件，由其他业务组件去做这件事
      this.$emit('selectItem', item, index)
    }
  },
  computed: {
    rankingCls () {
      const index = this.index
      return index <= 2 ? `icon icon-${index}` : 'text'
    },
    rankingText () {
      let index = this.index
      return index >= 3 ? ++index : ''
    }
  }
}
</script>

<style lang="stylus">
@import "../assets/stylus/variable.styl"

.song
  .song-ranking
    width 25px
    height 25px
    .rank
      &.icon
        width 100%
        height 100%
        background-size 100% 100%
        &.icon-0
          background-image url(../assets/imgs/first@3x.png)
        &.icon-1
          background-image url(../assets/imgs/third@3x.png)
        &.icon-2
          background-image url(../assets/imgs/second@3x.png)
      &.text
        color $color-highlight
  .song-copyWriting
    height 64px
    line-height 20px
    overflow hidden
</style>
