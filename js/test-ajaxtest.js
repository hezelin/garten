;
(function() {
	mui.init();
})();
window.onload = function() {
	var btn = document.getElementById("login");
	var result = document.getElementById("result");
	var btn2 = document.getElementById("search");
	var btn3 = document.getElementById("reg");
	var btn4 = document.getElementById("revamp");
	var btn5 = document.getElementById("PIM");
	var loginSub = document.getElementById("Submit");
	//生成签名
	function fnCreateSign() {
		var time = (Date.parse(new Date())).toString().substring(0, 10); //不带后3位毫秒的时间戳,共10位
		var salt = "5YM7r9f8zJVWqmsb";
		var nonce = randomStr(Math.random() * 10 + 6);
		var signature = md5(time + nonce + salt);
		//生成6~16位的随机字符串，len  值为math.random()*10+6
		function randomStr(len) {
			var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			var maxPos = chars.length;
			var pwd = "";
			for (var i = 0; i < len; i++) {
				pwd += chars.charAt(Math.floor(Math.random() * maxPos));
			}
			return pwd;
		};
		return "signature=" + signature + "&nonce=" + nonce + "&timestamp=" + time;
	};
	//所有请求都要加上datatype，要不然会报towlcase错误

	//登录
	btn.addEventListener("tap", function() {
		var URL = "http://farm.rrzuji.com/v1/users/login?" + fnCreateSign();
		var dataP = {
			phone: "13229788871",
			password: "123456"
		};		
		
		//		var URL = "http://farm.rrzuji.com/v1/user/login?signature=b02b9f4c7bde8cd1ac933cfa73a7db31&nonce=fuI2Oxs29&timestamp=1452520317";
		mui.ajax(URL, {
			data: dataP,
			dataType: 'json',
			//	contentType: "multipart/form-data",
			type: 'post',
			timeout: 10000,
			success: function(data) {
				//成功处理
				result.innerHTML = JSON.stringify(data);
				console.log(JSON.stringify(data));
				void plus.storage.setItem(data["data"]["phone"], data["data"]["access_token"]);
				
			},
			error: function(xhr, type, errorThrown) {
				result.innerHTML = JSON.stringify(xhr) + "</br>" + type;
			}
		});
	});
	//查询
	btn2.addEventListener("tap", function() {
		result.innerHTML = "...";
		mui.ajax("http://farm.rrzuji.com/v1/users?" + fnCreateSign(), {
			type: "get",
			dataType: "json",
			success: function(data) {
				//成功处理
				result.innerHTML = JSON.stringify(data);
			},
			error: function(xhr, type, errorThrown) {
				result.innerHTML = JSON.stringify(xhr) + "</br>" + type;
			}
		});
	});
	//注册
	btn3.addEventListener("tap", function() {
		btn3.setAttribute("disabled", "disabled");
		mui.ajax("http://farm.rrzuji.com/v1/users?" + fnCreateSign(), {
			type: "post",
			dataType: "json",
			data: {
				phone: "13229788871",
				password: "123456"
			},
			success: function(data) {
				//成功处理
				result.innerHTML = JSON.stringify(data);
				console.log(JSON.stringify(data));
			},
			error: function(xhr, type, errorThrown) {
				result.innerHTML = JSON.stringify(xhr) + "</br>" + type;
			}
		});
	});
	//修改信息
	btn4.addEventListener("tap", function() {
		btn4.setAttribute("disabled", "disabled");
		mui.ajaxSettings.xhr = function() {
			return new window.XMLHttpRequest();
		};
		mui.ajax("http://farm.rrzuji.com/v1/users/12?" + fnCreateSign() + "&access-token=" + plus.storage.getItem("13229788877"), {
			type: "put",
			dataType: "json",
			data: {
				phone: "13229788871",
				name: "lizhibin",
				gender: 1,
				birthday: "1993-2-19",
				
			},
			success: function(data) {
				//成功处理
				result.innerHTML = JSON.stringify(data);
				console.log(JSON.stringify(data));
			},
			error: function(xhr, type, errorThrown) {
				result.innerHTML = JSON.stringify(xhr) + "</br>" + type;
			}
		});
	});
	//查看个人信息
	btn5.addEventListener("tap", function() {
		var URL = 
		mui.ajax()
	});
	document.getElementById("LoginOther").addEventListener("tap",function() {
		var URL = "http://farm.rrzuji.com/v1/users/login?" + fnCreateSign();
		var dataP = {
			relevance: "qq",
			openid: "82B06513946927AFE92B00DE42BFE299",
		};		
		
		
		mui.ajax(URL, {
			data: dataP,
			dataType: 'json',
			//	contentType: "multipart/form-data",
			type: 'post',
			timeout: 10000,
			success: function(data) {
				//成功处理
				result.innerHTML = JSON.stringify(data);
				console.log(JSON.stringify(data));
//				void plus.storage.setItem(data["data"]["phone"], data["data"]["access_token"]);
				
			},
			error: function(xhr, type, errorThrown) {
				result.innerHTML = JSON.stringify(xhr) + "</br>" + type;
			}
		});
	});
};