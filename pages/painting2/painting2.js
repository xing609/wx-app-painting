// painting-2.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasChoosedImg: false,
    canvasWidth: 0,
    canvasHeight: 0,
    canvasHeightLen: 0,
    windowHeight: 0,
    prevPosition: [0, 0],
    background: '',

    btnInfo: [
      {
        type: 'width',
        background: 'url("http://cdn3.freepik.com/image/th/318-28305.jpg"); background-size: 30px 30px;'
      },
      {
        type: 'color',
        background: 'url("http://img2.web07.cn/UpPic/Png/201411/19/334374191221572.png") white no-repeat; background-size: 24px 24px;background-position: 3px 3px;'
      },
      {
        type: 'clear',
        background: 'url("http://img0.imgtn.bdimg.com/it/u=1358545290,3102156418&fm=26&gp=0.jpg") white no-repeat; background-size: 20px 20px;background-position: 5px 5px;'
      },
      {
        type: 'save',
        background: 'url("http://msqq.com/d/file/icon/2014-04-12/a8b06d02b0eeac79c5e150fb24c6b1fc.png") white no-repeat; background-size: 20px 20px;background-position: 5px 5px;'
      }
    ],
    width: false,
    color: false,
    r: 33,
    g: 33,
    b: 33,
    w: 2,
    clear: false,
    eraser: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log(res);
        that.setData({
          canvasWidth: res.windowWidth,
          canvasHeight: res.windowHeight - 50,
          windowHeight: res.windowHeight
        })
      },
    })
    wx.chooseImage({
      success: function(res) {
        that.setData({
          hasChoosedImg: true,
        })
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function(res) {
            let [height, width] = [that.data.canvasWidth / res.width * res.height, that.data.canvasWidth];
            if (height > that.data.windowHeight - 50) {
              height = that.data.windowHeight - 50;
              width = height / res.height * res.width;
            }
            that.setData({
              canvasHeight: height,
              canvasWidth: width,
              background: res.path
            });            
          }
        })
      },
      fail: function(res) {
        console.log(res);
      }
    })
  },

  tapBtn: function (e) {
    let btnType = e.target.dataset.type;
    let that = this;

    if (btnType == 'width') {
      this.setData({
        width: !this.data.width,
        color: false,
        clear: false,
        canvasHeightLen: (!this.data.width) ? Math.min(this.data.canvasHeight, this.data.windowHeight - this.data.w - 130) : 0,
      })
    } else if (btnType == 'color') {
      this.setData({
        width: false,
        color: !this.data.color,
        clear: false,
        canvasHeightLen: (!this.data.color) ? Math.min(this.data.canvasHeight, this.data.windowHeight - this.data.w - 205) : 0,
      })
    } else if (btnType == 'clear') {
      this.setData({
        width: false,
        color: false,
        clear: !this.data.clear,
        canvasHeightLen: (!this.data.clear) ? Math.min(this.data.canvasHeight, this.data.windowHeight - this.data.w - 120) : 0,
      })
    } else if (btnType == 'save') {
      this.setData({
        width: false,
        color: false,
        clear: false,
        canvasHeightLen: 0 
      })
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        success: function (res) {
          let src = res.tempFilePath;

          let ctx = wx.createCanvasContext('myCanvas');

          ctx.drawImage(that.data.background, 0, 0, that.data.canvasWidth, that.data.canvasHeight);
          ctx.drawImage(src, 0, 0, that.data.canvasWidth, that.data.canvasHeight);
          ctx.draw();

          wx.canvasToTempFilePath({
            canvasId: 'myCanvas',
            success: function (res) {
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: function (r) {
                  console.log(r)
                }
              })
            },
          })
        }
      })
    }
  },

  touchStart: function (e) {

    this.setData({
      prevPosition: [e.touches[0].x, e.touches[0].y],
      width: false,
      color: false,
      canvasHeightLen: 0
    })
  },

  touchMove: function (e) {
    let ctx = wx.createCanvasContext('myCanvas');

    if (this.data.eraser) {
      ctx.clearRect(e.touches[0].x, e.touches[0].y, 20, 20);
      ctx.draw(true);
    } else {
      ctx.setStrokeStyle("rgb(" + this.data.r + ', ' + this.data.g + ', ' + this.data.b + ')');
      ctx.setLineWidth(this.data.w);
      ctx.setLineCap('round');
      ctx.setLineJoin('round');
      ctx.moveTo(this.data.prevPosition[0], this.data.prevPosition[1]);
      ctx.lineTo(e.touches[0].x, e.touches[0].y);
      ctx.stroke();
      ctx.draw(true);
    }

    this.setData({
      prevPosition: [e.touches[0].x, e.touches[0].y]
    })
  },

  clearCanvas: function () {
    let ctx = wx.createCanvasContext('myCanvas');
    ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
    ctx.draw();
    this.setData({
      clear: false,
      canvasHeightLen: 0
    })
  },

  chooseEraser: function () {
    this.setData({
      eraser: !this.data.eraser,
      clear: false,
      canvasHeightLen: 0
    })
  },

  changeColor: function (e) {
    if (e.target.dataset.color == 'r') {
      this.setData({
        r: e.detail.value,
        eraser: false,
      })
    } else if (e.target.dataset.color == 'g') {
      this.setData({
        g: e.detail.value,
        eraser: false,
      })
    } else if (e.target.dataset.color == 'b') {
      this.setData({
        b: e.detail.value,
        eraser: false,
      })
    }
  },

  changeWidth: function (e) {
    let w = this.data.w
    this.setData({
      w: e.detail.value,
      canvasHeightLen: this.data.canvasHeightLen + w - e.detail.value,
      eraser: false,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})