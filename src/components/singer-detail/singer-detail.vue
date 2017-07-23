<template>
  <!--路由跳转太生硬了,可以添加转场动画-->
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>

</template>

<script type="text/ecmascript-6">
  import {ERR_OK} from 'api/config'
  import MusicList from 'components/music-list/music-list'

  import {getSingerDetail} from 'api/singer'
  import {createSong} from 'common/js/song'

  // 给取数据提供了语法糖
  import {mapGetters} from 'vuex'

  export default {

    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    data() {
      return {
        songs: []
      }
    },
    created() {

      this._getDetail()
    },
    methods: {
      _getDetail() {
        // 直接在歌手详情页面刷新没有id是抓取不到数据的 返回回去
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {

            this.songs = this._normalizeSongs(res.data.list)

          }
        })
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          // 对象解构赋值
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    components: {
      MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  // CSS里面 @ $ 写错了 不报错
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)


</style>
