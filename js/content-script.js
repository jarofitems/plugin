
function addCode() {

    if(window.location.host!="www.wsttrip.com")return;
    // dom添加标签元素到页面中
    document.getElementById("kh_khdd_pnForm").insertAdjacentHTML("beforebegin", "<div id='info_box' >" +
        "<span>借票：<input id='dr_jp' type='number'></span>" +
        "<span>机票退改信息及行李规定如下：<input id='tg_jp' type='text'></span>" +
        "<button id='info_box_t'>导出</button>"
        + "</div>")
}
addCode();

if(window.location.host=="www.wsttrip.com"){
    var innHtml = document.getElementById("kh_khdd_pnForm").innerHTML;
}


$("#info_box_t").click(function (event) {

    // 发送数据到后台
    // chrome.runtime.sendMessage({ greeting: innHtml }, function (response) {
    //     console.log('收到来自后台的回复：' + response);
    // });
    // return;
    // 日期
    var datetime = "20"+innHtml.split("订单编号")[1].split("订单状态")[0].split("&nbsp;")[3].split("\t\t\t\t\t")[1].split(" ")[0].replaceAll("-", "/")
    // 订票员
    var fromCompany = "深圳市万顺通国际旅行社有限公司-" + innHtml.split("订单编号")[1].split("订单状态")[0].split("&nbsp;")[2].split(" ")[5]

    // 乘机人信息
    var passengerInfo = ontaketheplane()

    // 含税票价
    var sArray = []
    passengerInfo.forEach((item, index) => {
        sArray.push(document.getElementById("tr1" + (Number(index) + 1)).innerHTML)
    })
    var sArrayList = []
    sArray.forEach((item, index) => {
        if (sArray.length > 1) {
            sArrayList.push("P"+(Number(index) + 1) + '.' + dataObj(item, Number(index) + 1))
        } else {
            sArrayList.push(dataObj(item, Number(index) + 1))
        }
    })
    // 航班号
    var flightList = onflight();
    var hhs = []
    flightList.forEach((item, index) => {
        var ttr = document.getElementsByClassName("jp_dd_main_detail_hbxx_tbody")[index].innerHTML;
        // 舱位
        item.cabin = ttr.split('name="hd_cw"')[1].split('"')[1]

        // 日期
        var da = ttr.split('name="hd_cfsj"')[1].split('"')[1].split("-")
        var ds = ttr.split('name="hd_cfsj"')[1].split('"')[1]
        var weekArrayList = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
        var years = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEL"]
        var index = new Date(ds).getDay()

        // 月份标识术语
        var yearob = ""
        years.map((item, index) => {
            if (da[1] == index + 1) {
                yearob = item
            }
        })
        item.date = weekArrayList[index] + da[2] + yearob


        // 行程
        item.route = ttr.split('name="hd_cfcity"')[1].split('"')[1] + "-" + ttr.split('name="hd_ddcity"')[1].split('"')[1]

        // 出发时间
        var starTimes = ttr.split('name="hd_cfsj_p"')[1].split('"')[1]
        item.departureTime = starTimes[0] + starTimes[1] + ':' + starTimes[2] + starTimes[3]

        //  到达时间
        var endTimes = ttr.split('name="hd_bzbz_p"')[1].split('"')[1]

        // 计算跨天的时间处理
        var us1 = ttr.split('name="hd_cfsj"')[1].split('"')[1]
        var us2 =ttr.split('name="hd_bzbz"')[1].split('"')[1]

        var textDate = calculateDiffTime(us1,us2)
        var td = textDate==0?'':'+'+textDate
        item.arrivalTime = endTimes[0] + endTimes[1] + ':' + endTimes[2] + endTimes[3]+td




        //  出发-到达
        var c1 = ttr.split('name="hd_cfcity"')[1].split('"')[1]
        var c2 = ttr.split('name="hd_ddcity"')[1].split('"')[1]
        var c3 = ttr.split('id="hd_cityname"')[1].split('"')[1]
        var c4 = ttr.split('id="hd_ddcityname"')[1].split('"')[1]
        var c5 = ttr.split(c1)[2].split("（")[1].split('&nbsp;')[0]
        var c6 = ttr.split(c2)[2].split("（")[1].split('&nbsp;')[0]
        item.departureArrival = c3 + c5 + '-' + c4 + c6

        // 飞行时间预留
        item.flightDuration = ""
        // 航司
        hhs.push(item.flightNo.split('.')[1].slice(0, 2))

        // console.log(ttr)
    })
    // 航司数据
    var pilot = []
    hhs.forEach((item, index) => {
        pilot.push(airline(item))
    })
    pilot = Array.from(new Set(pilot))
    if (pilot.length > 1) {
        pilot.map((item, index) => {
            pilot[index] = (Number(index) + 1) + '.' + item;
        })
    }
    if ($("#tg_jp").val() == "") {
        alert("请输入机票退改信息及行李规定")
        return;
    }
    var dataObject = {
        date: datetime,
        flightsInfos: flightList,
        fromCompany: fromCompany,
        passengerInfo: passengerInfo.join(" "),
        total:"合计:"+ontotal(sArray)+"元",//合计
        refundInfo: $("#tg_jp").val(),
        secCodes: pilot,
        ticketTaxFares: sArrayList
    }
    // console.log(dataObject)
    // return;
    // 发送数据到后台
    chrome.runtime.sendMessage({ greeting: dataObject }, function (response) {
        console.log('收到来自后台的回复：' + response);
    });
})
// 乘机人
function ontaketheplane() {
    var s = innHtml.split('cjr_cjrxm')
    s.shift()
    s.map((item, index) => {
        if (item.length < 30) {
            s.splice(index, 1)
        }
    });
    s.map((item, index) => {
        if (s.length > 1) {
            s[index] = index + 1 + "." + item.split('\"')[2]

        } else {
            s[index] = item.split('\"')[2]

        }
    });
    return s;
}
// 税票处理
function dataObj(item, index) {
    // 借票
    var jp = $("#dr_jp").val()
    // 含税价格
    var hsAmount = Number($("#cjr_fpj_hj" + index).val())
    // 销售价
    var hsAmount1 = Number($("#cjr_xsj" + index).val())
    // 税费
    var hsAmount2 = Number($("#cjr_tax" + index).val())
    // 服务费
    var hsAmount3 = Number($("#cjr_qt2" + index).val())
    if (jp == 0 || jp == '') {
        return "含税票价" + (hsAmount1+hsAmount2) + "(" + hsAmount1 + "+TAX" + hsAmount2 + ")+服务费" + hsAmount3 + "=" + hsAmount + "元/位"
    } else {
        return "含税票价" + (hsAmount1+hsAmount2) + "(" + hsAmount1 + "+TAX" + hsAmount2 + ")+服务费" + hsAmount3 + "+借票" + jp + "=" + (Number(hsAmount) + Number(jp)) + "元/位"
    }
}
// 合计价格
function ontotal(sArray){
    let sum = 0
    console.log(sArray)

    sArray.forEach((item,index)=>{
        // 含税价格
        var hsAmount = Number($("#cjr_fpj_hj" + (Number(index)+1)).val())
        console.log(hsAmount)
        // 借票
        var jp = $("#dr_jp").val()
        if (jp == 0 || jp == '') {
            sum=sum+Number(hsAmount)
        } else {
            sum = sum+Number(hsAmount)+Number(jp)
        }
    })
    // console.log(sum)
    return sum;
}
// 航班
function onflight() {
    var t = innHtml.split('id="hd_hbh"')
    var h = []
    t.map((item, index) => {
        t[index] = item.slice(0, 20)
    });
    t.map((item, index) => {
        if (item.indexOf("value") == -1) {
            t.splice(index, 1)
        }
    });
    t.map((item, index) => {
        h.push({
            "flightNo": index + 1 + "." + item.split('\"')[1]
        })

    });
    return h;
}
function airline(e) {
    var dataList = [
        { "name": "所罗门航空", "value": "IE" },
        { "name": "桂林", "value": "GT" },
        { "name": "缅航", "value": "8M" },
        { "name": "大湾区航空", "value": "HB" },
        { "name": "东航", "value": "MU" },
        { "name": "乌干达航空", "value": "UR" },
        { "name": "国航", "value": "CA" },
        { "name": "爱沙尼亚航空", "value": "OV" },
        { "name": "洛根航空", "value": "LC" },
        { "name": "金鹏", "value": "Y8" },
        { "name": "乌航", "value": "UQ" },
        { "name": "藏航", "value": "TV" },
        { "name": "山航", "value": "SC" },
        { "name": "江西", "value": "RY" },
        { "name": "青岛", "value": "QW" },
        { "name": "西部", "value": "PN" },
        { "name": "重庆", "value": "OQ" },
        { "name": "河北", "value": "NS" },
        { "name": "厦航", "value": "MF" },
        { "name": "龙江", "value": "LT" },
        { "name": "昆航", "value": "KY" },
        { "name": "联航", "value": "KN" },
        { "name": "幸福", "value": "JR" },
        { "name": "首都", "value": "JD" },
        { "name": "海航", "value": "HU" },
        { "name": "吉祥", "value": "HO" },
        { "name": "内蒙古通航", "value": "HL" },
        { "name": "海洋", "value": "HC" },
        { "name": "多彩", "value": "GY" },
        { "name": "北部湾", "value": "GX" },
        { "name": "天航", "value": "GS" },
        { "name": "长龙", "value": "GJ" },
        { "name": "华夏", "value": "G5" },
        { "name": "福州", "value": "FU" },
        { "name": "上航", "value": "FM" },
        { "name": "成航", "value": "EU" },
        { "name": "东海", "value": "DZ" },
        { "name": "瑞丽", "value": "DR" },
        { "name": "南航", "value": "CZ" },
        { "name": "大新华", "value": "CN" },
        { "name": "奥凯", "value": "BK" },
        { "name": "九元", "value": "AQ" },
        { "name": "湖南航", "value": "A6" },
        { "name": "长安", "value": "9H" },
        { "name": "天骄", "value": "9D" },
        { "name": "春秋", "value": "9C" },
        { "name": "祥鹏", "value": "8L" },
        { "name": "川航", "value": "3U" },
        { "name": "深航", "value": "ZH" },
        { "name": "塔斯利航空", "value": "SF" },
        { "name": "首尔航空", "value": "RS" },
        { "name": "新加坡酷航", "value": "TR" },
        { "name": "越竹航空", "value": "QH" },
        { "name": "Cem航空公司", "value": "3C" },
        { "name": "南非支线航空公司", "value": "4Z" },
        { "name": "河南", "value": "VD" },
        { "name": "东星", "value": "8C" },
        { "name": "轮航", "value": "LF" },
        { "name": "北方快线", "value": "70" },
        { "name": "英安", "value": "YI" },
        { "name": "勒奥斯航空", "value": "NO" },
        { "name": "巴哈马航空", "value": "UP" },
        { "name": "印尼连城航空", "value": "QG" },
        { "name": "宁静航空", "value": "ER" },
        { "name": "巴勒斯坦航空", "value": "PF" },
        { "name": "菲律宾皇家航空", "value": "RW" },
        { "name": "星宇航空", "value": "JX" },
        { "name": "荷瓦波拉航空", "value": "EO" },
        { "name": "香港快运航空", "value": "UO" },
        { "name": "秘鲁南美航空", "value": "LP" },
        { "name": "阿提哈德航空", "value": "EY" },
        { "name": "柬埔寨航空", "value": "KR" },
        { "name": "索萨航空公司", "value": "P4" },
        { "name": "太平洋海岸航空公司", "value": "8P" },
        { "name": "春秋航空日本", "value": "IJ" },
        { "name": "仰光航空", "value": "YH" },
        { "name": "嘎莫萨航空", "value": "K7" },
        { "name": "天才航空", "value": "F8" },
        { "name": "俄罗斯航空", "value": "SU" },
        { "name": "萨法航空", "value": "FA" },
        { "name": "地中海科西嘉航空", "value": "XK" },
        { "name": "芭缇克航空", "value": "ID" },
        { "name": "马尔代夫航空", "value": "Q2" },
        { "name": "台湾虎航", "value": "IT" },
        { "name": "风中玫瑰航空公司", "value": "7W" },
        { "name": "孟加拉优速航空", "value": "BS" },
        { "name": "马来西亚亚洲航空X", "value": "D7" },
        { "name": "曼谷航空", "value": "PG" },
        { "name": "卢森堡航空", "value": "LG" },
        { "name": "符拉迪沃斯托克航空", "value": "XF" },
        { "name": "毛里塔尼亚航空", "value": "MR" },
        { "name": "爱尔兰航空", "value": "EI" },
        { "name": "德威航空", "value": "TW" },
        { "name": "雅库航空", "value": "R3" },
        { "name": "阿拉伯航空", "value": "G9" },
        { "name": "安塞特航空", "value": "WX" },
        { "name": "天马航空", "value": "PC" },
        { "name": "黑泽尔顿航空公司", "value": "ZL" },
        { "name": "津巴布韦航空", "value": "UM" },
        { "name": "夏威夷航", "value": "HA" },
        { "name": "哥斯达尼加航", "value": "LR" },
        { "name": "塔卡国际航空", "value": "TA" },
        { "name": "欧洲航空", "value": "UX" },
        { "name": "远东航空公司", "value": "EF" },
        { "name": "阿斯塔纳航空", "value": "KC" },
        { "name": "摩洛哥皇家航空", "value": "AT" },
        { "name": "阿根廷航空", "value": "AR" },
        { "name": "美国捷蓝航空", "value": "B6" },
        { "name": "大陆航空", "value": "CO" },
        { "name": "文莱王家航空", "value": "BI" },
        { "name": "科姆航空", "value": "MN" },
        { "name": "菲律宾航空", "value": "PR" },
        { "name": "土耳其航空", "value": "TK" },
        { "name": "维珍大西洋航空公司", "value": "VS" },
        { "name": "以色列航空", "value": "LY" },
        { "name": "巴基斯坦国际航空", "value": "PK" },
        { "name": "加拿大航空", "value": "AC" },
        { "name": "波兰航空公司", "value": "LO" },
        { "name": "中华航空", "value": "CI" },
        { "name": "日航", "value": "JL" },
        { "name": "阿拉斯加航空", "value": "AS" },
        { "name": "西班牙航空", "value": "IB" },
        { "name": "国泰航空", "value": "CX" },
        { "name": "埃及航空", "value": "MS" },
        { "name": "新西兰航空", "value": "NZ" },
        { "name": "天空航", "value": "H2" },
        { "name": "塞浦路斯航", "value": "CY" },
        { "name": "科威特航空", "value": "KU" },
        { "name": "匈牙利航空", "value": "MA" },
        { "name": "乌兹别克斯坦航空公司", "value": "HY" },
        { "name": "俄罗斯国家航空公司", "value": "FV" },
        { "name": "西方喷气航空", "value": "WS" },
        { "name": "乌克兰航空公司", "value": "VV" },
        { "name": "爱琴海航空", "value": "A3" },
        { "name": "马汉航空", "value": "W5" },
        { "name": "亚洲捷星航空", "value": "3K" },
        { "name": "马亚航", "value": "MW" },
        { "name": "约旦王航", "value": "RJ" },
        { "name": "卡拉博博航空", "value": "R7" },
        { "name": "澳洲捷星航空", "value": "JQ" },
        { "name": "西伯航", "value": "S7" },
        { "name": "阿曼航空", "value": "WY" },
        { "name": "厄军运航", "value": "EQ" },
        { "name": "阳光之乡航空", "value": "SY" },
        { "name": "中东航空", "value": "ME" },
        { "name": "马印航空", "value": "OD" },
        { "name": "古巴统一航空", "value": "CU" },
        { "name": "伊尔航空", "value": "IO" },
        { "name": "阿斯特航空", "value": "OB" },
        { "name": "基维航空", "value": "KP" },
        { "name": "蓝鹰航空", "value": "ZI" },
        { "name": "斯威士兰皇家航空", "value": "ZC" },
        { "name": "巴西戈尔航空", "value": "G3" },
        { "name": "吉尔吉斯斯坦航空", "value": "K2" },
        { "name": "阿苏尔航空", "value": "AD" },
        { "name": "柏林航空", "value": "AB" },
        { "name": "南斯拉夫航", "value": "JU" },
        { "name": "突尼斯航空", "value": "TU" },
        { "name": "空中巴士航空公司", "value": "SX" },
        { "name": "SATO", "value": "XD" },
        { "name": "自由航空", "value": "SJ" },
        { "name": "子午线航空公司", "value": "IG" },
        { "name": "挪威航空", "value": "DY" },
        { "name": "乌克兰航空", "value": "PS" },
        { "name": "克罗地亚航空公司", "value": "OU" },
        { "name": "纳米比亚航空", "value": "SW" },
        { "name": "泰国东方航空", "value": "OX" },
        { "name": "梅萨航空公司", "value": "YV" },
        { "name": "大溪地航空公司", "value": "TN" },
        { "name": "美国西南", "value": "WN" },
        { "name": "澳大利亚维珍航空", "value": "VA" },
        { "name": "也门航空", "value": "IY" },
        { "name": "莫桑比克航空公司", "value": "TM" },
        { "name": "优梯航空", "value": "UT" },
        { "name": "坦桑尼亚精密航空公司", "value": "PW" },
        { "name": "韩国真航空公司", "value": "LJ" },
        { "name": "济州航空", "value": "7C" },
        { "name": "白鹰航空", "value": "W2" },
        { "name": "哥伦比亚航空", "value": "AV" },
        { "name": "维珍美国航空公司", "value": "VX" },
        { "name": "巴拿马航空", "value": "CM" },
        { "name": "康多尔航空公司", "value": "DE" },
        { "name": "英国易捷航空公司", "value": "U2" },
        { "name": "马耳他航空公司", "value": "KM" },
        { "name": "捷克航空", "value": "OK" },
        { "name": "亚得里亚航空公司", "value": "JP" },
        { "name": "西印度航空", "value": "BW" },
        { "name": "太平洋航空", "value": "FJ" },
        { "name": "远东航空", "value": "FE" },
        { "name": "菲龙航空", "value": "Z2" },
        { "name": "伊朗航空", "value": "IR" },
        { "name": "柬埔寨吴哥窟航空公司", "value": "K6" },
        { "name": "瑞士国际航空公司", "value": "LX" },
        { "name": "苏里南航空公司", "value": "PY" },
        { "name": "加勒比航空公司", "value": "TX" },
        { "name": "智利国家航空公司", "value": "LA" },
        { "name": "太阳快捷航空", "value": "XQ" },
        { "name": "斯潘航", "value": "JK" },
        { "name": "合众国航", "value": "US" },
        { "name": "精神航空", "value": "NK" },
        { "name": "阿尔及利亚航空", "value": "AH" },
        { "name": "葡萄牙航空", "value": "TP" },
        { "name": "越南越捷航空", "value": "VJ" },
        { "name": "智能翼航空", "value": "QS" },
        { "name": "万那杜航空", "value": "NF" },
        { "name": "亚马尔航空", "value": "YC" },
        { "name": "哈恩航空系统", "value": "H1" },
        { "name": "坦桑尼亚航空", "value": "TC" },
        { "name": "新几内亚航空", "value": "CG" },
        { "name": "北风航空", "value": "N4" },
        { "name": "施莱纳航空", "value": "AW" },
        { "name": "阿根廷LAN航空", "value": "4M" },
        { "name": "俄罗斯北方航空公司", "value": "5N" },
        { "name": "玻利维亚航空", "value": "Z8" },
        { "name": "格陵兰航空", "value": "GL" },
        { "name": "Volaris", "value": "Y4" },
        { "name": "欧洲之翼", "value": "EW" },
        { "name": "边疆航空", "value": "F9" },
        { "name": "亚航", "value": "XJ" },
        { "name": "印度尼西亚亚洲航空", "value": "QZ" },
        { "name": "荷兰泛航", "value": "HV" },
        { "name": "瓦尔纳国际航空公司", "value": "VL" },
        { "name": "萨拉托夫航空公司", "value": "6W" },
        { "name": "科西嘉国际航空", "value": "SS" },
        { "name": "塞内加尔航空", "value": "V7" },
        { "name": "委内瑞拉航空", "value": "S3" },
        { "name": "马尼托巴", "value": "7N" },
        { "name": "狮航", "value": "SL" },
        { "name": "纳斯航空", "value": "XY" },
        { "name": "贝克航空", "value": "Z9" },
        { "name": "乌拉圭航空", "value": "PU" },
        { "name": "喜马拉雅航空", "value": "H9" },
        { "name": "蓝色航空", "value": "0B" },
        { "name": "伊拉克航空", "value": "IA" },
        { "name": "赞比亚先锋航空", "value": "P0" },
        { "name": "米德兰航空巴比分公司", "value": "WW" },
        { "name": "印度香料航空", "value": "SG" },
        { "name": "秘鲁航空", "value": "2I" },
        { "name": "奥林匹克航空", "value": "OA" },
        { "name": "卡姆航空", "value": "RQ" },
        { "name": "塔吉克航空", "value": "7J" },
        { "name": "土库曼斯坦航空公司", "value": "T5" },
        { "name": "奥斯特拉尔航空", "value": "UU" },
        { "name": "黑山航空", "value": "YM" },
        { "name": "ONEJET/ONE JET, INC", "value": "J1" },
        { "name": "柬埔寨景成国际航空", "value": "QD" },
        { "name": "斯奇发动机公司", "value": "M9" },
        { "name": "俄罗斯Severstal", "value": "D2" },
        { "name": "阿特拉斯喷气航空", "value": "KK" },
        { "name": "塞塔国际航空", "value": "S4" },
        { "name": "跨大西洋航空", "value": "TS" },
        { "name": "俄罗斯北方之星航空公司", "value": "Y7" },
        { "name": "卢旺达航空", "value": "WB" },
        { "name": "哈恩航空", "value": "HR" },
        { "name": "易斯达", "value": "ZE" },
        { "name": "墨西哥航空", "value": "4O" },
        { "name": "澳洲虎航", "value": "TT" },
        { "name": "冰岛航空", "value": "LI" },
        { "name": "爱维尔航空公司", "value": "9V" },
        { "name": "英特爱兰航空", "value": "JY" },
        { "name": "秘鲁LC航空", "value": "W4" },
        { "name": "厄瓜多尔航空", "value": "XL" },
        { "name": "斯开特航空", "value": "DV" },
        { "name": "开曼航空", "value": "KX" },
        { "name": "利比亚航空", "value": "LN" },
        { "name": "巴西AviancaBrasil", "value": "O6" },
        { "name": "联合王国航空公司", "value": "UK" },
        { "name": "沙欣航空", "value": "NL" },
        { "name": "吉尔吉斯斯坦玛纳斯航空", "value": "ZM" },
        { "name": "因特维亚", "value": "ZA" },
        { "name": "芒果航空", "value": "JE" },
        { "name": "半岛航空公司", "value": "J9" },
        { "name": "匈牙利维兹航空", "value": "W6" },
        { "name": "爱尔兰瑞安航空公司", "value": "FR" },
        { "name": "南方快运LLC航空", "value": "9X" },
        { "name": "迪拜航空", "value": "FZ" },
        { "name": "空中穿越航空", "value": "NP" },
        { "name": "丽晶航空", "value": "RX" },
        { "name": "亚洲航空公司", "value": "AK" },
        { "name": "帕拉奥穿越太平洋航空公司", "value": "GP" },
        { "name": "高空航空公司", "value": "GQ" },
        { "name": "大溪地航空", "value": "VT" },
        { "name": "印尼狮子航空", "value": "JT" },
        { "name": "蓝色航空公司", "value": "PA" },
        { "name": "比利时捷特航空", "value": "TB" },
        { "name": "沃奥航空", "value": "OW" },
        { "name": "吉米尼货运航空公司", "value": "GR" },
        { "name": "多莫杰多沃航空", "value": "E3" },
        { "name": "诺克航空", "value": "DD" },
        { "name": "澜湄航空", "value": "LQ" },
        { "name": "威德罗航空", "value": "WF" },
        { "name": "皇家航空", "value": "KB" },
        { "name": "格鲁吉亚航空公司", "value": "A9" },
        { "name": "劳埃德航空", "value": "HF" },
        { "name": "文塔吉航空", "value": "VQ" },
        { "name": "百善航空", "value": "5B" },
        { "name": "苏丹航空公司", "value": "SE" },
        { "name": "酷鸟航空", "value": "XW" },
        { "name": "老挝民营航空", "value": "LK" },
        { "name": "阿波里基诺航空", "value": "I8" },
        { "name": "LaCompagnie", "value": "BO" },
        { "name": "日本捷星航空", "value": "GK" },
        { "name": "捷途航空", "value": "LS" },
        { "name": "印地高航空", "value": "6E" },
        { "name": "亚航", "value": "XT" },
        { "name": "印度亚航", "value": "I5" },
        { "name": "阿里道尼航空", "value": "D4" },
        { "name": "湾流国际航空公司", "value": "3M" },
        { "name": "波拉货运航空", "value": "PO" },
        { "name": "提拉维姆什尼航空公司", "value": "L6" },
        { "name": "俄线航", "value": "7R" },
        { "name": "香草航空", "value": "JW" },
        { "name": "彼尔姆航空公司", "value": "P9" },
        { "name": "布基纳航空", "value": "2J" },
        { "name": "加拿大波特航空公司", "value": "PD" },
        { "name": "索德尔航空公司", "value": "OY" },
        { "name": "向风群岛航空", "value": "WM" },
        { "name": "以斯雷航空", "value": "6H" },
        { "name": "日耳曼尼亚航空", "value": "ST" },
        { "name": "中部航空", "value": "BM" },
        { "name": "胜利航空", "value": "DP" },
        { "name": "美国动力航空", "value": "2D" },
        { "name": "维尔姆航空", "value": "VG" },
        { "name": "牙买加航空", "value": "OJ" },
        { "name": "巴戎航空", "value": "BD" },
        { "name": "乐桃航空", "value": "MM" },
        { "name": "利奈尔航空", "value": "A5" },
        { "name": "环爱尔兰航空", "value": "T7" },
        { "name": "布鲁塞尔航空", "value": "SN" },
        { "name": "暹罗航空", "value": "O8" },
        { "name": "塔吉克斯坦索蒙航空公司", "value": "SZ" },
        { "name": "老挝航空", "value": "QV" },
        { "name": "摩尔多瓦航", "value": "9U" },
        { "name": "安哥拉航空", "value": "DT" },
        { "name": "伏林航空", "value": "VY" },
        { "name": "阿里克航空", "value": "W3" },
        { "name": "塞舌尔航空公司", "value": "HM" },
        { "name": "弗莱比航空", "value": "BE" },
        { "name": "罗马尼亚航空", "value": "RO" },
        { "name": "瑞士F7航空", "value": "F7" },
        { "name": "喀里多尼亚航空", "value": "SB" },
        { "name": "新加坡航", "value": "J8" },
        { "name": "釜山航", "value": "BX" },
        { "name": "菲律宾航空", "value": "2P" },
        { "name": "沙特阿拉伯SV航空", "value": "SV" },
        { "name": "阿塞拜疆航空", "value": "J2" },
        { "name": "天马航", "value": "JJ" },
        { "name": "马达加斯加航空", "value": "MD" },
        { "name": "太平洋宿务航空公司", "value": "5J" },
        { "name": "泰国亚洲航空公司", "value": "FD" },
        { "name": "华信航空", "value": "AE" },
        { "name": "埃塞阿比亚航空", "value": "ET" },
        { "name": "巴西航空", "value": "RG" },
        { "name": "波兹瓦纳航空", "value": "BP" },
        { "name": "多洛米蒂航空", "value": "EN" },
        { "name": "立荣航空", "value": "B7" },
        { "name": "贝尔韦尤航空", "value": "B3" },
        { "name": "巴伐利亚航空", "value": "BV" },
        { "name": "中国捷星航空", "value": "BL" },
        { "name": "加拿大老鹰航空", "value": "BH" },
        { "name": "阿联酋国际航空", "value": "EK" },
        { "name": "印度航空", "value": "AI" },
        { "name": "意航", "value": "AZ" },
        { "name": "芬航", "value": "AY" },
        { "name": "英航", "value": "BA" },
        { "name": "法航", "value": "AF" },
        { "name": "港龙", "value": "KA" },
        { "name": "印度捷特航空公司", "value": "9W" },
        { "name": "冰岛航空", "value": "FI" },
        { "name": "白俄罗斯航空公司", "value": "B2" },
        { "name": "越南航空", "value": "VN" },
        { "name": "美联航", "value": "UA" },
        { "name": "泰航", "value": "TG" },
        { "name": "北欧", "value": "SK" },
        { "name": "新航", "value": "SQ" },
        { "name": "大韩", "value": "KE" },
        { "name": "韩亚", "value": "OZ" },
        { "name": "澳洲航空", "value": "QF" },
        { "name": "奥地利航空", "value": "OS" },
        { "name": "澳门航空", "value": "NX" },
        { "name": "美西北", "value": "NW" },
        { "name": "全日空", "value": "NH" },
        { "name": "马航", "value": "MH" },
        { "name": "汉莎", "value": "LH" },
        { "name": "荷航", "value": "KL" },
        { "name": "波罗的海航空", "value": "BT" },
        { "name": "孟加拉航空", "value": "BG" },
        { "name": "墨西哥航空公司", "value": "AM" },
        { "name": "美国航空", "value": "AA" },
        { "name": "朝鲜航空", "value": "JS" },
        { "name": "南非航空", "value": "SA" },
        { "name": "卡塔尔航空", "value": "QR" },
        { "name": "胜安航空", "value": "MI" },
        { "name": "长荣航空公司", "value": "BR" },
        { "name": "蒙古航空", "value": "OM" },
        { "name": "印度尼西亚航空", "value": "GA" },
        { "name": "肯尼亚航空", "value": "KQ" },
        { "name": "香港航空", "value": "HX" },
        { "name": "达美航空", "value": "DL" },
        { "name": "复兴航空", "value": "GE" },
        { "name": "斯里兰卡航空", "value": "UL" },
        { "name": "佛得角航空", "value": "VR" },
        { "name": "大西洋航空", "value": "RC" },
        { "name": "利比亚泛非航空", "value": "8U" },
        { "name": "保加利亚航空", "value": "FB" },
        { "name": "尼泊尔航空", "value": "RA" },
        { "name": "泰国微笑航空", "value": "WE" },
        { "name": "缅甸航空", "value": "UB" },
        { "name": "以色列航空", "value": "IZ" },
        { "name": "哈林航空", "value": "HZ" },
        { "name": "环空航空", "value": "UN" },
        { "name": "乌拉尔航空公司", "value": "U6" },
        { "name": "毛里求斯航空公司", "value": "MK" },
        { "name": "新几内亚航空", "value": "PX" },
        { "name": "德翼航空", "value": "4U" },
        { "name": "海湾航空公司", "value": "GF" },
    ]
    var val = ""
    dataList.forEach((item, index) => {
        if (e == item.value) {
            val = item.value + "-" + item.name
        }
    })
    return val;
}
// JS 计算两个时间戳相差年月日时分
function calculateDiffTime(beginTime, endTime) {
    var start = Date.parse(new Date(beginTime));
    var end = Date.parse(new Date(endTime));
    // 两个时间戳相差的毫秒数
    var time = end - start;
    // 计算相差的天数
    var day = Math.floor(time / (24 * 3600 * 1000));
    // 计算天数后剩余的毫秒数
    var msec = time % (24 * 3600 * 1000);
    // 计算出小时数
    var hour = Math.floor(msec / (3600 * 1000));
    // 计算小时数后剩余的毫秒数
    var msec2 = msec % (3600 * 1000);
    // 计算相差分钟数
    var minute = Math.floor(msec2 / (60 * 1000));

    return day;
}
