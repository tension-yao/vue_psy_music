<template>
  <div class="search-box flex cross-center justify-center back-sio radius-8">
    <i class="icon icon-search"></i>
    <input type="text" class="ipt flex-1 back-sio color-white" v-model="query" :placeholder="placeholder">
    <i class="icon icon-dismiss" @click="clearQuery()" v-show="query"></i>
  </div>
</template>

<script>

export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  methods: {
    clearQuery () {
      this.query = ''
    },
    setQuery (query) {
      /**
       * 接受一个文案，query 是要搜索的歌曲名
       */
      this.query = query
    }
  },
  watch: {
    query (newQuery) {
      /**
       * 监听 query 的变化，将新的文案派发出去，基础组件不做业务处理
       */
      this.$emit('searchQuery', newQuery.trim())
    }
  }
}
</script>

<style lang="stylus">
.search-box
  height 40px
  line-height 40px
  margin 20px 20px 30px
  .icon
    padding 0 10px
  .icon-search
    color #222222
    font-size 24px
  .ipt
    border 0
    outline 0
    // padding 0 20px
  .icon-dismiss
    color #222222
    font-size 16px
</style>
