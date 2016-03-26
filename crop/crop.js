window.addEventListener("loadFileCrop", function(e) {
	if (typeof e.detail == "undefined") {
		return;
	}
	// 有url进来 e.detail.fileFullPath
	console.log(e.detail.fileFullPath);
	handleFiles(e.detail.fileFullPath);
});
window.addEventListener("saveCropAtCrop", function(e) {
	handIMG();
});
//添加图片，获取文件
var viewDiv = document.querySelector("#operateIMG");
var resDiv = document.querySelector("#resultIMG");
//var btnCutIMG = document.querySelector("#cutIMG");
var btnRange = document.getElementById("rangeScale");
var img = null;
var fileLoadBool = false;
//截取视口宽高比例,默认为1，正方形
var showWindowScale = 1;
//原图尺寸
var imgNaturalwidth = 0,
	imgNaturalheight = 0;
//oldToNewScaleW,oldToNewScaleH是原图转换后与新图的比例，用于从img截取图形区域到新画布的像素转换
//1例如 原图宽 / 新图宽 = 原图水平偏移 / 新图水平偏移
//2例如 原图宽 / 新图宽 = 原图截取图片宽度 / 新图截取图片宽度
var oldToNewScaleW = 0,
	oldToNewScaleH = 0;

// 移动图片代码
viewDiv.addEventListener("touchstart", function(event) {
	event.preventDefault();
	touchStartPosition(event);
});
viewDiv.addEventListener("touchmove", function(event) {
	event.preventDefault();
	touchMove(event);
});
viewDiv.addEventListener("touchend", function(event) {
	event.preventDefault();
	moving = false;

});
// 移动图片end
// 放大缩小图片
btnRange.addEventListener("change", function() {
	var elem = document.getElementById("imgShow");
	var val = this.value;
	// 初始图片大小， 用于缩放图片
	var initWidth = parseFloat(elem.getAttribute("data-width"));
	var initHeight = parseFloat(elem.getAttribute("data-height"));
	// 缩放前图片偏移量
	var oldTop = parseFloat(elem.style.top);
	var oldLeft = parseFloat(elem.style.left);
	// 缩放前图片大小
	var widthOld = parseFloat(elem.style.width);
	var heightOld = parseFloat(elem.style.height);
	// 缩放后的图片大小
	var newWidth = initWidth * val;
	var newHeight = initHeight * val;
	// 开始缩放
	elem.style.width = newWidth + "px";
	elem.style.height = newHeight + "px";
	// 计算缩放后的偏移量 
	if (val - 1 > 0) {
		console.log(val);
		elem.style.top = oldTop - (newHeight - heightOld) / 2 + "px";
		elem.style.left = oldLeft - (newWidth - widthOld) / 2 + "px";
	} else if (val - 1 < 0) {
		console.log(val + "i");
		elem.style.top = oldTop - (newHeight - heightOld) / 2 + "px";
		elem.style.left = oldLeft - (newWidth - widthOld) / 2 + "px";
	}
});
// 放大缩小图片end
// 截取图片
function handIMG() {
	if (fileLoadBool) {
		// 截取出来的图片会置入这个画布，并由这个画布转换为dataURL, 这个画布隐藏起来
		var elem = document.createElement("canvas");
		var show = document.getElementById("coverTop");

		elem.id = "canvarResult";
		elem.style.display = "none";
		var oldcanvas = resDiv.querySelectorAll("canvas");
		for (var i = 0; i < oldcanvas.length; i++) {
			resDiv.removeChild(oldcanvas[i]);
		}
		resDiv.appendChild(elem);
		if (img) {
			var x = 0,
				y = 0,
				cutWidth = 0,
				cutHeight = 0;
			//获取视口宽高, 图片宽高
			var showW = parseFloat(show.getAttribute("data-show-w"));
			var showH = parseFloat(show.getAttribute("data-show-h"));
			var imgW = parseFloat(img.style.width);
			var imgH = parseFloat(img.style.height);
			//计算转换比例
			oldToNewScaleW = imgNaturalwidth / imgW;
			oldToNewScaleH = imgNaturalheight / imgH;
			//先获取初始化时的水平垂直偏移位置
			var oldLeft = show.getAttribute("data-show-left");
			var oldTop = show.getAttribute("data-show-top");
			//获取图片现在的偏移位置
			var newleft = parseFloat(img.style.left);
			var newtop = parseFloat(img.style.top);
			//转换成面向实际图片大小的截取位置
			x = oldLeft - newleft;
			y = oldTop - newtop;
			switch (true) {
				case x >= 0 && y >= 0:
					cutWidth = ((imgW - x) >= showW) ? showW : (imgW - x);
					cutHeight = ((imgH - y) >= showH) ? showH : (imgH - y);
					break;
				case x <= 0 && y <= 0:
					var outborderx = newleft - oldLeft + imgW,
						outbordery = newtop - oldTop + imgH;
					if ((outborderx > showW) && (outbordery > showH)) {
						cutWidth = showW - (newleft - oldLeft);
						cutHeight = showH - (newtop - oldTop);
					} else if ((outborderx > showW) && (outbordery <= showH)) {
						cutWidth = showW - (newleft - oldLeft);
						cutHeight = imgH;
					} else if ((outborderx <= showW) && (outbordery > showH)) {
						cutWidth = imgW;
						cutHeight = showH - (newtop - oldTop);
					} else {
						cutWidth = imgW;
						cutHeight = imgH;
					}
					x = 0;
					y = 0;
					break;
				case x < 0 && y > 0:
					cutWidth = ((showW - (newleft - oldLeft)) <= imgW) ? showW - (newleft - oldLeft) : imgW;
					cutHeight = ((imgH - y) >= showH) ? showH : (imgH - y);
					x = 0;
					break;
				case x > 0 && y < 0:
					cutWidth = ((imgW - x) >= showW) ? showW : (imgW - x);
					cutHeight = ((showH - (newtop - oldTop)) <= imgH) ? showW - (newleft - oldLeft) : imgH;
					y = 0;
					break;
				default:
					break;
			}
			x = x * oldToNewScaleW;
			y = y * oldToNewScaleH;
			cutWidth = cutWidth * oldToNewScaleW;
			cutHeight = cutHeight * oldToNewScaleH;
			var ctx = elem.getContext("2d");

			try {
				fileLoadBool = true;
				// 解决模糊问题
				// 画布尺寸与原图尺寸一样大
				// 再css缩小
				// 这样截出来的就是原质量的图片了
				elem.width = cutWidth;
				elem.height = cutHeight;
				elem.style.width = "200px";
				elem.style.height = "200px";
				elem.style.border = "1px solid";
				ctx.drawImage(img, x, y, cutWidth, cutHeight, 0, 0, cutWidth, cutHeight);
				console.log("截取成功");
				mui.toast("正在截取图片...");
				var data = elem.toDataURL();
				//                            document.querySelector("#printURL").innerHTML = data;
//				document.querySelector("#test").src = data;
				// 将图片保存到本地
				saveCropImg(data);
				//								document.querySelector("#testconsole").innerHTML = "截取宽度<br>" + cutWidth + "<br>截取高度<br>" + cutHeight;
			} catch (e) {
				fileLoadBool = true;
				console.log(e.error + "截取失败");
			}
		}
	}
};

