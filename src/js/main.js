var vConsole;
const resultDiv = document.getElementById('resultDiv');
var serverPanel = new Array();

var getBetween = 3000;
var getEvent;


// ============== 请在这里设置你的服务器信息获取入口！===========
const servers = ['./get.php', // 设置服务器的信息获取入口，可以是相对路径也可以是绝对，跨域域名请注意设置允许跨域和 HTTP/HTTPS
		'http://111.222.333.444:8080/getStatus.php'];
// ============== 请在这里设置你的服务器信息获取入口！===========


const _CardHead = '<div class="mdui-card" style="margin-bottom:16px">' +
		'<div class="mdui-card-content">' +
		'<div class="mdui-typo-title mdui-text-truncate">';
const _CardCpuSeize = '</div>' +
		'<p>CPU 使用率：';
const _CardCpuSeizeBar = '</p>' +
		'<div class="mdui-progress">' +
		'<div class="mdui-progress-determinate" style="width:';
const _CardMemSeize = '%"></div>' +
		'</div>' +
		'<p>内存使用率：';
const _CardMemSeizeBar = '</p>' +
		'<div class="mdui-progress">' +
		'<div class="mdui-progress-determinate" style="width:';
const _CardDiskSeize = '"></div>' +
		'</div>' +
		'<p>存储使用率：';
const _CardDiskSeizeBar = '</p>' +
		'<div class="mdui-progress">' +
		'<div class="mdui-progress-determinate" style="width:';
const _CardLoadSeize = '"></div>' +
		'</div>' +
		'<p>资源负载率：';
const _CardLoadSeizeBar = '%</p>' +
		'<div class="mdui-progress">' +
		'<div class="mdui-progress-determinate" style="width:';
const _CardSystemName = '%"></div>' +
		'</div>' +
		'<p class="mdui-text-truncase" style="margin-bottom:0">服务器系统：';
const _CardSysRuntime = '</p>' +
		'<p style="margin-top:0">持续运行时长：';
const _CardBandwidthUp = '</p>' +
		'<p>' +
		'<i class="mdui-icon material-icons">&#xe5d8;</i>';
const _CardBandwidthDown = '<br>' +
		'<i class="mdui-icon material-icons">&#xe5db;</i>';
const _CardEnd = '</p>' +
		'</div>' +
		'</div>';

getEvent = setInterval(function() {
	getServerInfo();
}, getBetween);

getServerInfo();


function getServerInfo() {
	for (var i = 0; i < servers.length; i++) {
		const currentServer = i;
		
		mdui.$.ajax({
			method: 'POST',
			url: servers[currentServer],
			data: {
				time: Date.now().toString().substr(0, 10)
			},
			success: function(data) {
				if (data != '') {
					var obj;
					try {
						obj = JSON.parse(data);
					} catch(e) {
						console.log(e);
					}
					
					if (obj) {
						var result = '';
						
						if (obj.code == 200) {
							var info = obj.result;
							
							result += _CardHead + info.name;
							
							result += _CardCpuSeize + info.cpu[0] + '%';
							result += _CardCpuSeizeBar + info.cpu[0];
							
							let _MemUsedPer = (info.mem.memRealUsed / info.mem.memTotal) * 100;
							result += _CardMemSeize;
							result +=  _MemUsedPer.toFixed(2);
							result += '%（' + info.mem.memRealUsed + 'MB / ' + info.mem.memTotal + 'MB）';
							result += _CardMemSeizeBar + _MemUsedPer.toFixed(2) + '%';
							
							for (var y = 0; y < info.disk.length; y++) {
								result += _CardDiskSeize;
								result += info.disk[y].size[3];
								result += '（' + info.disk[y].size[1] + ' / ' + info.disk[y].size[0] + '）';
								result += _CardDiskSeizeBar + info.disk[y].size[3];
							}
							
							result += _CardLoadSeize + info.load.one;
							result += _CardLoadSeizeBar + info.load.one;
							
							result += _CardSystemName + info.system.name;
							result += _CardSysRuntime + info.system.time;
							
							let _TotalBandwidthUp = info.network.upTotal / 1024 / 1024;
							let _TotalBandwidthDown = info.network.downTotal / 1024 / 1024;
							result += _CardBandwidthUp + info.network.up + 'KB/s（总' + _TotalBandwidthUp.toFixed(2) + 'MB）';
							result += _CardBandwidthDown + info.network.down + 'KB/s（总' + _TotalBandwidthDown.toFixed(2) + 'MB）';
							result += _CardEnd;
							
							if (serverPanel.length < 1)
								resultDiv.innerHTML = '';
							
							if (!serverPanel[currentServer]) {
								serverPanel[currentServer] = document.createElement('div');
								serverPanel[currentServer].className = 'mdui-col-xs-12 mdui-col-sm-6 mdui-col-md-4';
								resultDiv.appendChild(serverPanel[currentServer]);
							}
							
							serverPanel[currentServer].innerHTML = result;
							mdui.$(resultDiv).mutation();
						}
					}
				}
			}
		});
	}
}

function setRefreshBetween() {
	mdui.prompt('请输入时间间隔（单位：秒，最少为一秒）', '提示', function(value) {
		if (value < 1)
			getBetween = 1000;
		else
			getBetween = value * 1000;
		
		if (getEvent) {
			clearInterval(getEvent);
			getEvent = setInterval(function() {
				getServerInfo();
			}, getBetween);
		}
	});
}

function toggleRefresh(button) {
	if (getEvent) {
		clearInterval(getEvent);
		getEvent = null;
		
		button.innerHTML = '<i class="mdui-menu-item-icon mdui-icon material-icons">&#xe037;</i>继续自动刷新';
		
	} else {
		getEvent = setInterval(function() {
			getServerInfo();
		}, getBetween);
		getServerInfo();
		
		button.innerHTML = '<i class="mdui-menu-item-icon mdui-icon material-icons">&#xe034;</i>暂停自动刷新';
	}
}

function toggleDarkmode(button) {
	if (getCookie('darkmode') == 'true') {
		if (mdui.$('body').hasClass('mdui-theme-layout-auto'))
			mdui.$('body').removeClass('mdui-theme-layout-auto');
		
		if (mdui.$('body').hasClass('mdui-theme-layout-dark'))
			mdui.$('body').removeClass('mdui-theme-layout-dark');
		
		setCookie('darkmode', 'false');
		
		button.innerHTML = '<i class="mdui-icon material-icons">&#xe3ac;</i>';
		
	} else {
		if (mdui.$('body').hasClass('mdui-theme-layout-auto'))
			mdui.$('body').removeClass('mdui-theme-layout-auto');
		
		mdui.$('body').addClass('mdui-theme-layout-dark');
		
		setCookie('darkmode', 'true');
		
		button.innerHTML = '<i class="mdui-icon material-icons">&#xe3a9;</i>';
		
	}
}

function enableConsole(button) {
	if (!vConsole) {
		button.setAttribute('disabled', true);
		button.getElementsByTagName('a')[0].setAttribute('disabled', true);
		vConsole = new VConsole();
		console.log('====================================\n' +
			'友情提示：\n' +
			'请不要在 Console 中运行你不清楚的代码。\n' +
			'有心之人可能会利用这些代码进行 xss 攻击。\n' +
			'====================================');
		mdui.alert('vConsole 已启用', '提示');
	}
}