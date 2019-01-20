<?php
/**
 * Created by PhpStorm.
 * User: ReiV
 * Date: 12.01.2019
 * Time: 11:28
 */

/**
 * Class DB_Helper
 * Класс работы с базой данных
 * использует PDO
 */

class DB_Helper{
	private $db_host = 'localhost';		//хост
	private $db_name = null;			//имя базы данных
	private $db_login = null;			//логин
	private $db_password = null;		//пароль
	private $db_prefix = '';			//Префикс таблиц базы данных
	private $db = null;					//класс базы данных


	public function __construct($name = '', $login = '', $password = '', $host = 'localhost'){
		if(boolval($host)){
			$this->db_host = $host;
		}

		if(boolval($name)){
			$this->db_name = $name;
		}

		if(boolval($login)){
			$this->db_login = $login;
		}

		if(boolval($password)){
			$this->db_password = $password;
		}

		if($this->db_name and $this->db_login){
			$this->set_db();
		}
	}


	public function set_host($host){
		$this->db_host = $host;
	}

	public function set_name($name){
		$this->db_name = $name;
	}

	public function set_login($login){
		$this->db_login = $login;
	}

	public function set_password($password){
		$this->db_password = $password;
	}

	public function set_prefix($prefix){
		$this->db_prefix = $prefix;
	}

	public function set_db(){
		if(!boolval($this->db_host)) die('Укажите хост базы данных!');
		if(!boolval($this->db_name)) die('Укажите имя базы данных!');
		if(!boolval($this->db_login)) die('Укажите логин базы данных!');
//		if(!boolval($this->db_password)) die('Укажите пароль базы данных!');

		try {
			$this->db = new PDO("mysql:host={$this->db_host};dbname={$this->db_name};charset=UTF8", $this->db_login, $this->db_password, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC));
			$this->db_host = null;
			$this->db_name = null;
			$this->db_login = null;
			$this->db_password = null;
		} catch (PDOException $e) {
			die("Error!: " . $e->getMessage());
		}
	}

	public function get_db(){
		return $this->db;
	}

	private function debug($data){
		echo "<pre>";
		print_r($data);
		echo "</pre>";
	}

	public function get_data($src, $key = 'id'){
		$func_get_args = func_get_args();
		if(is_string($src)){
			if(strpos($func_get_args[0], '-')){ # Разделитель  - (тире) считается разделителем для раздела
				$func_get_args[0] = $this->db_prefix . implode("_", explode("-", $func_get_args[0]));
			}else if(!preg_match("#^{$this->db_prefix}.*#iu", $func_get_args[0])){ # Если имя таблицы не начинается с префика
				$func_get_args[0] = "{$this->db_prefix}{$func_get_args[0]}";
			}
		}
		return call_user_func_array([$this, 'get_data_query'], $func_get_args);
	}

	private function get_data_query($src, $key = 'id'){
		$purpose = $keys = $result = [];
		$func_get_args = func_get_args();
		$IdName = "id";

//		$this -> debug($func_get_args);

		foreach(array_slice($func_get_args, 1) as $a){
			if(is_string($a)){
				if(preg_match('#^\[.*\]$#',trim($a))){
					$a = array_flip(preg_split('#\s*,\s*#', preg_replace('#^\[|\]$#','',trim($a))));
				}
			}

			if(is_numeric($a) || is_array($a) || is_bool($a) || empty($a)){
				if($a === true){ 													# Удаляем условие на выборку (любые условия)
					array_splice($keys, count($purpose), 1);
				}else if(is_array($a)){
					$purpose[] = $a;
				}else if(is_null($a)){
					$purpose[] = null;
				}else{
					$purpose[] = $a;
				}
			}else{
				if(!empty($purpose)){
					$field = $a;
				}else{
					$keys[] = $a;
				}
			}
		}

		if(is_string($src)){
			$where = array_map(
				function($key, $val){
					if(is_null($val)){
						return "`{$key}` IS NULL";
					}elseif(is_array($val)){
						return "(`{$key}` IN (". $this->in(array_diff_key($val, array_flip(['NULL']))). ")". (array_key_exists('NULL', $val) ? " OR (`{$key}` IS NULL)" : ""). ")";
					}else{
						return "`{$key}`=" . intval($val);
					}
				}, array_intersect_key($keys, $purpose), array_intersect_key($purpose, $keys)
			);

			$sql = "SELECT * FROM `{$src}`" . ($where ? " WHERE " . implode(" AND ", $where) : "");
			$result = $this->query($sql);
			$this -> debug($sql);
		}

		$this -> debug($result);
		return $result;
	}


	/**
	 * Формирует из массива строку с перечисляемыми ключами для подставки в запрос
	 * @param $ar
	 * @param bool $flip
	 *
	 * @return string
	 */
	private function in($ar, $flip = false){
		if(!is_array($ar) || empty($ar)){
			$ar = array(0);
		}else if($flip){
			$ar = array_flip($ar);
		}
		return implode(",", array_map(
			function($key){return (is_numeric($key) || ($key == "NULL")) ? $key : 0;},
			array_keys($ar))
		);
	}

	/**
	 * Выполнение запроса к базе данных. В случае превышения лимита времени кеширование результата. Возвращается список записей в нормальной форме
	 * @param $sql
	 *
	 * @return mixed
	 */
	public function query($sql){
		return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
	}

}