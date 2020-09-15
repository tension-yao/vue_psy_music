/**
 * Getters 的作用是做一些数据的映射
 */

export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playList = state => state.playList

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

// 根据 currentIndex 返回播放列表对应的歌曲信息，没有这个数组成员就返回空对象
export const currentSong = state => state.playList[state.currentIndex] || {}

export const songList = state => state.songList

export const ranking = state => state.ranking

export const searchHistory = state => state.searchHistory

export const playHistory = state => state.playHistory

export const favorite = state => state.favorite
