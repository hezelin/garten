/**
 * @description 公用模块
 */

/**
 * @param {Number}
 * @param {Number} 
 */
function fnSetSubpageStyle(Top, Bottom) {
	return {
		top: fnPx2Rem(Top, true),
		bottom: fnPx2Rem(Bottom, true),
//		render: "always",
		scrollIndicator: "none",
		hardwareAccelerated: true
//		render: ""		
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
 */
function fnLoadPage(tapBtn, obj, objPost) {
	if (tapBtn.classList.contains("loading")) {
		return;
	}
	tapBtn.classList.add("loading");
	var webviewHead = plus.webview.getWebviewById("webview-header");
	var oldview = webviewHead.children();
	for (var i = 0; i < oldview.length; i++) {
		mui.fire(webviewHead, "initHeadPage");
		webviewHead.remove(oldview[i]);
		oldview[i].close();
	}
	//设置窗口按键
	mui.fire(webviewHead, "setHeadPage", objPost);
	webviewHead.show("slide-in-right", "", function() {
		tapBtn.classList.remove("loading");
	});
	var webviewBody = plus.webview.create(obj.url, obj.url, fnSetSubpageStyle(obj.top, obj.bottom));
	webviewBody.onloaded = function() {
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
	var newTime = new Date().getTime().toString();
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
 */
function openLogin() {
	var loginView = plus.webview.create("login/login.html", "login.html", {});
	loginView.onloaded = function() {
		loginView.show("slide-in-right");
	}
}