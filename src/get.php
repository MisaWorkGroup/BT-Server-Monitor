<?php
	if ($_SERVER['REQUEST_METHOD'] != 'POST') {
		header('HTTP/1.0 404 Not Found');
		die();
	}
	
	if ($_POST['time'] > time() + 1 || $_POST['time'] < time() - 1) {
		header('HTTP/1.0 404 Not Found');
		die();
	}
	
	session_start();
	/**
	if (empty($_SESSION['lastSubTime'])) {
		header('HTTP/1.0 404 Not Found');
		die();
	}
	**/
	
	if (time() - $_SESSION['lastSubTime'] < 1) {
		header('HTTP/1.0 404 Not Found');
		die();
	}
	
	$panel = array();
	
	// =========== 请在这里设置你的服务器的宝塔面板 API 相关参数！
	$panel['name'] = array( // 你希望展示的服务器名称，单个数据保留一行即可，多个服务器请遵守示例数据的格式
		'服务器 A',
		'服务器 B'
	);
	$panel['url'] = array( // 服务器面板地址，带 http:、地址和端口，不带入口地址，结尾不要带 /，格式要求同上
		'http://192.168.1.1:8888',
		'http://192.168.1.2:8888'
	);
	$panel['apikey'] = array( // 宝塔面板 API 的 APIKEY，格式要求同上
		'1145141919810',
		'henghenghengaaaaaaa'
	);
	
	$cookiePathPre = ''; // 存放面板 Cookies 的目录前缀，推荐你用随机字符串摇一个来保障安全，当然你也可以不这么做
	// =========== 请在这里设置你的服务器的宝塔面板 API 相关参数！
	
	$return = array();
	
	for ($i = 0; $i < count($panel['apikey']); $i++) {
		$data = array();
		
		$data['request_token'] = md5(time() . '' . md5($panel['apikey'][$i]));
		$data['request_time'] = time();
		
		$result = HttpPostCookie($panel['url'][$i], '/system?action=GetNetWork', $data, 5, $cookiePathPre);
		$result = json_decode($result, true);
		
		$return[$i]['name'] = $panel['name'][$i];
		
		$return[$i]['network']['upTotal'] = $result['upTotal'];
		$return[$i]['network']['downTotal'] = $result['downTotal'];
		$return[$i]['network']['up'] = $result['up'];
		$return[$i]['network']['down'] = $result['down'];
		
		$return[$i]['cpu'] = $result['cpu'];
		$return[$i]['load'] = $result['load'];
		$return[$i]['mem'] = $result['mem'];
		$return[$i]['disk'] = $result['disk'];
		
		$return[$i]['system']['name'] = $result['system'];
		$return[$i]['system']['time'] = $result['time'];
	}
	
	echo json_encode($return);
	
	$_SESSION['lastSubTime'] = time();
	
	function HttpPostCookie($url, $dir, $data, $timeout = 10, $_cookPathPre) {
		$cookie_file = './data/' . $_cookPathPre . 'cook/' . md5($url) . '.cookie';
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
