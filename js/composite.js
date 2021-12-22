/*
 * 图片合成工具类
 * 作者：前端小玖
 * 时间：2021-12-21
*/

// 构造函数
function Composite (targetId) {
    this.whiteUrl = ''
    this.blackUrl = ''
    this.whiteReady = false
    this.blackReady = false
    this.maxHeight = 300
    this.canvas = document.createElement('canvas')

    // target是用来存放合成后的图片的div
    // 如果没有指定，则自行创建一个
    let target = document.getElementById(targetId)
    if (!target) {
        let div = document.createElement('div')
        div.style.width = '91%'
        div.style.height = '14rem'
        document.body.appendChild(div)
        this.target = div
    } else {
        this.target = target
    }
}

// 生成白底图
Composite.prototype.imgWhite = function (img) {
    let that = this
    img.onload = function () {
        let canvas = that.canvas
        let data = that.drawImg(img, canvas)
        let pureData = that.processingWhite(canvas, data)
        that.whiteUrl = that.draw(pureData, canvas)
        that.whiteReady = true
    }
}

// 生成黑底图
Composite.prototype.imgBlack = function (img) {
    let that = this
    img.onload = function () {
        let canvas = that.canvas
        let data = that.drawImg(img, canvas) // 1. 得到图片数据
        let pureData = that.processingBlack(canvas, data) // 2. 图片数据去色
        that.blackUrl = that.draw(pureData, canvas) // 3. 将去色后的数据转为图片
        that.blackReady = true // 4. 准备就绪
    }
}

// 将图片绘制到canvas上，然后得到图片数据
Composite.prototype.drawImg = (img, canvas) => {
    let ctx = canvas.getContext("2d")
    if (img.height > this.maxHeight) {
        // 宽度等比例缩放 *=  
        img.width *= this.maxHeight / img.height
        img.height = this.maxHeight
    }
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0, img.width, img.height)
    let data = ctx.getImageData(0, 0, img.width, img.height).data
    return data
}

// 用imgData绘制
Composite.prototype.draw = (imgData, canvas) => {
    let ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.putImageData(imgData, 0, 0)
    let imgUrl = canvas.toDataURL("image/png")
    return imgUrl
}


// 创建空白canvas画布，得到画布像素数据
Composite.prototype.getBlankCanvasImgData = function (canvas) {
    let ctx = canvas.getContext("2d")
    return ctx.createImageData(canvas.width, canvas.height)
}

// 处理白底时图片
Composite.prototype.processingWhite = function (canvas, data) {
    let blankData = this.getBlankCanvasImgData(canvas)
    let blankDataData = blankData.data
    for (let i = 0, len = data.length; i < len; i += 4) {
        let red = data[i],
            green = data[i + 1],
            blue = data[i + 2],
            alpha = data[i + 3],
            light = 0.299 * red + 0.587 * green + 0.114 * blue // 亮度
        let k = 130;
        blankDataData[i] = light
        blankDataData[i + 1] = light
        blankDataData[i + 2] = light
        blankDataData[i + 3] = alpha * (k - light) / 255
        if (light > k) {
            blankDataData[i + 3] = 0
        }
    }
    return blankData
}

// 处理黑底时图片
Composite.prototype.processingBlack = function (canvas, data) {
    let blankData = this.getBlankCanvasImgData(canvas)
    let blankDataData = blankData.data
    for (let i = 0, len = data.length; i < len; i += 4) {
        let red = data[i],
            green = data[i + 1],
            blue = data[i + 2],
            alpha = data[i + 3],
            light = (0.299 * red + 0.587 * green + 0.114 * blue) * 4.5 //亮度
        blankDataData[i] = light
        blankDataData[i + 1] = light
        blankDataData[i + 2] = light
        blankDataData[i + 3] = alpha * light / 255 * 0.08
        if (light < 150) {
            blankDataData[i + 3] = 0
        }
    }
    return blankData
}

// 合成图片
Composite.prototype.generate = function () {
    if (!this.whiteReady || !this.blackReady) {
        alert("请先上传缩略图和展开图，然后再合成")
        return
    }
    let that = this
    let canvas = that.canvas
    let img_white = new Image()
    let img_black = new Image()
    img_white.src = that.whiteUrl
    img_black.src = that.blackUrl
    img_white.onload = function() {
        let ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img_white, 0, 0, canvas.width, canvas.height)
        img_black.onload = function() {
            let ctx = canvas.getContext("2d")
            ctx.drawImage(img_black, 0, 0, canvas.width, canvas.height)
            that.appednImage()
        }
    }
}

// 将合成后的图片添加到页面
Composite.prototype.appednImage = function () {
    this.target.innerHTML = ""
    this.target.style.backgroundColor = '#FFF'
    let img = document.createElement("img")
    img.style.width = '100%'
    img.style.height = '100%'
    img.src = this.canvas.toDataURL("image/png")
    this.target.appendChild(img)
}
