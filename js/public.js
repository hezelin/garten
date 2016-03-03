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
		render: "always",
		scrollIndicator: "none"
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
	//执行窗口初始化
	mui.fire(webviewHead, "initHeadPage", objPost);
	for (var i = 0; i < oldview.length; i++) {
		webviewHead.remove(oldview[i]);
	}
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
 * 
 */



if (window.plus) {
	plusReady();
} else {
	document.addEventListener("plusready", plusReady, false);
}

function plusReady() {
	plus.screen.lockOrientation("portrait-primary");
}