function handleFiles(filePath) {
	fileLoadBool = false;
	var oldIMG = viewDiv.querySelectorAll("img");
	for (var i = 0; i < oldIMG.length; i++) {
		viewDiv.removeChild(oldIMG[i]);
	}
	img = new Image();
	img.onload = function() {
		fileLoadBool = true;
		var vw = viewDiv.offsetWidth;
		var vh = viewDiv.offsetHeight;
		imgNaturalwidth = img.width;
		imgNaturalheight = img.height;
		// 使图片填满视口
		img.style.width = vw * 1 + "px";
		img.style.left = vw * 0 + "px";
		// 根据视口宽计算出图片高度
		var newh = vw * 1 * imgNaturalheight / imgNaturalwidth;
		img.style.height = newh + "px";
		// 记录初始化时的大小
		img.setAttribute("data-width", vw);
		img.setAttribute("data-height", newh);
		img.setAttribute("data-left", 0);
		// 居中图片  视口高度 大于 图片高度， top 等于 图片下移 视口高减图片的一半
		// 视口高度 小于图片高度  top 等于 图片上移 图片高度减视口高度的一半
		if (newh <= vh) {
			img.style.top = (vh - newh) / 2 + "px";
			img.setAttribute("data-top", (vh - newh) / 2);
		} else {
			img.style.top = (-(newh - vh) / 2) + "px";
			img.setAttribute("data-top", (-(newh - vh) / 2));
		}
		viewDiv.appendChild(img);
		drawcover();
	};

	img.id = "imgShow";
	img.style.position = "absolute";
	// 初始化滑动条
	btnRange.value = 1;
	img.src = filePath;
};


function drawcover() {
	// 0.8表示的是遮罩中空宽度为视口宽的0.8倍
	var coverWidthScale = 0.8;
	var ElemTop = document.getElementById("coverTop");
	var ElemLeft = document.getElementById("coverLeft");
	var ElemRight = document.getElementById("coverRight");
	var ElemBottom = document.getElementById("coverBottom");
	var viewWidth = viewDiv.offsetWidth;
	var viewHeight = viewDiv.offsetHeight;

	var coverWidth = viewWidth * coverWidthScale;
	var coverHeight = viewWidth * coverWidthScale * showWindowScale;
	var baseTopSize = (viewHeight - coverHeight) / 2;
	var baseLeftSize = (viewWidth - coverWidth) / 2;
	// 保存视口值
	ElemTop.setAttribute("data-show-w", coverWidth);
	ElemTop.setAttribute("data-show-h", coverHeight);
	// 保存原始偏移值，
	ElemTop.setAttribute("data-show-left", baseLeftSize);
	ElemTop.setAttribute("data-show-top", baseTopSize);

	// 改变遮罩位置
	ElemTop.style.height = baseTopSize + "px";
	ElemLeft.style.width = baseLeftSize + "px";
	ElemLeft.style.height = coverHeight * 1.01 + "px";
	ElemLeft.style.top = baseTopSize + "px";
	ElemRight.style.width = baseLeftSize + "px";
	ElemRight.style.height = coverHeight * 1.01 + "px";
	ElemRight.style.top = baseTopSize + "px";
	ElemBottom.style.height = baseTopSize + "px";
}


