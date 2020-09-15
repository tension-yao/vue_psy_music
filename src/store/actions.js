import * as types from './mutations-types'
import { playMode } from '@/assets/js/player.config'

import { shuffle, setStorage } from '@/assets/js/utils'

/**
 * 选择歌曲播放，播放列表添加的当前歌手所有的歌曲
 */
export function selectPlay ({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list)

  /**
   * 选择歌曲播放时有可能是随机播放模式，所以如果是随机模式需要生成随机列表
   *
   * 播放列表发生了变化，同样 index 也不准确了，需要使用 findIndex 返回正确的 index
   */
  if (state.mode === playMode.random) {
    const randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)

    index = randomList.findIndex(item => item.songmid === list[index].songmid)
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)

  // 选择歌曲的时候不需要直接将播放状态设置为 true，只有音频加载完毕且就绪才修改状态
  // commit(types.SET_PLAYING, true)
}

/**
 * 随机播放全部
 */
export function randomPlayAll ({ commit, state }, { list }) {
  commit(types.SET_SEQUENCE_LIST, list)
  const randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_MODE, playMode.random)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
}

/**
 * 播放单个歌曲
 */
export function playItem ({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_MODE, playMode.sequence)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
}

/**
 * 添加歌曲到播放列表
 */
export function addSongList ({ commit, state }, song) {
  const sequenceList = state.sequenceList.slice()

  const playList = state.playList.slice()

  const sequenceIndex = sequenceList.findIndex(item => item.songmid === song.songmid)

  const playIndex = playList.findIndex(item => item.songmid === song.songmid)

  if (sequenceIndex !== -1) {
    sequenceList.splice(sequenceIndex, 1)
  }

  if (playIndex !== -1) {
    sequenceList.splice(playIndex, 1)
  }

  sequenceList.unshift(song)

  playList.unshift(song)

  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, false)
}

/**
 * 存储播放历史
 */
export function setSearchHistory ({ commit, state }, val) {
  const history = state.searchHistory.slice()

  // 检查受否有重复的成员，有就需要将位置进行更新
  const index = history.findIndex(item => item === val)

  if (index !== -1) {
    history.splice(index, 1)
  }

  history.unshift(val)

  commit(types.SET_SEARCH_HISTORY, history)

  setStorage('_search_', history)
}

/**
 * 删除某条播放历史
 */
export function removeItemHistory ({ commit, state }, item) {
  const history = state.searchHistory.slice()

  const index = history.findIndex(items => items === item)

  if (index !== -1) {
    history.splice(index, 1)
  }

  commit(types.SET_SEARCH_HISTORY, history)

  setStorage('_search_', history)
}

/**
 * 删除全部播放历史
 */
export function removeAllHistory ({ commit, state }) {
  commit(types.SET_SEARCH_HISTORY, [])

  setStorage('_search_', [])
}

/**
 * 添加播放历史
 */
export function playHistory ({ commit, state }, song) {
  const playHistory = state.playHistory.slice()

  const index = playHistory.findIndex(item => item.songmid === song.songmid)

  if (index !== -1) {
    playHistory.splice(index, 1)
  }

  playHistory.unshift(song)

  commit(types.SET_PLAY_HISTORY, playHistory)

  setStorage('_play_', playHistory)
}

/**
 * 收藏歌曲，检索是否收藏过，收藏过就移除
 */
export function isFavorite ({ commit, state }, song) {
  const favorite = state.favorite.slice()

  const index = favorite.findIndex(item => item.songmid === song.songmid)

  if (index !== -1) {
    favorite.splice(index, 1)
  } else {
    favorite.unshift(song)
  }

  commit(types.SET_FAVORITE, favorite)

  setStorage('_favorite_', favorite)
}

/**
 * 删除 sequenceList、playList 中的某个歌曲
 */
export function removeSong ({ commit, state }, songmid) {
  const sequenceList = state.sequenceList.slice()

  const playList = state.sequenceList.slice()

  let currentIndex = state.currentIndex

  // 找到该歌曲的下标位置
  const sequenceIndex = sequenceList.findIndex(item => item.songmid === songmid)

  const playIndex = playList.findIndex(item => item.songmid === songmid)

  if (sequenceIndex !== -1) {
    sequenceList.splice(sequenceIndex, 1)
  }

  if (playList !== -1) {
    playList.splice(playIndex, 1)
  }

  // 更新列表
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_PLAYLIST, playList)

  // 如果 length 为 0 说明没有歌曲了，将播放状态设置为关闭状态
  commit(types.SET_PLAYING, sequenceList.length > 0)

  /**
   * 删除非播放中歌曲时 currentIndex 始终会在列表中播放 playList[currentIndex] 歌曲，应该在删除过程中只要不删除正在播放的歌曲就应该不能影响正在播放的歌曲
   *  解决方法：更新 currentIndex 索引
   */
  if (currentIndex > playIndex || currentIndex === playList.length) {
    currentIndex--
  }
  commit(types.SET_CURRENT_INDEX, currentIndex)

  /**
   * 解决在删除歌曲时音乐会自动播放
   */
  commit(types.SET_PLAYING, false)
}

/**
 * 更新 sequenceList、playList 中的某个歌曲数据
 */
export function upDateSong ({ commit, state }, song) {
  const sequenceList = state.sequenceList.slice()

  const playList = state.playList.slice()

  const favoriteList = state.favorite.slice()

  const playHistory = state.playHistory.slice()

  // 找到该歌曲的下标位置
  const sequenceIndex = sequenceList.findIndex(item => item.songmid === song.songmid)

  const playIndex = playList.findIndex(item => item.songmid === song.songmid)

  const favoriteIndex = favoriteList.findIndex(item => item.songmid === song.songmid)

  const playHistoryIndex = playHistory.findIndex(item => item.songmid === song.songmid)

  if (sequenceIndex !== -1) {
    sequenceList.splice(sequenceIndex, 1, song)
  }

  if (playIndex !== -1) {
    playList.splice(playIndex, 1, song)
  }

  if (favoriteIndex !== -1) {
    favoriteList.splice(favoriteIndex, 1, song)
  }

  if (playHistoryIndex !== -1) {
    playHistory.splice(playHistoryIndex, 1, song)
  }

  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_FAVORITE, favoriteList)
  commit(types.SET_PLAY_HISTORY, playHistory)

  setStorage('_favorite_', favoriteList)
  setStorage('_play_', playHistory)
}
