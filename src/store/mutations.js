/**
 * mutations 是对 state 中的某数据进行改变
 */
import * as types from './mutations-types'

const mutations = {
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  },
  [types.SET_PLAYING] (state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN] (state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST] (state, list) {
    state.playList = list
  },
  [types.SET_SEQUENCE_LIST] (state, list) {
    state.sequenceList = list
  },
  [types.SET_MODE] (state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX] (state, index) {
    state.currentIndex = index
  },
  [types.SET_SONGLIST] (state, list) {
    state.songList = list
  },
  [types.SET_RANKING] (state, ranking) {
    state.ranking = ranking
  },
  [types.SET_SEARCH_HISTORY] (state, list) {
    state.searchHistory = list
  },
  [types.SET_PLAY_HISTORY] (state, list) {
    state.playHistory = list
  },
  [types.SET_FAVORITE] (state, list) {
    state.favorite = list
  }
}

export default mutations
