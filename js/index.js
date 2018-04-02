    //移动端网页触摸内容滑动
    let swiper = new Swiper('.swiper-container', {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    });

    //iscroll 滚动条插件
    var iscroll=new IScroll(".content",{
        //在iScroll初始化时开启鼠标滚轮支持和滚动条支持
        mouseWheel: true,
        scrollbars: true,   //出现滚动条
        shrinkScrollbars:"scale" ,//滚动条缩小
        click:true,
    });

    //点击新增
    var state="project";
    $(".add").click(function () {
        $(".mask").show();
        $(".submit").show();
        $(".update").hide();
        $(".inputarea").transition({y: 0}, 500)
    });

    $(".cancel").click(function () {
        $(".inputarea").transition({y: "-62vh"}, 500, function () {
            $(".mask").hide();
        })
    });
    $(".submit").click(function () {
        let val = $("#text").val();//获取
        if(val===""){
            return;
        }
        $("#text").val("");//设置
        var data = getData();
        var time = new Date().getTime();
        data.push({content: val, time, star: false,done:false});
        saveData(data);

        $(".inputarea").transition({y: "-62vh"}, 500, function () {
            $(".mask").hide();
            render();
        })
    });
    $(".project").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        state="project";
        render();
    });$(".done").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        state="done";
        render();
    });
    $(".update").click(function () {
        let val = $("#text").val();//获取
        if(val===""){
            return;
        }
        $("#text").val("");//设置
        var data = getData();
        var index=$(this).data("index");
        data[index].content=val;
        saveData(data);
        render();
        $(".inputarea").transition({y: "-62vh"}, 500, function () {
            $(".mask").hide();
        })
    });
    //事件委派
    $(".itemlist")
        .on("click",".changestate",function () {
        var index=$(this).parent().attr("id");
        var data=getData();
        data[index].done=true;//改变数据状态
        saveData(data);
        render();
    })
        .on("click",".del",function () {
            var index=$(this).parent().attr("id");
            var data=getData();
            data.splice(index,1);
            saveData(data);
            render();
        })
        .on("click","span",function () {
            var index=$(this).parent().attr("id");
            var data=getData();
            data[index].star=!data[index].star;//star取反
            saveData(data);
            render();
        })
        //修改
        .on("click","p",function () {
            var index=$(this).parent().attr("id");//获取第几条
            var data=getData();
            $(".mask").show();
            $(".inputarea").transition({y: 0}, 500);
            $("#text").val(data[index].content);
            $(".submit").hide();
            $(".update").show().data("index",index);//jianeirong
        });
    function getData() {
        return localStorage.todo ? JSON.parse(localStorage.todo) : [];
    }

    function saveData(data) {
        localStorage.todo = JSON.stringify(data);
    }

    function render() {
        var data = getData();
        var str = "";
        data.forEach(function (val, index) {
            if(state==="project"&&val.done===false){
                str += "<li id="+index+"><p>" + val.content + "</p><time>" + parseTime(val.time)
                    + "</time><span class="+(val.star?"active":"")+">*</span><div class='changestate'>完成</div></li>"
            }else if(state==="done"&&val.done===true){
                str += "<li id="+index+"><p>" + val.content + "</p><time>" + parseTime(val.time)
                    + "</time><span class="+(val.star?"active":"")+">*</span><div class='del'>删除</div></li>"
            }
            });
        $(".itemlist").html(str);
        iscroll.refresh(); //立即刷新iScroll边界 不去想要切换pc端就可以滚动
        addTouchEvent();
    }
    render();
    function parseTime(time) { //毫秒数
    //转换时间
        var date = new Date();
        date.setTime(time);
        var year = date.getFullYear();
        var month = setZero(date.getMonth() + 1);
        var day=setZero(date.getDate());
        var hour= setZero(date.getHours());
        var min =setZero(date.getMinutes());
        var sec=  setZero(date.getSeconds());
        return year+"/"+month+"/"+day+"<br>"+hour+":"+min+":"+sec;
    }
    function setZero(n) {
        return n < 10 ? "0" + n : n; //补0
    }
    function addTouchEvent() {
        $(".itemlist>li").each(function (index,ele) {
        var hammerobj=new Hammer(ele);
        var sx,movex;//开始的值 移动的值
        var max=window.innerWidth/5;
        var state="start";
        let flag=true;//手指离开之后要不要有动画
        hammerobj.on("panstart",function (e) {
            sx=e.center.x;
            ele.style.transition="";
        });
        hammerobj.on("panmove",function (e) {
            let cx = e.center.x;
            movex = cx - sx;
            if (movex > 0 && state === "start") {  //往右走  开始状态
                flag = false;
                return;
            }
            if (movex < 0 && state === "end") {
                flag = false;
                return;
            }//结束不能往左走
            if (Math.abs(movex) > max) {
                flag = false;
                state = state === "start" ? "end" : "start";
                if (state === "end") {
                    $(ele).css("x", -max);
                } else {
                    $(ele).css("x", 0);
                }
                return;
            }//不能走太多
            if (state === "end") {
                movex = cx - sx - max;//-max+cx-sx
            }
            flag=true;
            // ele.style.transform = `translateX(${movex}px)`;
            $(ele).css("x",movex);
        });
        ele.ontouchend=function () {
            if(!flag){return}
            if(Math.abs(movex)<max/2){
                $(ele).transition({x:0});
                state="start";
            }else{
                $(ele).transition({x:-max});
                state="end";
            }
        }
    })
}
    render();
