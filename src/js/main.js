var vConsole;
const resultDiv = document.getElementById('resultDiv');
var serverPanel = [];

var getBetween = 3000;
var getEvent;


// ============== 请在这里设置你的服务器信息获取入口！===========
const servers = ['./get.php', // 设置服务器的信息获取入口，可以是相对路径也可以是绝对，跨域域名请注意设置允许跨域和 HTTP/HTTPS
		'http://111.222.333.444:8080/getStatus.php'];
// ============== 请在这里设置你的服务器信息获取入口！===========


resultDiv.innerHTML = '';
for (let server of servers) {
	let output = {};
	let col = document.createElement('div');
	let card = document.createElement('section');
	let content = document.createElement('div');
	let title = document.createElement('div');
	let info = document.createElement('p');
	let network = document.createElement('p');

	col.className = 'mdui-col-xs-12 mdui-col-sm-6 mdui-col-md-4';
	card.className = 'mdui-card mdui-m-b-2';
	content.className = 'mdui-card-content';
	title.className = 'mdui-typo-title mdui-text-truncate';
	info.className = 'mdui-text-truncate';

	title.innerHTML = '获取中...';
	info.innerHTML = '服务器系统：获取中...<br>持续运行时长：获取中...';
	network.innerHTML = '<i class="mdui-icon material-icons">&#xe5d8;</i>获取中...<br><i class="mdui-icon material-icons">&#xe5db;</i>获取中...';

	output = {
		url : server,
		serverName : title,
		cpuInfo : CreateProgressBar('CPU 使用率'),
		ramInfo : CreateProgressBar('内存使用率'),
		storageInfo : CreateProgressBar('存储使用率'),
		loadInfo : CreateProgressBar('资源负载率'),
		info : info,
		network : network
	};

	content.appendChild(title);
	content.appendChild(output.cpuInfo);
	content.appendChild(output.ramInfo);
	content.appendChild(output.storageInfo);
	content.appendChild(output.loadInfo);
	content.appendChild(output.info);
	content.appendChild(output.network);

	card.appendChild(content);
	col.appendChild(card);

	serverPanel.push(output);
	resultDiv.appendChild(col);

	function CreateProgressBar(name) {
		let container = document.createElement('div');
		let p = document.createElement('p');
		let progress = document.createElement('div');
		let progressValue = document.createElement('div');
	
		p.className = 'mdui-text-truncate';
		progress.className = 'mdui-progress';
		progressValue.className = 'mdui-progress-indeterminate';
	
		p.innerHTML = name + '：获取中...';
	
		progress.appendChild(progressValue);
	
		container.appendChild(p);
		container.appendChild(progress);
	
		container.name = name;
		container.setValue = function (value = null, detail = '') {
			let fixedValue = (Number(value) * 100).toFixed(2);
	
			if (!fixedValue || isNaN(fixedValue) || fixedValue < 0) {
				this.getElementsByTagName('p')[0].innerHTML = this.name + '：获取中...';
				this.getElementsByClassName('mdui-progress')[0].childNodes[0].className = 'mdui-progress-indeterminate';
				this.getElementsByClassName('mdui-progress')[0].childNodes[0].style.width = '100%';
				
			} else {
				this.getElementsByTagName('p')[0].innerHTML = this.name + '：' + fixedValue + '%' + (detail && detail !== '' ? '（' + detail + '）' : '');
				this.getElementsByClassName('mdui-progress')[0].childNodes[0].className = 'mdui-progress-determinate';
				this.getElementsByClassName('mdui-progress')[0].childNodes[0].style.width = fixedValue + '%';
			}
	
			return this;
		}
	
		return container;
	}
}

getEvent = setInterval(function() {
	getServerInfo();
}, getBetween);

getServerInfo();

function getServerInfo() {
	for (let server of serverPanel) {
		mdui.$.ajax({
			method: 'POST',
			url: server.url,
			dataType: 'json',
			data: {
				time: Date.now()
			},
			success: (res) => {
				let json = res.result;
				if (!json) console.error('No data found');
				
				let totalStorageUsage = 0;
				let totalStorageSize = 0;
				let totalStorageUsedSize = 0;

				for (let disk of json.disk) {
					totalStorageSize += stringToNumber(disk.size[0]);
					totalStorageUsedSize += stringToNumber(disk.size[1]);
					totalStorageUsage += stringToNumber(disk.size[1]) / stringToNumber(disk.size[0]);

					function stringToNumber(text) {
						let pattern = /^(\d+)(.+)$/;
						let patternResult = [];
						let number = 0;
						let type = '';

						patternResult = pattern.exec(text);
						if (patternResult && patternResult.length === 3) {
							number = Number(patternResult[1]);
							type = patternResult[2];

							switch (type) {
								case 'M': {
									number = number / 1024;
									break;
								}
								case '%': {
									number = number / 100;
									break;
								}
							}

							return number;
						}
					}
				}
				totalStorageUsage = totalStorageUsage / json.disk.length;
				totalStorageSize = totalStorageSize / json.disk.length;
				totalStorageUsedSize = totalStorageUsedSize / json.disk.length;


				server.serverName.innerHTML = json.name;

				server.cpuInfo.setValue(json.cpu[0] / 100);
				server.ramInfo.setValue(json.mem.memRealUsed / json.mem.memTotal, json.mem.memRealUsed + 'MB/' + json.mem.memTotal + 'MB');
				server.storageInfo.setValue(totalStorageUsage, totalStorageUsedSize + 'GB/' + totalStorageSize + 'GB，共 ' + json.disk.length + ' 块硬盘');
				server.loadInfo.setValue(json.load.one / 100);

				server.info.innerHTML = '服务器系统：' + json.system.name + '<br>持续运行时长：' + json.system.time;
				server.network.innerHTML = '<i class="mdui-icon material-icons">&#xe5d8;</i>' + json.network.up + 'KB/s（总 ' + (json.network.upTotal / 1024 / 1024).toFixed(2) + 'MB）<br>' + 
					'<i class="mdui-icon material-icons">&#xe5db;</i>' + json.network.down + 'KB/s（总 ' + (json.network.downTotal / 1024 / 1024).toFixed(2) + 'MB）';

				mdui.$(resultDiv).mutation();
			},
			error: (xhr, textStatus) => {
				console.error(textStatus);
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
		console.log(
			'====================================\n' +
			'友情提示：\n' +
			'请不要在 Console 中运行你不清楚的代码。\n' +
			'有心之人可能会利用这些代码进行 xss 攻击。\n' +
			'===================================='
		);
		mdui.alert('vConsole 已启用', '提示');
	}
}