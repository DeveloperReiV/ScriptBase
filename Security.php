<?php

class Security{

	private $key = "#$5asdf324rfassdft345SDFwerwerER";

	public $no_debug_ips = ['127.0.0.1', '188.243.218.18'];		//ip c с которых не запускается режим отладки

	//Разрешенные коды телефонов
	public $ok_codes = [
		//региональные коды
		301, 302, 336, 341, 342, 343, 345, 346, 347, 349, 351, 352,
		353, 365, 381, 382, 383, 384, 385, 388, 390, 391, 394, 395, 401,
		411, 413, 415, 416, 421, 423, 424, 426, 427, 471, 472, 473, 474,
		475, 481, 482, 483, 484, 485, 486, 487, 491, 492, 493, 494, 495,
		496, 498, 499, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809,
		811, 812, 813, 814, 815, 816, 817, 818, 820, 821, 831, 833, 834,
		835, 836, 841, 842, 843, 844, 845, 846, 847, 848, 851, 855, 861,
		862, 863, 865, 866, 867, 869, 871, 872, 873, 877, 878, 879,

		//мобильные операторы
		900, 901, 902, 903, 904, 905, 906, 908, 909, 910, 911, 912, 913,
		914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926,
		927, 928, 929, 930, 931, 932, 933, 934, 936, 937, 938, 939, 941,
		950, 951, 952, 953, 954, 955, 956, 958, 960, 961, 962, 963, 964,
		965, 966, 967, 968, 969, 970, 971, 977, 978, 980, 981, 982, 983,
		984, 985, 986, 987, 988, 989, 991, 992, 993, 994, 995, 996, 997,
		999
	];

	//Запрещенные слова сообщений
	public $work_blocks = [];


	public $phone = null;
	public $message = null;
	public $email = null;
	public $name = null;

	function __construct(){
		if(isset($_GET['SDU'])){
			ob_clean();
			echo urlencode($this->set_SDU(true));
			exit();
		}else if(isset($_GET['SDU_HtmlScript']) or isset($_POST['SDU_HtmlScript'])){
			ob_clean();
			echo urlencode($this->html_script(false));
			exit();
		}
	}

	//Функция шифровани
	public function encrypt($data, $key = null, $base64 = true, $method = 'AES-128-CBC'){
		$result = '';

		if(!$key) $key=$this->key;

		if(extension_loaded('openssl') and in_array($method, openssl_get_cipher_methods())){
			$ivlen = openssl_cipher_iv_length($method);
			$iv = openssl_random_pseudo_bytes($ivlen);
			$result = openssl_encrypt($data, $method, $key,OPENSSL_RAW_DATA, $iv);
			$hmac = hash_hmac('sha256', $result, $key, true);
			if($base64) $result = base64_encode( $iv.$hmac.$result );
		}

		return $result;
	}

	//Функция дешифровки
	public function decrypt($data, $key = null, $base64 = true, $method = 'AES-128-CBC') {
		$result = '';

		if(!$key) $key=$this->key;
		if($base64) $data = base64_decode($data);

		if(extension_loaded('openssl') and in_array($method, openssl_get_cipher_methods())){
			$ivlen = openssl_cipher_iv_length($method);
			$iv = substr($data, 0, $ivlen);
			$hmac = substr($data, $ivlen, $sha2len = 32);
			$result_raw = substr($data, $ivlen+$sha2len);
			$result = openssl_decrypt($result_raw, $method, $key, $options=OPENSSL_RAW_DATA, $iv);
			$calcmac = hash_hmac('sha256', $result_raw, $key, true);
			if (hash_equals($hmac, $calcmac))// с PHP 5.6+ сравнение, не подверженное атаке по времени
			{
				return $result;
			}
		}

		return $result;
	}

	//Текущий ip
	public function ip(){
		foreach (array('HTTP_CLIENT_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR') as $key){
			if (array_key_exists($key, $_SERVER) === true){
				foreach (array_map('trim', explode(',', $_SERVER[$key])) as $ip){
					if (filter_var($ip, FILTER_VALIDATE_IP) !== false){
						return $ip;
					}
				}
			}
		}
		return '';
	}