var moving = false;
var mousePos = {
	x: 0,
	y: 0
};
var initPos = {
	x: 0,
	y: 0,
}

function touchStartPosition(event) {
	initPos.x = event.targetTouches[0].pageX;
	initPos.y = event.targetTouches[0].pageY;
}


function touchPosition(event) {
	return {
		x: event.targetTouches[0].pageX,
		y: event.targetTouches[0].pageY
	}
}

function touchMove(event) {
	newPos = touchPosition(event);
	if (!moving) {
		moving = true;
		mousePos = initPos;
		return;
	}
	moveDiv({
		x: (newPos.x - mousePos.x) * 1.3,
		y: (newPos.y - mousePos.y) * 1.3
	});
	mousePos = newPos;
}

function moveDiv(movePos) {
	var elem = document.getElementById("imgShow");
	if (!elem) {
		return;
	}
	var oldx = parseInt(elem.style.left);
	var oldy = parseInt(elem.style.top);
	elem.style.left = oldx + movePos.x + "px";
	elem.style.top = oldy + movePos.y + "px";
}

/*
 * @desciption 保存图片到本地，保存成功后上传
 */
function saveCropImg(DataUrl) {
	if (mui.os.plus) {
		var bitmap = new plus.nativeObj.Bitmap();
		bitmap.loadBase64Data(DataUrl, function() {
			console.log("加载Base64图片数据成功");
		}, function(e) {
			console.log('加载Base64图片数据失败：' + JSON.stringify(e));
		});
		bitmap.save("_doc/headTamp.jpg", {}, function(i) {
			console.log('保存截取头像成功：' + JSON.stringify(i));
			createUpload();
			bitmap.clear();
		}, function(e) {
			console.log('保存截取头像失败：' + JSON.stringify(e));
		});
	}
}

/**
 * @description 新建上传任务上传图片
 */
function createUpload() {
	if (!userLoginStatus()) {
		return;
	}
	if (NetWorkStatus()) {
		return;
	}
	var token = plus.storage.getItem("tokenValue");
	if (token == null) {
		return;
	}
	var URL = "http://farm.rrzuji.com/v1/user/avatar?" + fnCreateSign() + "&access-token=" + token;
	var task = plus.uploader.createUpload(URL, {
			method: "POST",
			blocksize: 0,
			priority: 100
		},
		function(t, status) {
			// 上传完成后状态码一般为200
			if (status == 200) {
				// 上传成功后删除head文件，并将headTamp改为head
				saveFile();
				console.log("图片上传成功");
			} else {
				console.log("图片上传失败");
			}
		}
	);
	task.addFile("_doc/headTamp.jpg", {
		key: "avatar"
	});
	task.addEventListener("statechanged", onStateChanged, false);
	task.start();
}

function onStateChanged(upload, status) {
	if (upload.state == 4 && status == 200) {
		// 获取上传请求响应头数据
		//		console.log(upload.getAllResponseHeaders()); 
	}
}

/**
 * @description 上传成功后，更新本地对应头像文件，并更新面板上的头像
 */
function saveFile() {
	if (mui.os.plus) {
		plus.io.resolveLocalFileSystemURL("_doc/headTamp.jpg", function(entry) {
			plus.io.resolveLocalFileSystemURL("_doc/", function(root) {
				root.getFile("head.jpg", {
					create: false
				}, function(file) {
					file.remove(function() {
						entry.copyTo(root, 'head.jpg', function(e) {
								console.log("本地头像文件更新成功");
								updateAvatar(e.fullPath);
								mui.toast("更新头像成功");
								var w = plus.webview.getWebviewById("webview-header");
								mui.fire(w, "initHeadTemplate", {});
								w.hide();
							},
							function(e) {
								console.log('copy image fail:' + e.message);
							});
					}, function() {
						console.log("delete image fail:" + e.message);
					});
				}, function() {
					// 没有旧头像文件，直接移动
					entry.copyTo(root, 'head.jpg', function(e) {
							console.log("本地头像文件更新成功");
							updateAvatar(e.fullPath);
							mui.toast("更新头像成功");
							var w = plus.webview.getWebviewById("webview-header");
							mui.fire(w, "initHeadTemplate", {});
							w.hide();
						},
						function(e) {
							console.log('copy image fail:' + e.message);
						});
				});
			}, function(e) {
				console.log("get _www folder fail");
			})
		}, function(e) {
			//选择文件失败回调
			console.log("读取图片文件错误：" + e.message);
		});
	}
}

/**
 * @description 更新面板
 */
function updateAvatar(filePath) {
	mui.fire(plus.webview.getWebviewById("webview-my.html"), "changeAvatar", {});
	mui.fire(plus.webview.getWebviewById("secondlv/webview-my-setting.html"), "changeAvatar", {
		url: filePath
	});
}