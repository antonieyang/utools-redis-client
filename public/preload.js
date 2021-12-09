var redis = require('redis');
utools.onPluginReady(() => {

})

var currentClint = "";
window.newServer = function() {
    (async() => {
        const { value: formValues } = await Swal.fire({
            title: 'REDIS服务器',
            html: addServerHtml,
            focusConfirm: false,
            confirmButtonText: '增加服务器',
            preConfirm: () => {
                return [
                    document.getElementById('host').value,
                    document.getElementById('port').value,
                    document.getElementById('user').value,
                    document.getElementById('password').value
                ]
            }
        })

        if (formValues) {
            // connect(formValues[0],parseInt(formValues[1]),formValues[2],formValues[3]);
            if (!servers) {
                servers = {
                    _id: "servers",
                    data: {}
                }
            }
            var name = `${formValues[0]}:${formValues[1]}`;
            if (servers.data[name]) {
                Swal.fire("已存在同名服务器");
                return;
            }

            if (!formValues[0] || !formValues[1]) {
                Swal.fire("新增失败", "服务器和端口号不能为空", "warning");
                return;
            }
            servers.data[name] = { "server": formValues[0], "port": parseInt(formValues[1]), "user": formValues[2], "password": formValues[3] };
            utools.db.put(servers);
            appendServer(name);
        }
    })();
}

window.appendServer = function(key) {
    $(".serverList").append("<span class='server' name='" + key + "'><img src='./images/server.png' class='conStatus'><span class='serverSpan' >" + key + "</span>" +
        "<span aria-label='连接服务器' class='img-circle status-icon hint--bottom-left'><img src='./images/connect.png' class='conImg'></span>" +
        "<span aria-label='删除服务器' class='img-circle status-icon hint--bottom-left'><img src='./images/delete.png' class='delImg'></span><div class='dbList'></div></span>");
}
var client;
var isConnecting = false;
window.connect = function(server, port, user, password) {

    (async() => {
        if (isConnecting) {
            return;
        }
        isConnecting = true;
        var name = `${server}:${port}`;
        var tServer = $(".server[name='" + name + "']");
        client = redis.createClient({
            url: `redis://${user}:${password}@${server}:${port}`
        });

        client.on('ready', function(res) {});

        client.on('end', function(err) {
            swal.fire(`${name}连接关闭`);
            connClosed(tServer);
        });

        client.on('error', async function(err) {
            swal.fire(`${name}连接失败`, err.message, "error");
            connClosed(tServer);
            try {
                await client.quit();
            } catch (error) {
                console.log(error);
            }

        });

        client.on('connect', function() {
            swal.fire(`${name}连接成功`);
            tServer.children(".conStatus").attr("src", "./images/con-server.png");
            tServer.find(".conImg").attr("class", "disImg").attr("src", "./images/disconnect.png").parent().attr("aria-label", "断开连接");
            $(".conImg").attr("class", "disableCon").attr("src", "./images/disable.png").parent().attr("aria-label", "");
            tServer.children(".serverSpan").css("color", "#1afa29");
            $("#exec").removeAttr("disabled");
            loadDb(name);
            // quitSubClient();

        });
        tServer.find(".conImg").attr("src", "./images/loading.gif");
        await client.connect();
        currentClint = name;
    })();
}

window.connClosed = function(tServer) {
        tServer.children(".conStatus").attr("src", "./images/server.png");
        tServer.find(".disImg").attr("class", "conImg");
        $(".disableCon").attr("class", "conImg");
        $(".conImg").attr("src", "./images/connect.png").parent().attr("aria-label", "连接服务器");
        tServer.children(".serverSpan").css("color", "");
        isConnecting = false;
        $(".db").remove();
        $("#exec").attr("disabled", "disabled");
    }
    // window.quitSubClient = function() {
    //     (async() => {
    //         if (subscriber) {
    //             await subscriber.quit();
    //             subscriber = null;
    //         }
    //     })();
    // }

