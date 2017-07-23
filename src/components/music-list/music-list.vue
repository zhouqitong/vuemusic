<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <!--有很多html转义字符所以需要v-html-->
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
      <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
      <i class="icon-play"></i>
      <span class="text">随机播放全部</span>
      </div>
    </div>
    <div class="filter" ref="filter"></div>
    </div>
    <!--这个层就是用来 实现背景图片向上推的效果-->
    <div class="bg-layer" ref="layer"></div>
    <scroll :data="songs" @scroll="scroll"
            :listen-scroll="listenScroll" :probe-type="probeType" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="selectItem"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import SongList from 'base/song-list/song-list'
  import {prefixStyle} from 'common/js/dom'
  //  import {playlistMixin} from 'common/js/mixin'
  // 语法糖
    import {mapActions} from 'vuex'
  // back 按钮的高度
  const RESERVED_HEIGHT = 40
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')
  console.log(transform);
  export default {
//    mixins: [playlistMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
//      rank: {
//        type: Boolean,
//        default: false
//      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    created() {
      //传递给music-list
      this.probeType = 3
      this.listenScroll = true
    },
    //解决歌曲列表沾满整哥屏幕
    mounted() {
      this.imageHeight = this.$refs.bgImage.clientHeight
      // 记录下来最大滚动距离 ,也可以减少多余的dom操作
      this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT
//      $el获取dom  让列表显示在歌手图片下面
      // 根据css的样式,在图片加载到dom之前就已经固定了他的高度了 但是这样把列表固定在底部用户体验不好
      // 新的需求:需要歌曲列表往上拉的时候图片能缩小跟着一起走  : 第一步去掉overflow:hidden
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    methods: {
      // 解决小播放器 占了部分高度导致各个列表显示不全
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      // 实时拿到scrolly的值
      scroll(pos) {
        this.scrollY = pos.y

      },
      back() {
        this.$router.back()
      },
      // item为什么不用:子控件把自己有的数据传过来 父控件根据需求去用
      selectItem(item, index) {
        // 把actions 包装成函数调用的方式
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      random() {
        this.randomPlay({
          list: this.songs
        })
      },
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      // 监听从子控件传递过来的scroll值
      scrollY(newVal) {
        // 改变背景图的位置
        // 设置一个最大的滚动量 ,只要到back按钮的位置就可以了
        let translateY = Math.max(this.minTransalteY, newVal)
        let scale = 1
        let zIndex = 0
        let blur = 0
        // 设置放大缩小的比例  无缝放大缩小   / 可以获得0~1之间的小数  向下 递减 向上递增
        const percent = Math.abs(newVal / this.imageHeight)

        if (newVal > 0) {
          // 图片增加了newY的高度
          scale = 1 + percent
          // 不加zIndex 图片会把列表遮住
          zIndex = 10
        }else {
          blur = Math.min(50, percent * 50)
        }

        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
        // backdrop这个是css 高斯模糊的属性  只有ios能看到  android 和PC都看不到

        this.$refs.filter.style[backdrop] = `blur(${blur}px)`
//        解决推到顶部后背景图片停下来了,但是歌曲列表还是会网上走 所以要动态设置zindex
        if (newVal < this.minTransalteY) {
          // 让图片遮盖住列表
          zIndex = 10
          // 因为要写死高度为RESERVED_HEIGHT 所以paddingTop要设置为0
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none'
        }
        else {
          // 重置回到初始的样式
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        // 放大都是从顶部开始 ,因为css 里面定义了transform为 origin
        this.$refs.bgImage.style[transform] = `scale(${scale})`
        this.$refs.bgImage.style.zIndex = zIndex
      }
    },
    components: {
      Scroll,
      Loading,
      SongList
    }

  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
