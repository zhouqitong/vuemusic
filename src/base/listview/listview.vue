<template>
  <!--@scroll接收子空间发出的事件-->
  <scroll :data="data"
          :probe-type="probeType"
          :listen-scroll="listenScroll"
          class="listview"
          ref="listview"
          @scroll="scroll"
  >
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!--touchmove.stop.prevent 因为滚动的时候下面ListGroup有可以滚动所以需要阻止事件冒泡-->
    <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove"
         @touchend.stop>
      <ul>
        <li v-for="(item, index) in shortcutList" :data-index="index" class="item"
            :class="{'current':currentIndex===index}">{{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}} </div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>

</template>

<script type="text/ecmascript-6">
  import scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getData} from 'common/js/dom'
  //固定在顶部的标题的高度
  const TITLE_HEIGHT = 30
  // 快速导航条每个item的高度
  const ANCHOR_HEIGHT = 18
  export default {
    components: {
      scroll,
      Loading
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      // 右侧快速导航列表
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }


    },
    data() {
//        当属性较多的时候使用对象包裹起来
      return {
        scrollY: -1,
        // 右侧导航的索引
        currentIndex: 0,
        diff: -1
      }
    },
    created() {
      // 因为 probeType =1 是无法监听到快速滚动的
      this.probeType = 3
      this.listenScroll = true
      // 需要在函数之间共享数据
      this.touch = {}
      this.listHeight = []

    },

    methods: {
      selectItem(item) {
        this.$emit('select', item)
      },
      /**
       * 点击右侧快速导航列表
       * 1. 获取点击了那一个分组
       *
       */
      onShortcutTouchStart(e) {
        // 获取自定义属性中的值
        let anchorIndex = getData(e.target, 'index')

        this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex], 0)
        // 手指第一次touch的坐标
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        // 手指除了第一次外touch的坐标
        this.touch.y2 = firstTouch.pageY
        // |0 向下取整 相当于Math.floor
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta

        this._scrollTo(anchorIndex)
      },
      // 私有方法写在下面,共有方法写在上面
      // 实时获取滚动的y轴距离

      scroll(pos) {
        this.scrollY = pos.y
      },
      refresh() {
        this.$refs.listview.refresh()
      },
      // 计算每组的高度 并保存起来
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },

      _scrollTo(index) {
        // 点击 热门上面和 Z 下面的时候
        if (!index && index !== 0) {
          return
        }
//        以下代码可以省略
        // 当滑动到热门上面和 Z 下面的时候
//        if (index < 0) {
//          index = 0
//        } else if (index > this.listHeight.length - 2) {
//          index = this.listHeight.length - 2
//        }
         // 由于左侧滚动的时候 监听了scrollY的值从而改变currentIndex的值 如果要点击也改变currentIndex需要再设置一次
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      }
    },
    watch: {
      data() {
        // 数据的变化到dom的变化有一个延迟
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      //监听scrollY的变化
      scrollY(newY) {
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0

          if (newY > 0) {
            this.currentIndex = 0
            return
          }
        // 在中间部分滚动

        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]

          // 在中间部分滚动
          //大于上限 而小于下限 说明落在区间内
          // newY是一个负值
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            // title向上顶的过程中 分组的高度和移出屏幕的部分之间的差值
            this.diff = height2 + newY
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        // 因为每个元素包含一个上线和下限,所以listHeight数组会比真实分组多一个
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        //不用改变
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        // translate3d开启GPU加速
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
