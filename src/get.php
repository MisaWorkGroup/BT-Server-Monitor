<?php
	$panel = array();
	
	// =========== 请在这里设置本程序相关设置！============
	$allowOrigin = array( // 设置允许访问的域名来源，单个域名请只保留一行，多个请遵循示例格式
		'https://a.baidu.com',
		'http://111.222.333.444'
	);
	
	$panel['name'] = '服务器 A';                          // 你希望展示的服务器名称
	$panel['url'] = 'http://127.0.0.1:8888';             // 服务器面板地址，带 http:、地址和端口，不带入口地址，结尾不要带 /
	$panel['apikey'] = '1145141919810henghenghengaaaaa'; // 宝塔面板 API 的 APIKEY
	
	$cookiePathPre = ''; // 存放面板 Cookies 的目录前缀，推荐你用随机字符串摇一个来保障安全，当然你也可以不这么做
	// ↑记得也要在服务器里设置这个目录！
	// =========== 请在这里设置本程序相关设置！============
	
	
	$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : null;
	
	if (in_array($origin, $allowOrigin)) {
		header('Access-Control-Allow-Origin:' . $origin);
	} else if (!is_null($origin)) {
		header('HTTP/1.0 404 Not Found');
		die();
	}

	/*
	if ($_POST['time'] > time() * 1000 + 3000 || $_POST['time'] < time() * 1000 - 3000) {
		header('HTTP/1.0 404 Not Found');
		die();
	}
	*/
	
	$return = array();
	
	$data = array();
	
	$data['request_token'] = md5(time() . '' . md5($panel['apikey']));
	$data['request_time'] = time();
	
	$result = HttpPostCookie($panel['url'], '/system?action=GetNetWork', $data, 5, $cookiePathPre);
	$result = json_decode($result, true);
	
	if ($result)
		$return['code'] = 200;
	
	$return['result']['name'] = $panel['name'];
	
	$return['result']['network']['upTotal'] = $result['upTotal'];
	$return['result']['network']['downTotal'] = $result['downTotal'];
	$return['result']['network']['up'] = $result['up'];
	$return['result']['network']['down'] = $result['down'];
	
	$return['result']['cpu'] = $result['cpu'];
	$return['result']['load'] = $result['load'];
	$return['result']['mem'] = $result['mem'];
	$return['result']['disk'] = $result['disk'];
	
	$return['result']['system']['name'] = $result['system'];
	$return['result']['system']['time'] = $result['time'];
	
	echo json_encode($return);
	
	function HttpPostCookie($url, $dir, $data, $timeout = 10, $cookiePre) {
		$cookie_file = './' . $cookiePre . 'cook/' . md5($url) . '.cookie';

		if (!is_dir(dirname($cookie_file))) {
			mkdir(dirname($cookie_file));
		}
		if (!file_exists($cookie_file)) {
			$fp = fopen($cookie_file,'w+');
			fclose($fp);
		}
		
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url . $dir);
		curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file);
		curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		$output = curl_exec($ch);
		curl_close($ch);
		return $output;
	}
	
?>
