<?php
/**
 * Created by PhpStorm.
 * User: ReiV
 * Date: 12.01.2019
 * Time: 11:26
 */


/**
 * Возвращает ip пользователя
 * @return string
 */
function get_ip()
{
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

/**
 * Получает значения из массива по ключам
 * @param $ar - массив
 *
 * @return bool|mixed
 */
function get($ar){
	foreach(array_slice(func_get_args(), 1) as $key){
		if(!empty($ar) && is_array($ar) && (is_string($key) || is_numeric($key)) && array_key_exists($key, $ar)){
			$ar = $ar[ $key ];
		}else{ return false; }
	} return $ar;
}


function pre($data){
	$lines = false;
	$keys = array_keys($ar = array_slice($func_get_args = func_get_args(), -1, 1));
	if(is_bool($bool = $ar[max($keys)]) && ($lines = $bool)){
		$func_get_args = array_slice(func_get_args(), -1, 1);
	}

	$debug_backtrace = debug_backtrace();

	foreach($debug_backtrace as $k=>$v){
		if(true)
		{
			echo "<fieldset class='pre'><legend>[$k] {$v['file']}:{$v['line']} <b>{$v['function']}</b> ()</legend>";
		}else{
			echo "[$k] {$v['file']}:{$v['line']} <b>{$v['function']}</b> ()<br>";
		}
		foreach($v['args'] as $n=>$z){
			echo "<pre>"; print_r($z); echo "</pre>";
		}
		if(true) echo "</fieldset>";
	}

	return get(func_get_args(), 0);
}