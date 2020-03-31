$(function () {
    var oAudio = document.getElementsByClassName("audio")[0];
    var $playBtn = $(".player .control .play-btn");//播放键
    var $volumeBtn = $(".player .control .volume-btn");//音量键
    var $currentTime = $(".player .progress .current-time");
    var $endTime = $(".player .progress .end-time");
    var timer=null;//计时器
    var endTime = oAudio.duration;
    var currentVolume = oAudio.volume;
    var $prevBtn = $(".player .control .prev-btn");//上一首
    var $nextBtn = $(".player .control .next-btn");//下一首
    var index = 0;//当前歌曲序号
    var $musicTitle = $(".player .player-main .title");//歌曲题目

    var $progressBar = $(".player .progress .progress-bar");//进度条
    var $bgWidth = $progressBar.width();//进度条长度
    var $progressActive = $(".player .progress .progress-active");//实时进度条
    var $progressDots = $(".player .progress .dots");//进度球
    var $progressDotsWidth = $progressDots.width();//进度球宽度
    var newProgressBar = $bgWidth - $progressDotsWidth / 2;//用来计算的进度条长度,减去了进度球的长度一半

    var $volumeBar = $(".player .volume .volume-bar");//音量条
    var $volumeBarHeight = $volumeBar.height();//音量条高度
    var $volumeActive = $(".player .volume .volume-active");//实时音量条
    var $volumeDots = $(".player .volume .dots");//音量球
    var $volumeDotsHeight = $volumeDots.height();//音量球高度
    var newVolumeBar = $volumeBarHeight - $volumeDotsHeight / 2;

    var $imgCon = $(".player .player-main .img-con");//cd图案

    var musicSrcList = ["黄美珍 - 途中.mp3",
        "鞠婧祎 - 青城山下白素贞.mp3"];

    //初始化函数
    function init() {
        oAudio.src = "./source/" + musicSrcList[index];
        $musicTitle.text(musicSrcList[index]);

        endTime = oAudio.duration;
        $endTime.text(dealTime(endTime));

        currentVolume = oAudio.volume;
        oAudio.volume = $volumeActive.height() / newVolumeBar;

    }
    init();

    // 可以播放音乐时触发
    oAudio.oncanplay = function () {
        endTime = oAudio.duration;
        $endTime.text(dealTime(endTime));
        console.log("oncanplay")

    }

    // 切换class函数
    $.prototype.switchClass = function (remove, add) {
        this.removeClass(remove);
        this.addClass(add);
    }
    // 播放函数
    function musicPlay() {
        oAudio.play()
        $playBtn.switchClass("icon-play_icon", "icon-zanting");
        if(timer==null){
            timer = setInterval(progressMove, 200);
        }
        $imgCon[0].style.animationPlayState = "running";
        $musicTitle[0].style.animationPlayState = "running";
    }
    // 暂停函数
    function musicPause() {
        oAudio.pause();
        $playBtn.switchClass("icon-zanting", "icon-play_icon");
        $imgCon[0].style.animationPlayState = "paused";
        $musicTitle[0].style.animationPlayState = "paused";
        clearInterval(timer);
        timer = null;
    }


    // 点击播放或暂停
    $playBtn.click(function () {
        if (oAudio.paused) {
            musicPlay();
        } else {
            musicPause();
        }
    })

    $imgCon.click(function () {
        $playBtn.click();
    })

    //index数的处理
    function dealIndex(index) {
        if (index > musicSrcList.length - 1) {
            index = 0
        } else if (index < 0) {
            index = musicSrcList.length - 1;
        }
        return index;
    }

    // 点击前一个、后一个
    function changeMusic(dir) {
        if (dir == "next") {
            index++;
        } else if (dir == "prev") {
            index--;
        }
        index = dealIndex(index);
        oAudio.src = "./source/" + musicSrcList[index];
        $musicTitle.text(musicSrcList[index]);
        oAudio.load();
        $playBtn.click();


    }
    $nextBtn.click(function () {
        changeMusic("next");
    })
    $prevBtn.click(function () {
        changeMusic("prev");
    })

    oAudio.ondurationchange = function () {
        console.log("durationchange")
    }


    // 播放结束
    oAudio.onended = function () {
        console.log("ended");
        musicPause();
        $currentTime.text(dealTime(0));
        $progressActive.width(0);
        changeMusic("next");
    }

    // 数字格式处理函数如果是1位就在前面补上0
    function addZero(str) {
        if (typeof (str) == "number") {
            str = str.toString();
        }
        return str.replace(/^(\d)$/, "0$1");
    }
    // 时间处理函数
    function dealTime(seconds) {
        // seconds为秒数
        var hour = Math.floor(seconds / (60 * 60));
        var min = Math.floor(seconds % (60 * 60) / 60);
        var sec = Math.floor(seconds % (60 * 60) % 60);
        if (hour == 0) {
            return addZero(min) + ":" + addZero(sec);
        } else {
            return addZero(hour) + ":" + addZero(min) + ":" + addZero(sec);
        }

    }





    // 进度函数
    function progressMove() {
        console.log("progressMove")
        var currentTime = oAudio.currentTime;
        $currentTime.text(dealTime(currentTime));
        var w = currentTime / endTime * newProgressBar;
        $progressActive.width(w);
    }

    // 拖拽进度球
    $progressDots.mousedown(function (e) {
        // 阻止冒泡
        e.stopPropagation();
        clearInterval(timer);
        timer = null;
        var showTime = oAudio.currentTime;


        $(document).mousemove(function (e) {
            e.stopPropagation();
            var x = e.pageX - $progressBar.offset().left;
            if (x <= 0) {
                x = 0
            } else if (x >= newProgressBar) {
                x = newProgressBar;
            }

            $progressActive.width(x);
            showTime = x / newProgressBar * endTime;
            $currentTime.text(dealTime(showTime));


        }).mouseup(function () {
            $(this).off("mousemove");
            $(this).off("mouseup");
            // 就是因为没有取消document的mouseup事件导致了bug
            //不取消document的mouseup事件就会导致每次抬起鼠标都会触发这个事件
            oAudio.currentTime = showTime;
            if (!oAudio.paused) {
                if(timer==null){
                    timer = setInterval(progressMove, 200);
                }
                
            }
            if (oAudio.ended) {
                setTimeout(oAudio.onended, 400)
            }
        })

    })


    // 点击进度条
    $progressBar.mousedown(function (e) {
        var x = e.pageX - $progressBar.offset().left;
        if (x <= 0) {
            x = 0
        } else if (x >= newProgressBar) {
            x = newProgressBar;
        }

        $progressActive.width(x);
        showTime = x / newProgressBar * endTime;
        $currentTime.text(dealTime(showTime));
        oAudio.currentTime = showTime;

        clearInterval(timer);
        if (!oAudio.paused) {
            timer = setInterval(progressMove, 200);
        }
        if (oAudio.ended) {
            setTimeout(oAudio.onended, 1000)
        }
    })


    // 点击音量键

    $volumeBtn.click(function () {
        $(this).toggleClass("icon-yinliang");
        $(this).toggleClass("icon-jingyin");
        if ($(this).hasClass("icon-jingyin")) {
            oAudio.volume = 0;
            $volumeActive.height(0)
        } else {
            oAudio.volume = currentVolume;
            $volumeActive.height(currentVolume * newVolumeBar);
        }
    })

    //拖拽音量球
    $volumeDots.mousedown(function (e) {
        e.stopPropagation();


        $(document).mousemove(function (e) {
            var y = e.pageY - $volumeBar.offset().top;
            if (y <= 0) {
                y = 0;
            } else if (y >= newVolumeBar) {
                y = newVolumeBar;
            }
            var newY = newVolumeBar - y;
            $volumeActive.height(newY);
            var newVolume = newY / newVolumeBar;
            oAudio.volume = newVolume;

            if (oAudio.volume == 0) {
                $volumeBtn.switchClass("icon-yinliang", "icon-jingyin");
            } else {
                $volumeBtn.switchClass("icon-jingyin", "icon-yinliang");

            }
        }).mouseup(function () {
            $(this).off("mousemove");
            $(this).off("mouseup");
            currentVolume = oAudio.volume;
        })
    })

    //点击音量条
    $volumeBar.mousedown(function (e) {
        var y = e.pageY - $volumeBar.offset().top;
        if (y <= 0) {
            y = 0;
        } else if (y >= newVolumeBar) {
            y = newVolumeBar;
        }
        var newY = newVolumeBar - y;
        $volumeActive.height(newY);
        var newVolume = newY / newVolumeBar;
        oAudio.volume = newVolume;
        currentVolume = oAudio.volume;

        if (oAudio.volume == 0) {
            $volumeBtn.switchClass("icon-yinliang", "icon-jingyin");
        } else {
            $volumeBtn.switchClass("icon-jingyin", "icon-yinliang");
        }
    })
})