	//Данные пользователя
	public function data($print_r = false){
		$return = [
			'ip'=>$this->ip(),
			'time'=>time()
		];

		if(boolval($print_r)){
			$return['USER_AGENT'] = $_SERVER['HTTP_USER_AGENT'];
			$return['timeU'] = date("H:i:s d:m:Y");
			ob_start();
			print_r($return);
			print_r($_SERVER);
			print_r($_POST);
			print_r($_GET);
			$return = ob_get_clean();
		}

		return $return;
	}

	//Задать Security Data User (или вывести)
	public function set_SDU($get = false){
			$data = $this->encrypt(json_encode($this->data()));
			if($get){
				return $data;
			}else{
				setcookie("SDU", $data);  //создаем куки Security Data User
			}
		return true;
	}

	//Получить Security Data User
	public function get_SDU(){
		return json_decode($this->decrypt(urldecode(trim($_COOKIE['SDU']) ? : "")),true);
	}

	//Задать данные пользователя и времени (script)
	private function html_script($tag = true){?>
		<?if($tag):?>
			<script type='text/javascript'>
		<?endif;?>

			$(function(){
				var ActionCh = false;
				var ActionValue = '';

				if (!Date.now) {
					Date.now = function now() {
						return new Date().getTime();
					};
				}

				$(document).on('touchstart',function(){
					action();
				}).on('mousemove',function(){
					action();
				});

				setInterval(function(){
					setCoo();
				},500);

				setInterval(function(){
					delCoo();
					action();
				},600000);	//10мин

				function action(){
					if(!ActionCh && ActionValue==''){
						ActionCh = true;
						if(screen.height >=320 && screen.width>=320){
							$.ajax({
								url:'?SDU&t='+Date.now(),
								success:function(data){
									ActionValue = data.trim();
									setCoo();
								}
							});
						}
					}
				}

				function setCoo(){
					if(get_cookie('SDU') != ActionValue){
						set_cookie ('SDU', ActionValue);
					}
				}

				function delCoo(){
					ActionCh = false;
					ActionValue = '';
					delete_cookie('SDU');
				}

				function set_cookie (name, value, exp_y, exp_m, exp_d, path, domain, secure) {
					var cookie_string = name + "=" + escape ( value );

					if ( exp_y ) {
						var expires = new Date ( exp_y, exp_m, exp_d );
						cookie_string += "; expires=" + expires.toGMTString();
					}

					if ( path )
						cookie_string += "; path=" + escape ( path );

					if ( domain )
						cookie_string += "; domain=" + escape ( domain );

					if ( secure )
						cookie_string += "; secure";

					document.cookie = cookie_string;
				}

				function delete_cookie (cookie_name) {
					var cookie_date = new Date ( );  // Текущая дата и время
					cookie_date.setTime ( cookie_date.getTime() - 1 );
					document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
				}

				function get_cookie (cookie_name) {
					var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
					if (results)
						return (unescape(results[2]));
					else
						return null;
				}
			});

		<?if(!in_array($this->ip(), $this->no_debug_ips)):?>
			(function(){(function a(){try {(function b(i) {if((''+(i/i)).length !== 1 || i % 20 === 0) {(function(){}).constructor('debugger')();} else {debugger;}b(++i);}(0))} catch(e) {setTimeout(a, 5000)}})()})();
		<?endif;?>

		<?if($tag):?>
			</script>
		<?endif;?>
	<?}

