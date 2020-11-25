// pages/home/home.js
const app = getApp();
const myaudio = wx.createInnerAudioContext(); 
let cnt =  [0, 0, 0, 0];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text1: '计时',
    text2: '自由',
    disabled1: false,
    disabled2: false,
    state: '',
    stop: false,
    accXs: [],
    accYs: [],
    accZs: [],
    gyrXs: [],
    gyrYs: [],
    gyrZs: [],
    timeSs: [],
    startTime: 0,
    start: 0,
    actionName: ['徒手侧平举', '前后交叉小跑','开合跳','半蹲'],
    actionCnt:[0,0,0,0],
    audioArr: [
      {
        id: '1',
        src: 'cloud://data-collection.6461-data-collection-1301103542/up.mp3',
        time: '30s',
        bl: false
      },
      {
        id: '2',
        src: 'cloud://data-collection.6461-data-collection-1301103542/run.mp3', // start up
        time: '50s',
        bl: false
      },
      {
        id: '3',
        src: 'cloud://data-collection.6461-data-collection-1301103542/jump.mp3',
        time: '30s',
        bl: false
      },
      {
        id: '4',
        src: 'cloud://data-collection.6461-data-collection-1301103542/down.mp3',
        time: '30s',
        bl: false
      },
      {
        id: '5',
        src: 'cloud://data-collection.6461-data-collection-1301103542/5394.wav',
        time: '30s',
        bl: false
      }
    ],

    audKey: '',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*
    console.log("onload")
    wx.request({
      url: 'http://www.ywonchall.top:100/', //仅为示例，并非真实的接口地址
      data: {
        code:"501009",
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        //console.log(res.data[1])
        //_this.audioPlay(res.data[1])
        //cnt[res.data[1]-1] = cnt[res.data[1]-1] + 2
        //console.log(cnt)
      }
    })*/
  },

 
  stop: function () {
    wx.offGyroscopeChange()
    wx.offAccelerometerChange()
    wx.stopAccelerometer({
      success: res => {
        console.log("停止读取加速度")
      }
    })
    wx.stopGyroscope({
      success: res => {
        console.log("停止读取陀螺仪")
      }
    })
  },

  start: function () {
    wx.startAccelerometer({
      interval: 'game',
      success: res => { console.log("加速度计调用成功"); },
      fail: res => { console.log(res) }
    });
    wx.startGyroscope({
      interval: 'game',
      success: res => { console.log("陀螺仪调用成功"); },
      fail: res => { console.log(res) }
    });
  },


  begin: function (e) {
    
    this.audioPlay(5)
    if (e.currentTarget.id == "1"){
      if (this.data.text1 != '停止') {
        
        cnt = [0, 0, 0, 0]
        this.setData({
          text1: '停止',
          disabled2: true
        })
        setTimeout(this.count, 5000);
      }
      else{
        this.audioStop(5)
        this.setData({
          actionCnt: cnt,
          text1: '计时',
          disabled2: false
        })
        this.stop()

      }
    }
    else{
      if (this.data.text2 != '停止') {
        cnt = [0, 0, 0, 0]
        this.setData({
          text2: '停止',
          disabled1: true
        })
        setTimeout(this.free, 5000);
      }
      else {
        this.audioStop(5)
        console.log(cnt)
        this.setData({
          actionCnt: cnt,
          text2: '自由',
          disabled1: false
        })
        this.stop()

      }
    }

  },
  count: function(){
    this.acStart(0)
  },
  free: function(){
    this.acStart(1)
  },

  acStart: function (e) {
    let _this = this;
    let accXs = [];
    let accYs = [];
    let accZs = [];
    let timeSs = [];
    let gyrXs = [];
    let gyrYs = [];
    let gyrZs = [];
    
    this.setData({
      startTime: new Date().getTime(),
      start: new Date().getTime(),
      
    })
    _this.start()
    wx.onAccelerometerChange(function (res) {
      let mid_time = new Date().getTime();
      let timeStep = (mid_time - _this.data.startTime) / 1000
      if (timeStep < 2.56) {
        accXs.push(res.x)
        accYs.push(res.y)
        accZs.push(res.z)
        timeSs.push(mid_time)
      }
    })
    wx.onGyroscopeChange(function (res) {
      let mid_time = new Date().getTime();
      let timeStep = (mid_time - _this.data.startTime) / 1000
      let time = (mid_time - _this.data.start) / 1000
      if (time > 30 && e==0){
        _this.setData({
          actionCnt: cnt
        })
        _this.stop(),
        _this.setData({
          text1: '计时',
          disabled2: false
        })
      }
      if (timeStep < 2.56) {
        gyrXs.push(res.x)
        gyrYs.push(res.y)
        gyrZs.push(res.z)
      }
      else {
        _this.setData({
          startTime: new Date().getTime(),
          accXs: accXs,
          accYs: accYs,
          accZs: accZs,
          gyrXs: gyrXs,
          gyrYs: gyrYs,
          gyrZs: gyrZs,
          timeSs: timeSs
        })
        //console.log(_this.data.accZs)
        accXs = []
        accYs = []
        accZs = []
        gyrXs = []
        gyrYs = []
        gyrZs = []

        //console.log("1"),
        wx.request({
          url: 'https://www.ywonchall.top:100/', //仅为示例，并非真实的接口地址
          data: {
            //code:"50109",
            gyrXs: _this.data.gyrXs,
            gyrYs: _this.data.gyrYs,
            gyrZs: _this.data.gyrZs,
            accXs: _this.data.accXs,
            accYs: _this.data.accYs,
            accZs: _this.data.accZs
          },
          method: 'POST',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            //console.log(res)
            console.log(res.data[1])
            _this.audioPlay(res.data[1])
            cnt[res.data[1]-1] = cnt[res.data[1]-1] + 2
            console.log(cnt)
          }
        })
        
      }
    })
    
  },

  audioPlay: function(e) {
    var that = this,
      id = e,
      key = e-1,
      audioArr = that.data.audioArr;

    //设置状态
    audioArr.forEach((v, i, array) => {
      v.bl = false;
      if (i == key) {
        v.bl = true;
      }
    })
    that.setData({
      audioArr: audioArr,
      audKey: key,
    })

    myaudio.autoplay = true;
    var audKey = that.data.audKey,
      vidSrc = audioArr[audKey].src;
    myaudio.src = vidSrc;

    myaudio.play();

    //开始监听
    myaudio.onPlay(() => {
      console.log('开始播放');
    })

    //结束监听
    myaudio.onEnded(() => {
      console.log('自动播放完毕');
      this.audioStop(key)
      audioArr[key].bl = false;
      that.setData({
        audioArr: audioArr,
      })
    })

    //错误回调
    myaudio.onError((err) => {
      console.log(err);
      audioArr[key].bl = false;
      that.setData({
        audioArr: audioArr,
      })
      return
    })

  },

  audioStop: function(e) {
    var that = this,
      key = e,
      audioArr = that.data.audioArr;
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.bl = false;
    })
    that.setData({
      audioArr: audioArr
    })

    myaudio.stop();

    //停止监听
    myaudio.onStop(() => {
      console.log('停止播放');
    })

  },

})