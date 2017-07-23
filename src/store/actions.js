// action的作用是当需要修改多个mutation的时候封装起来


import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
// import {saveSearch, clearSearch, deleteSearch, savePlay, saveFavorite, deleteFavorite} from 'common/js/cache'
//找到顺序列表中的歌是random列表歌中的哪一首
function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
// list 歌曲的列表 index 索引
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  // 解决 当外部随机播放的时候 再点击某条歌曲是不一致的问题 因为两个index不一样   实际运行没发现这个问题
  // if (state.mode === playMode.random) {
  //   let randomList = shuffle(list)
  //   commit(types.SET_PLAYLIST, randomList)
  //   index = findIndex(randomList, list[index])
  // } else {
    commit(types.SET_PLAYLIST, list)
  // }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
//
export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
//
// export const insertSong = function ({commit, state}, song) {
//   let playlist = state.playlist.slice()
//   let sequenceList = state.sequenceList.slice()
//   let currentIndex = state.currentIndex
//   // 记录当前歌曲
//   let currentSong = playlist[currentIndex]
//   // 查找当前列表中是否有待插入的歌曲并返回其索引
//   let fpIndex = findIndex(playlist, song)
//   // 因为是插入歌曲，所以索引+1
//   currentIndex++
//   // 插入这首歌到当前索引位置
//   playlist.splice(currentIndex, 0, song)
//   // 如果已经包含了这首歌
//   if (fpIndex > -1) {
//     // 如果当前插入的序号大于列表中的序号
//     if (currentIndex > fpIndex) {
//       playlist.splice(fpIndex, 1)
//       currentIndex--
//     } else {
//       playlist.splice(fpIndex + 1, 1)
//     }
//   }
//
//   let currentSIndex = findIndex(sequenceList, currentSong) + 1
//
//   let fsIndex = findIndex(sequenceList, song)
//
//   sequenceList.splice(currentSIndex, 0, song)
//
//   if (fsIndex > -1) {
//     if (currentSIndex > fsIndex) {
//       sequenceList.splice(fsIndex, 1)
//     } else {
//       sequenceList.splice(fsIndex + 1, 1)
//     }
//   }
//
//   commit(types.SET_PLAYLIST, playlist)
//   commit(types.SET_SEQUENCE_LIST, sequenceList)
//   commit(types.SET_CURRENT_INDEX, currentIndex)
//   commit(types.SET_FULL_SCREEN, true)
//   commit(types.SET_PLAYING_STATE, true)
// }
//
// export const saveSearchHistory = function ({commit}, query) {
//   commit(types.SET_SEARCH_HISTORY, saveSearch(query))
// }
//
// export const deleteSearchHistory = function ({commit}, query) {
//   commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
// }
//
// export const clearSearchHistory = function ({commit}) {
//   commit(types.SET_SEARCH_HISTORY, clearSearch())
// }
//
// export const deleteSong = function ({commit, state}, song) {
//   let playlist = state.playlist.slice()
//   let sequenceList = state.sequenceList.slice()
//   let currentIndex = state.currentIndex
//   let pIndex = findIndex(playlist, song)
//   playlist.splice(pIndex, 1)
//   let sIndex = findIndex(sequenceList, song)
//   sequenceList.splice(sIndex, 1)
//   if (currentIndex > pIndex || currentIndex === playlist.length) {
//     currentIndex--
//   }
//
//   commit(types.SET_PLAYLIST, playlist)
//   commit(types.SET_SEQUENCE_LIST, sequenceList)
//   commit(types.SET_CURRENT_INDEX, currentIndex)
//
//   if (!playlist.length) {
//     commit(types.SET_PLAYING_STATE, false)
//   } else {
//     commit(types.SET_PLAYING_STATE, true)
//   }
// }
//
// export const deleteSongList = function ({commit}) {
//   commit(types.SET_CURRENT_INDEX, -1)
//   commit(types.SET_PLAYLIST, [])
//   commit(types.SET_SEQUENCE_LIST, [])
//   commit(types.SET_PLAYING_STATE, false)
// }
//
// export const savePlayHistory = function ({commit}, song) {
//   commit(types.SET_PLAY_HISTORY, savePlay(song))
// }
//
// export const saveFavoriteList = function ({commit}, song) {
//   commit(types.SET_FAVORITE_LIST, saveFavorite(song))
// }
//
// export const deleteFavoriteList = function ({commit}, song) {
//   commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
// }