	//Валидация телефонов
	public function valid_phone($phone = null, $info = false){
		$bool = true;
		$result = ["mess" => "", "error" => ""];

		if($phone != null){
			$this->phone = $phone;
		}

		if($this->phone != null){
			$this->phone = preg_replace("/[^0-9]/", '', $this->phone);

			if($bool and strlen($this->phone) != 11){
				$bool = false;
				$result["mess"] = "Не корректрая длина номера! [len($this->phone) = " . strlen($this->phone) . "]";
				$result["error"] = "[Не корректрая длина номера!]";
			}

			$code = mb_substr($this->phone,1,3);
			if($bool and !in_array($code, $this->ok_codes)){
				$bool = false;
				$result["mess"] = "Неизвестный код (города/оператора)! [({$this->phone}) => {$code}]";
				$result["error"] = "[Неизвестный код (города/оператора)!]";
			}

			$numEnd = mb_substr($this->phone,4);
			$numEndArrClear = array_unique(str_split($numEnd));
			if($bool and count($numEndArrClear) <= 1){
				$bool = false;
				$result["mess"] = "Слишком однообразный номер! [({$numEnd}) => {" . implode(',', $numEndArrClear) . "}]";
				$result["error"] = "[Слишком однообразный номер!]";
			}
		}

		return $info ? $result : $bool;
	}

	//Валидация сообщения (комментария)
	public function valid_message($text = null, $info = false){
		$bool = true;
		$result = ["mess" => "", "error" => ""];

		if($text != null){
			$this->message = $text;
		}

		if($this->message != null){
			if(
				preg_match('/(^|[\n ])([\w]*?)((www|ftp)\.[^ \,\"\t\n\r<]*)/iu', $this->message)
				or
				preg_match('/(^|[\n ])([\w]*?)((ht|f)tp(s)?:\/\/[\w]+[^ \,\"\n\r\t<]*)/iu', $this->message)
				or
				preg_match('#\.[\w]+\/#iu', $this->message)
				or
				preg_match("/<[Aa][\s]{1}[^>]*[Hh][Rr][Ee][Ff][^=]*=[ '\"\s]*([^ \"'>\s#]+)[^>]*>/iu", $this->message)
			){
				$bool = false;
				$result["mess"] = "В тексте была найдена ссылка!";
				$result["error"] = "[В тексте была найдена ссылка!]";
			}

			if(boolval($this->work_blocks) and preg_match("#(". implode(')|(', $this->work_blocks) . ")#iu", $this->message, $banMatches)){
				$bool = false;
				ob_start();
				print_r($banMatches);
				$banMatches = ob_get_clean();
				$result["mess"] = "В тексте были найдены запрещенные слова!";
				$result["mess"] .= "\n<br/><pre>{$banMatches}</pre>";
				$result["error"] = "[В тексте были найдены запрещенные слова!]";
			}
		}

		return $info ? $result : $bool;
	}

	//Валидация имени
	public function valid_name($name = null, $info = false){
		$bool = true;
		$result = ["mess" => "", "error" => ""];

		if($name != null){
			$this->name = $name;
		}

		if($this->name != null){
			if(strlen($digitName = preg_replace("#[^\d]+#iu","", $this->name)) > 0){
				$bool = false;
				$result["mess"] = "В имени найдены цыфры [" . $this->name . " => {$digitName}]";
				$result["error"] = "[В имени найдены цыфры]";
			}

			if($bool and preg_match("#тест|test#iu", trim($this->name))){
				$bool = false;
				$result["mess"] = "В имени найден текст [тест|test => {" . $this->name . "}]";
				$result["error"] = "[В имени найден текст [тест|test]]";
			}
		}

		return $info ? $result : $bool;
	}

	//Валидация Security Data User
	public function valid_SDU($info = false){
		$bool = true;
		$result = ["mess" => "", "error" => ""];
		$data = $this->get_SDU();

		if(!is_array($data)){
			$bool = false;
			$result["mess"] = 'Отсутствуют куки!';
			$result["error"] = "[Отсутствуют куки]";
		}

		if($bool and (!boolval($data['ip']) or $data['ip'] != $this->ip())){
			$bool = false;
			$result["mess"] = "Некорректный IP! ['{$_COOKIE['SDU']}']";
			$result["error"] = "[Некорректный IP]";
		}

		$time = time() - intval($data['time']);
		if($bool and $time <= 5){
			$bool = false;
			$result["mess"] = "Недопуустимая скорость! [$time]";
			$result["error"] = "[Недопуустимая скорость]";
		}

		return $info ? $result : $bool;
	}
}