<template>
  <!-- 推荐列表项组件 -->
  <div class="recommend-list flex size-lord padding-bottom-20 padding-left-20 padding-right-20" @click="selectSongList(item)">
    <img v-lazy="item.imgurl" class="img padding-right-20">
    <div class="content flex column space-around">
      <div class="username">{{item.name}}</div>
      <div class="title color-whiteTranslucent-">{{item.dissname}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    selectSongList (item) {
      this.$emit('selectSongList', item)
    }
  }
}
</script>

<style lang="stylus">
.recommend-list
  .img
    width 60px
    height 60px
</style>
