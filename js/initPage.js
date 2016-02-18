/**
 * 该js位于顶级index层
 */
;
if (window.plus) {
	plusReady();
} else {
	document.addEventListener("plusready", plusReady, false);
}

function plusReady() {
	mui.init();

	
	//仅支持竖屏显示
	plus.screen.lockOrientation("portrait-primary");
	//首页返回键处理
	//处理逻辑：1秒内，连续两次按返回键，则退出应用；
	var first = null;
	mui.back = function() {
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
	};

	var subpages = ['webview-home.html', 'webview-comu.html', 'webview-nav.html', 'webview-my.html'];
	var aniShow = {};
	var self = plus.webview.currentWebview();

	for (var i = 0; i < 4; i++) {
		var temp = {};
		var sub;
		if (i == 3) {
			sub = mui.preload({
				url: subpages[i],
				id: subpages[i],
				styles: fnSetSubpageStyle(0,111)
			});
			sub.onloaded = function() {
				var delayTime = mui.os.ios ? 100 : 600;
				setTimeout(function() {
					//四个基本标签和父模板加载完后，延时关闭app启动页
					//接下来预加载头部webviewhead与webviewbody
					plus.navigator.closeSplashscreen();
					var webHead = mui.preload({
						url: "webview-header.html",
						id: "webview-header",
						styles: fnSetSubpageStyle(0, 0)
					});
					var webBody = mui.preload({
						url: "",
						id: "webview-body",
						styles: fnSetSubpageStyle(110, 0)
					});
					webHead.append(webBody);
				}, delayTime);
			}
		} else {
			sub = mui.preload({
				url: subpages[i],
				id: subpages[i],
				styles: fnSetSubpageStyle(0,111)
			});
		}
		if (i > 0) {
			sub.hide();
		} else {
			temp[subpages[i]] = "true";
			mui.extend(aniShow, temp);
		}
		self.append(sub);
	}

	//当前激活选项
	var activeTab = subpages[0];
	var activeTab = "webview-home.html";
	var title = document.getElementById("title");
	//选项卡点击事件
	mui('.mui-bar-tab').on('tap', 'a', function(e) {
		var targetTab = this.getAttribute('href');
		if (targetTab == activeTab) {
			return;
		}
		//更换标题
		//		title.innerHTML = this.querySelector('.icon-label').innerHTML;
		//显示目标选项卡
		//若为iOS平台或非首次显示，则直接显示
		if (mui.os.ios || aniShow[targetTab]) {
			plus.webview.show(targetTab, "none", 300);

		} else {
			//否则，使用fade-in动画，且保存变量
			var temp = {};
			temp[targetTab] = "true";
			mui.extend(aniShow, temp);
			plus.webview.show(targetTab, "none", 300);
		}
		//隐藏当前;
		plus.webview.hide(activeTab, "none");
		//更改当前活跃的选项卡
		activeTab = targetTab;
	});

	//自定义事件，模拟点击“首页选项卡”
	//	document.addEventListener('gohome', function() {
	//		var defaultTab = document.getElementById("defaultTab");
	//		//模拟首页点击
	//		mui.trigger(defaultTab, 'tap');
	//		//切换选项卡高亮
	//		var current = document.querySelector(".mui-bar-tab>.mui-tab-item.mui-active");
	//		if (defaultTab !== current) {
	//			current.classList.remove('mui-active');
	//			defaultTab.classList.add('mui-active');
	//		}
	//	});

}