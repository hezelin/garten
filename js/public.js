/**
 * @description 窗口style设置，默认开启硬件加速，去除滑动条，关闭侧滑（ios
 * @param {Number}
 * @param {Number} 
 */
function fnSetSubpageStyle(Top, Bottom, scale) {
	return {
		top: fnPx2Rem(Top, true),
		bottom: fnPx2Rem(Bottom, true),
		render: "always",
		popGesture: "none",
		scalable: scale ? true : false,
		hardwareAccelerated: true
			//		scrollIndicator: "none"
	}
};

/**
 * 
 * @param {Number} pxNum
 * @param {Boolean} userDpr 使用逻辑像素,默认不使用
 */
function fnPx2Rem(pxNum, userDpr) {
	var baseFontSize = parseInt(document.getElementsByTagName('html')[0].style.fontSize);
	var dpr = userDpr ? fnGetDpr() : 1;
	return pxNum / dpr / 75 * baseFontSize + "px";
}

/**
 * @description 获取屏幕dpr值
 */
function fnGetDpr() {
	return parseInt(document.getElementsByTagName('html')[0].getAttribute("data-dpr"));
}

/**
 * @description 利用公用父模板加载子页面
 * @param {Object} 触发事件的按钮
 * @param {Object} 必须url top bottom
 * @param {Object} 必须title 非必须rightBtn hasControlTab
 * @param {Object} 额外参数,extra.func：字符串,触发子窗口函数的函数名;extra.detail：对象，保存额外值传递给子窗口的目标函数()
 */
function fnLoadPage(tapBtn, obj, objPost, extra) {
	var targetBtn = true;
	if (tapBtn == "none") {
		targetBtn = false;
	}
	if (targetBtn && tapBtn.classList.contains("loading")) {
		return;
	}
	targetBtn && tapBtn.classList.add("loading");
	var webviewHead = plus.webview.getWebviewById("webview-header");
	if (!!obj.refresh) {
		mui.fire(webviewHead, "reloadTemplate", {});
	}
	mui.fire(webviewHead, "setHeadPage", objPost);
	var oldview = webviewHead.children();
	for (var i = 0; i < oldview.length; i++) {
		webviewHead.remove(oldview[i]);
		oldview[i].close();
	}
	webviewHead.show("pop-in", 300, function() {
		targetBtn && tapBtn.classList.remove("loading");
	});
	var webviewBody = plus.webview.create(obj.url, obj.url, fnSetSubpageStyle(obj.top, obj.bottom));
	webviewBody.onloaded = function() {
		if (typeof extra !== "undefined") {
			mui.fire(this, extra.func, extra.detail);
		}
		setTimeout(function() {
			webviewHead.append(webviewBody);
		}, 100);
	}
}

/**
 * @description 切换元素display or none状态
 */
function fnToggleElemDisplay(elem) {
	if (!elem) {
		return false;
	}
	if (elem.style.display == "none") {
		elem.style.display = "block";
	} else {
		elem.style.display = "none";
		elem.classList.remove("mutual-shade-active");
	}
}

/**
 * @description 添加删除元素的类
 */
function fnToggleElemClass(elem, elemClass) {
	if (!elem) {
		return false;
	}
	if (elem.classList.contains(elemClass)) {
		elem.classList.remove(elemClass);
	} else {
		elem.classList.add(elemClass);
	}
}

/**
 * @description 创建并打开遮罩蒙版，并返回遮罩节点
 */
function fnOpenShade() {
	var _shade = document.createElement("div");
	_shade.setAttribute("id", "my-setting-shade");
	_shade.setAttribute("class", "mutual-shade");
	fnToggleElemClass(_shade, "mutual-shade-active");
	document.querySelector("body").appendChild(_shade);
	return _shade;
}

/**
 * @description 关闭遮罩及div
 */
function fnCloseShade(_id) {
	//点击遮罩，将遮罩关闭，然后延迟200ms关闭弹出div，后移除遮罩
	var _shade = document.querySelector("#my-setting-shade");
	if (!_shade) {
		return;
	}
	var _targetDiv = document.querySelector(_id);
	var _body = document.querySelector("body");
	fnToggleElemClass(_shade, "mutual-shade-active");

	function closeShade() {
		fnToggleElemClass(_targetDiv, "mutual-div-active");
		_body.removeChild(_shade);
	}
	if (_targetDiv) {
		clearInterval(_targetDiv.delayClose);
		_targetDiv.delayClose = setTimeout(closeShade, 200);
	}
}

