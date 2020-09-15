import { playMode } from '@/assets/js/player.config'
import { getStorage } from '@/assets/js/utils'

const state = {
  // 歌手信息
  singer: {},
  // 歌单信息
  songList: {},
  // 音频的播放状态
  playing: false,
  /**
   * 用于显示播放器
   *  true => normal 播放器
   *  false => mini 播放器
   */
  fullScreen: false,
  // 播放列表
  playList: [],
  // 基础列表，只存储歌曲数据，不做改变
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前要播放歌曲的下标
  currentIndex: -1,
  // 排行信息
  ranking: {},
  // 搜索历史
  searchHistory: getStorage('_search_'),
  // 播放历史
  playHistory: getStorage('_play_'),
  // 喜欢
  favorite: getStorage('_favorite_')
}

export default state
