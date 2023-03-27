// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log('收到来自content-script的消息：');
    // console.log(request.greeting)
    // console.log(request, sender, sendResponse);
    sendResponse('我是后台，我已收到你的消息：');
    $.ajax({
        url: "http://112.74.190.111/exprotWord",
        type: "post",
        dataType: "json",
        contentType: 'application/json;charset=utf-8',
        data: JSON.stringify(request.greeting),
        success: function (res) {
            console.log(res);  //在console中查看数据
            if (res.code == 200) {
                var urls = "http://112.74.190.111/file/" + res.data
                console.log(urls)
                var a = document.createElement('a');
                a.download = '';
                a.href = urls;
                $("body").append(a);  // 修复firefox中无法触发click
                a.click();
                $(a).remove();
            } else {
                alert("导出文档失败")
            }
        },
        error: function (err) {
            alert("导出文档失败")
            console.log(err)
            // var urls = "http://112.74.190.111/file/" + err.responseText
            // var a = document.createElement('a');
            // a.download = '';
            // a.href = urls;
            // $("body").append(a);  // 修复firefox中无法触发click
            // a.click();
            // $(a).remove();
        },
    });
});