/**
 * @description 这个方法使用动画打开一个带遮罩的目标div块
 * @param {String} _id 目标div块的id，目标div块还要有mutual-div类
 */
function fnOpenTargetDiv(_id) {
	var _shade = fnOpenShade();
	fnToggleElemClass(document.querySelector(_id), "mutual-div-active");
	//为遮罩注册关闭事件，遮罩是动态创建的，不存在重复注册事件的情况
	_shade.addEventListener("tap", function() {
		fnCloseShade(_id);
	});
}

/**
 * @description 检查用户登录状态,有效期七天
 */
function userLoginStatus() {
	var result = false;
	var tokenValue = plus.storage.getItem("tokenValue");
	var tokenDate = plus.storage.getItem("tokenDate");
	var newTime = new Date().getTime().toString().substring(0, 10);

	if (tokenValue == null || tokenDate == null) {
		result = false;
	} else {
		//先做有效期判断		
		if ((newTime - tokenDate) / 3600000 / 24 > 7) {
			result = false;
		} else {
			result = true;
		}
	}
	return result;
}

/**
 * @description 生成len位随机数
 * @param {Object} len
 */
function randomStr(len) {
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var maxPos = chars.length;
	var result = "";
	for (var i = 0; i < len; i++) {
		result += chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return result;
};

/**
 * @description 创建签名 
 */
function fnCreateSign() {
	var time = (Date.parse(new Date())).toString().substring(0, 10); //不带后3位毫秒的时间戳,共10位
	var salt = "5YM7r9f8zJVWqmsb";
	var nonce = randomStr(Math.random() * 10 + 6);
	var signature = md5(time + nonce + salt);
	//生成6~16位的随机字符串，len  值为math.random()*10+6
	return "signature=" + signature + "&nonce=" + nonce + "&timestamp=" + time;
};

/**
 * @description 验证码倒计时，所有有验证码获取的页面都可以用，页面启动时执行一次timew.start()，成功申请验证码时执行一次。本地储存的两个字段也是公用的，防止恶意刷短信
 */
var timew = {
	btn: function() {
		return document.querySelector("#getAuthCode");
	},
	start: function() {
		//验证码重复获取时间120秒
		var overTime = 120;
		var startTime = plus.storage.getItem("authCodeTime");
		var nowTime = new Date().getTime().toString();
		var residueTime = parseInt((nowTime - startTime) / 1000);
		if (residueTime > overTime) {
			this.end();
		} else {
			if (!this.btn().classList.contains("reSendAuthCode")) {
				this.btn().classList.add("reSendAuthCode");
			}
			this.process(overTime - residueTime);
		}
	},
	process: function(residueTime) {
		this.timeSet = window.setInterval(function(obj) {
			if (residueTime <= 0) {
				obj.end();
			} else {
				residueTime--;
				obj.btn().innerHTML = "重新获取&nbsp;" + residueTime;
			}
		}, 1000, this);
	},
	end: function() {
		//恢复按钮状态
		if (this.btn().classList.contains("reSendAuthCode")) {
			this.btn().classList.remove("reSendAuthCode");
		}
		this.btn().innerHTML = "获取验证码";
		if (typeof this.timeSet === "number") {
			window.clearInterval(this.timeSet);
		}
	}
};

/**
 * @description 打开登录页
 * @param {Object} 按钮
 */
function openLogin(btn) {
	if (btn.getAttribute("data-able") != null) {
		return;
	}
	btn.setAttribute("data-able", "unable");
	var loginView = plus.webview.create("login/login.html", "login.html");
	loginView.onloaded = function() {
		loginView.show("pop-in", 300);
		setTimeout(function() {
			btn.removeAttribute("data-able");
		}, 300);
	}
}

/**
 * @description 打开webview，用截图显示来增加流畅度
 * @param {Object} 当前窗口对象
 * @param {String} 要打开的窗口地址
 * @param {Object} 附加信息
 */
function showWebviewCOM(currentView, newViewURL, extra) {
	var bitmap1 = null,
		bitmap2 = null;
	bitmap1 = new plus.nativeObj.Bitmap();
	//将当前窗口内容绘制到bitmap对象中
	currentView.draw(bitmap1, function() {
		console.log("bitmap1绘制图片成功");
	}, function(e) {
		console.log("bitmap1绘制图片失败" + JSON.stringify(e));
	});
	var newView = plus.webview.create(newViewURL, newViewURL, {
		hardwareAccelerated: true
	});
	newView.addEventListener("loaded", function() {
		mui.fire(newView, extra.func, extra.detail);
		bitmap2 = new plus.nativeObj.Bitmap();
		newView.draw(bitmap2, function() {
			console.log("bitmap2截图成功");
		}, function(e) {
			console.log("bitmap1截图失败" + JSON.stringify(e));
		});
		newView.show("pop-in", 300, function() {
			bitmap1.clear();
			bitmap2.clear();
		}, {
			//执行图片
			capture: bitmap2,
			//关联图片
			otherCapture: bitmap1
		});
	});
}

/**
 * @description 检查网络状况
 */
function NetWorkStatus() {
	if (!mui.os.plus) {
		return;
	}
	//	mui.plusReady()
	var val = plus.networkinfo.getCurrentType();
	// 0表示网络连接状态未知，1表示网络无连接
	if (val == 0 || val == 1) {
		mui.toast("网络不稳定,请检查您当前的网络环境", 8000);
		return true;
	} else {
		return false;
	}
}

/**
 * @description 设置头像
 */
function defaultImg(elemID, URL) {
	if (!userLoginStatus()) {
		document.getElementById(elemID).src = URL;
		return;
	}
	if (mui.os.plus) {
		plus.io.resolveLocalFileSystemURL("_doc/head.jpg", function(entry) {
			var s = entry.fullPath + "?version=" + new Date().getTime();;
			document.getElementById(elemID).src = s;
		}, function(e) {
			document.getElementById(elemID).src = URL;
		})
	} else {
		document.getElementById(elemID).src = URL;
	}
}

function deleteIMG() {
	plus.io.resolveLocalFileSystemURL("_doc/", function(root) {
		root.getFile("head.jpg", {
			create: false
		}, function(file) {
			file.remove(function() {
				console.log("头像文件删除成功");
			}, function() {
				console.log("delete image fail:" + e.message);
			});
		}, function() {
			console.log("没有，头像文件，退出");
		});
	}, function(e) {
		console.log("get _www folder fail");
	})
}

/**
 * @description ajax错误处理
 * @param {Object} xhr 
 */
function ajaxError(xhr) {
	try {
		console.log(JSON.stringify(xhr));
		var res = JSON.parse(xhr.response);
		if (typeof res.data.message !== "undefined") {
			mui.toast("出错：" + res.data.message);
		}
	} catch (e) {
		//		console.log("调试信息，更新信息失败，服务器错误");
		mui.toast("连接服务器失败");
	}
}

/**
 * @description 重写mui.toast事件，这里用动态生成节点的方法做在部分手机上无效，所以文档中需要有固定节点<div class="my-toast" id="myToast"><span class="my-toast-content"></span></div>
 * @param {String} message
 */
mui.toast = function(message) {
	var c = document.getElementById("myToast");
	if (!c) {
		return;
	}
	c.classList.add("my-toast-transform");
	c.getElementsByClassName("my-toast-content")[0].innerText = message;
	setTimeout(function() {
		c.classList.remove("my-toast-transform");
	}, 2000)
}

/**
 * @description 退出app
 */
function quitApp() {
	if (!first) {
		first = new Date().getTime();
		mui.toast('再按一次退出应用');
		setTimeout(function() {
			first = null;
		}, 2000);
	} else {
		if (new Date().getTime() - first < 2000) {
			plus.runtime.quit();
		}
	}
}

function time2date(time) {
	var date = new Date(parseInt(time) * 1000);
	var ctime = date.getFullYear() + "-" + fixZero(date.getMonth() + 1, 2) + "-" + fixZero(date.getDate(), 2) + " " + fixZero(date.getHours(), 2) + ":" + fixZero(date.getMinutes(), 2);
	return ctime;
}

function time2year(time) {
	var date = new Date(parseInt(time) * 1000);
	var ctime = date.getFullYear() + "-" + fixZero(date.getMonth() + 1, 2) + "-" + fixZero(date.getDate(), 2);
	return ctime;
}


function fixZero(num, length) {
	var str = "" + num;
	var len = str.length;
	var s = "";
	for (var i = length; i-- > len;) {
		s += "0";
	}
	return s + str;
}