window.loadDb = function(name) {
    (async() => {
        $(".db").remove();
        var dbList = $(".server[name='" + name + "']").find(".dbList");
        var dbs = await client.configGet("databases")
        var keys = await client.info("keyspace")
        if (dbs) {
            var count = parseInt(dbs.databases);
            var keyArr = keys.split("\n");
            var keyObj = new Object();
            for (var i = 1; i < keyArr.length; i++) {
                var temp = keyArr[i];
                if (!temp)
                    continue;
                var db = temp.split(":")[0].substring(2);
                var keyCount = ((temp.split(":")[1]).split(",")[0]).split("=")[1];
                keyObj[db] = keyCount;
            }
            for (var i = 0; i < count; i++) {
                var tcount = keyObj[i + ""];
                dbList.append("<span class='db' ><img src='./images/db.png' class='dbStatus'><span aria-label='选中数据库'  class='hint--right dbSpan " + (i == 0 ? "dbSpanSel" : "") + "' name='" + i + "' >db" + i + " (" + (tcount != undefined ? tcount : 0) + ")" + "</span></span>");
            }
        }
    })();
}

window.selectDb = function(db) {
    (async() => {
        await client.select(parseInt(db));
        $(".content").empty();
    })();
}

var subscriber;
var tchannel;
var subClinetName = "";
window.exec = async function(op, valArr) {
    var value;
    switch (op) {
        case "get":
            await client.get(valArr[0]).then(data => { setResult(data) }).catch(err => { setError(err) });
            break;
        case "set":
            await client.set(valArr[0], valArr[1]).then(data => { setResult(data) }).catch(err => { setError(err) });
            break;
        case "del":
            await client.del(valArr[0]).then(data => { setResult(data) }).catch(err => { setError(err) });
            break;
        case "hset":
            await client.hSet(valArr[0], valArr[1], valArr[2]).then(data => { setResult(data) }).catch(err => { setError(err) });
            break;
        case "hget":
            await client.hGet(valArr[0], valArr[1]).then(data => { setResult(data) }).catch(err => { setError(err) });
            break;
        case "hgetall":
            await client.hGetAll(valArr[0]).then(data => { setResult(data) }).catch(err => { setError(err) });
            break;
        case "cmd":
            if (valArr[0].indexOf("ubscribe") != -1) {
                Swal.fire("订阅信息请选择'订阅频道'操作");
                break;
            }
            const cmd = valArr[0].trim().split(/\s+/);
            await client.sendCommand(cmd).then(data => { setResult(data) }).catch(err => { setError(err) });
            break;
        case "pub":
            await client.publish(valArr[0].trim(), valArr[1].trim()).then(data => { setResult(data) }).catch(err => { setError(err) });
            break;
        case "sub":
            if (subClinetName != currentClint || !subscriber) {
                subscriber = client.duplicate();
                await subscriber.connect();
                subClinetName = currentClint;
            }

            tchannel = valArr[0];
            $(".content").empty();
            await subscriber.pSubscribe(tchannel, (message, channel) => {
                $(".content").prepend("<div class='line'>" + channel + "<pre>" + message + "</pre></div>");
            });
            $("#unsub").show();
            break;
        case "unsub":
            await subscriber.pUnsubscribe(tchannel).then(data => {
                $("#exec").removeAttr("disabled");
                $("#unsub").hide();
            }).catch(err => {
                Swal.fire(err.message);
            });

            break;
    }

}

window.setResult = function(result) {
    $(".content").html("<textarea class='jsontext'>" + JSON.stringify(result, null, 4) + "</textarea>");
}

window.setError = function(result) {
    $(".content").html(`<font class='errInfo'>${result.message}</font>`)
}
window.disconnect = async function() {
    if (client) {
        if ($("#unsub").is(':visible')) {
            await exec("unsub");
        }
        $("#exec").attr("disabled", "disabled");
        console.log("dis")
        $(".content").empty();
        await client.quit();
    }
}