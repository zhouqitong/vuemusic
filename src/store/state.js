import {playMode} from 'common/js/config'
// import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
  singer: {},
  // 是否在播放
  playing: false,
  // 是否全屏
  fullScreen: false,
  // 不同模式下的播放顺序
  playlist: [],
  // 原始列表
  sequenceList: [],
  mode: playMode.sequence,
  // 当前播放的音乐  可以通过playlist计算得来
  currentIndex: -1,
  disc: {},
  topList: {},
  // searchHistory: loadSearch(),
  // playHistory: loadPlay(),
  // favoriteList: loadFavorite()
}

export default state
