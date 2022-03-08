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

async function getServerInfo() {
	for (let server of serverPanel) {
		try {
			let response = await mdui.$.ajax({
				method: 'POST',
				url: server.url,
				dataType: 'json'
			});
			response = response.result;

			if (response) {
				let totalStorageUsage = 0;
				let totalStorageSize = 0;
				let totalStorageUsedSize = 0;

				for (let disk of response.disk) {
					totalStorageUsage += stringToNumber(disk.size[3]);
					totalStorageSize += stringToNumber(disk.size[0]);
					totalStorageUsedSize += stringToNumber(disk.size[1]);

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
				totalStorageUsage = totalStorageUsage / response.disk.length;
				totalStorageSize = totalStorageSize / response.disk.length;
				totalStorageUsedSize = totalStorageUsedSize / response.disk.length;


				server.serverName.innerHTML = response.name;

				server.cpuInfo.setValue(response.cpu[0] / 100);
				server.ramInfo.setValue(response.mem.memRealUsed / response.mem.memTotal, response.mem.memRealUsed + 'MB/' + response.mem.memTotal + 'MB');
				server.storageInfo.setValue(totalStorageUsage, totalStorageUsedSize + 'GB/' + totalStorageSize + 'GB，共 ' + response.disk.length + ' 块硬盘');
				server.loadInfo.setValue(response.load.one / 100);

				server.info.innerHTML = '服务器系统：' + response.system.name + '<br>持续运行时长：' + response.system.time;
				server.network.innerHTML = '<i class="mdui-icon material-icons">&#xe5d8;</i>' + response.network.up + 'KB/s（总 ' + (response.network.upTotal / 1024 / 1024).toFixed(2) + 'MB）<br>' + 
					'<i class="mdui-icon material-icons">&#xe5db;</i>' + response.network.down + 'KB/s（总 ' + (response.network.downTotal / 1024 / 1024).toFixed(2) + 'MB）';

				mdui.$(resultDiv).mutation();
			}
		} catch (e) {
			console.error(e);
		}
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