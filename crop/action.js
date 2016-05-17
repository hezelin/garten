function imgActions() {
	if (mui.os.plus) {
		var a = [{
			title: "拍照"
		}, {
			title: "从手机相册选择"
		}];
		plus.nativeUI.actionSheet({
			title: "修改头像",
			cancel: "取消",
			buttons: a
		}, function(b) {
			switch (b.index) {
				case 0:
					break;
				case 1:
					getImage();
					break;
				case 2:
					galleryImg();
					break;
				default:
					break
			}
		})
	}
}
//打开相机拍照
function getImage() {
	//获取摄像头对象
	var c = plus.camera.getCamera();
	c.captureImage(function(e) {
		plus.io.resolveLocalFileSystemURL(e, function(entry) {
			fnPhotoOperate(entry.toLocalURL());
		}, function(e) {
			console.log("读取拍照文件错误：" + e.message);
		});
	}, function(s) {
		console.log("error" + s);
	}, {
		//拍照文件保存路径
		filename: "_doc/headTamp.jpg"
	})
}
//从相册提取
function galleryImg() {
	//选择一张图，图片路径为a
	plus.gallery.pick(function(a) {
		plus.io.resolveLocalFileSystemURL(a, function(entry) { //获取a的文件操作对象entry
			plus.io.resolveLocalFileSystemURL("_doc/", function(root) { //获取doc目录的文件操作对象root
				root.getFile("headTamp.jpg", {
					create: false
				}, function(file) { // 在doc目录下打开文件headTamp.jpg,create:false表示不重新创建
					// 存在，则删除文件
					file.remove(function() {
						console.log("删除文件");
						
						console.log("file remove success");
						entry.copyTo(root, 'headTamp.jpg', function(e) { // 将选中的a:enpry的文件拷贝到doc:root，并重新命名为headTamp 
								// ios bug
								console.log("复制文件");
								fnPhotoOperate(e.fullPath + "?verson=" + new Date().getTime());
//								fnPhotoOperate(e.fullPath);								
							},
							function(e) {
								console.log('copy image fail:' + e.message);
							});
					}, function() {
						console.log("delete image fail:" + e.message);
					});
				}, function() {
					//打开失败，文件不存在，直接复制
					entry.copyTo(root, 'headTamp.jpg', function(e) {
							console.log("复制文件");
							fnPhotoOperate(e.fullPath + "?verson=" + new Date().getTime());
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
	}, function(a) {}, {
		filter: "image"
	})
};
/**
 * 
 * @param {Object} url
 * @description 从照相机、相册选择照片后，对照片进行操作，例如压缩、旋转，缩放。操作完成后执行fnCompletePhotoOperate将图片装入头像区域、预览区
 */
function fnPhotoOperate(url) {
	mui.toast("正在载入图片...");
	// 添加一个隐藏的图片节点来加载图片
	if (document.querySelector("#loadContainer")) {
		document.body.removeChild(document.querySelector("#loadContainer"));
	}
	var imgElem = document.createElement("img");
	imgElem.style.display = "none";
	imgElem.setAttribute("src", url + "?version=" + new Date().getTime());
	imgElem.setAttribute("id", "loadContainer");
	imgElem.onload = function() {
		EXIF.getData(imgElem, function() {
			console.log("旋转图片前图片地址"+ url);
			var orientation = EXIF.getTag(this, 'Orientation');
			if (!isNaN(orientation)) {
				console.log("旋转方向" + orientation);
				switch (orientation) {
					case 6:
						plus.zip.compressImage({
								src: '_doc/headTamp.jpg',
								dst: '_doc/headTamp.jpg',
								quality: 100,
								overwrite: true,
								rotate: 90 // 旋转90度
							},
							function() {
								cropIMG(url);
							},
							function(error) {
								console.log("Compress error!" + error.message);
							});
						break;
					case 8:
						plus.zip.compressImage({
								src: '_doc/headTamp.jpg',
								dst: '_doc/headTamp.jpg',
								quality: 100,
								overwrite: true,
								rotate: 270 // 旋转270度
							},
							function() {
								cropIMG(url);
							},
							function(error) {
								console.log("Compress error!" + error.message);
							});
						break;
					case 1:
						plus.zip.compressImage({
								src: '_doc/headTamp.jpg',
								dst: '_doc/headTamp.jpg',
								quality: 100,
								overwrite: true,
								rotate: 0
							},
							function() {
								cropIMG(url);
							},
							function(error) {
								console.log("Compress error!" + error.message);
							});
						break;
					case 3: //180度
						plus.zip.compressImage({
//								src: url,
//								dst: url,
								src: '_doc/headTamp.jpg',
								dst: '_doc/headTamp.jpg',
								quality: 100,
								overwrite: true,
								rotate: 180
							},
							function() {
								cropIMG(url);
							},
							function(error) {
								console.log("Compress error!" + error.message);
							});
						break;
				}
			} else {
				console.log("不需要旋转");
				cropIMG(url);
			}
		});
	};
	// 操作end
}
// 拍照、从相册选择图片后的截图操作
function cropIMG(filePath) {
	// 打开一个窗口
	fnLoadPage("none", {
		url: "../crop/crop.html",
		top: 98,
		bottom: 0
	}, {
		title: "截取图片",
		rightBtn: '<span id="saveCrop" class="header-control-right-btn-span">保存</span>'
	}, {
		func: "loadFileCrop",
		detail: {
			fileFullPath: filePath
		}
	});
	mui.fire(plus.webview.getWebviewById("webview-header"), "avatarCrop", {});
};