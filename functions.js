/**
 *Формирует массив $_GET (window.$_GET)
 */
function _GET(){
	var search = location.search.substr(1).split("&");
	window.$_GET = {};
	for(k in search){
		search[k] = search[k].split("=");
		window.$_GET[search[k][0]] = search[k][1];
	}
}

/**
 * Кодирует данные в формат MIME base64
 * @param str - строка для кодирования
 * @returns {string}
 */
function b64EncodeUnicode(str) {
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
		function toSolidBytes(match, p1) {
			return String.fromCharCode('0x' + p1);
		}));
}

/**
 * Декодирует данные, закодированные MIME base64
 * @param str - строка для декодирования
 * @returns {string}
 */
function b64DecodeUnicode(str) {
	return decodeURIComponent(atob(str).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
}

/**
 * Просто сокращение console.log
 */
var log = console.log;

/**
 * Получаем выделенный текст на странице
 * @returns {string}
 */
function getSelectedText() {
	var text = '';
	if (window.getSelection) {
		text = window.getSelection().toString();
	} else if (document.selection) {
		text = document.selection.createRange().text;
	}
	return text;
}

/**
 * Функция вставляет полученное значение
 * при этом не сбивается положение курсора
 * @param obj - объект для вставки
 * @param value - подставляемое значение
 * @param k - коэффициен на который требуется уменьшить положение курсора
 */
function onInputCangeValue(obj,value,k){
	var realPos = getCaret(obj) - k;
	$(obj).val(value);
	cursorPointToInput(obj, realPos);
}

/**
 * Устанавливает курсор в поле ввода в нужное положение
 * @param input - объект
 * @param point - положение курсора
 */
function cursorPointToInput(input,point) {
	window.setTimeout(function() {
		input.setSelectionRange(point,point);
	}, 0);
}

/**
 * Получает положение курсора в поле ввода
 * @param el - объект
 * @returns {*}
 */
function getCaret(el) {
	if (el.selectionStart) {
		return el.selectionStart;
	} else if (document.selection) {
		el.focus();
		var r = document.selection.createRange();
		if (r == null) {
			return 0;
		}
		var re = el.createTextRange(),
			rc = re.duplicate();
		re.moveToBookmark(r.getBookmark());
		rc.setEndPoint('EndToStart', re);
		return rc.text.length;
	}
	return 0;
}

/**
 * форматирование числовых значений аналог php
 * @param number - форматируемое число
 * @param decimals - устанавливает число знаков после запятой
 * @param dec_point - устанавливает разделитель дробной части
 * @param thousands_sep - устанавливает разделитель тысяч
 * @returns {string}
 */
function number_format (number, decimals, dec_point, thousands_sep) {
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
		s = '',
		toFixedFix = function (n, prec) {
			var k = Math.pow(10, prec);
			return '' + Math.round(n * k) / k;
		};
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
}

/**
 * Форматирует вывод системной даты/времени
 * @param format - формат даты
 * @param timestamp - временная метка
 * @returns {*}
 */
function date( format, timestamp ){
	//
	// +   original by: Carlos R. L. Rodrigues
	// +	  parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
	// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   improved by: MeEtc (http://yass.meetcweb.com)
	// +   improved by: Brad Touesnard
	/*
		<?php
			date_default_timezone_set('Europe/Moscow');
			$time1 = '26.10.2014 00:59:59';
			$time2 = '27.10.2014 00:00:00';
			echo strtotime($time1);
			echo "\n";
			echo strtotime($time2);
			echo "\n";
			echo (strtotime($time2)-strtotime($time1))/3600;
		?>
	*/
	timestamp = timestamp ? parseInt(timestamp) * 1000 : new Date().getTime();
	if(timestamp == 0 ) return "";
	if(timestamp < 1414274400000)//'26.10.2014 01:00:00'
		timestamp += 3600000; //смотреть php комментарий
	var a, jsdate = new Date(timestamp);
	var pad = function(n, c){
		if( (n = n + "").length < c ) {
			return new Array(++c - n.length).join("0") + n;
		} else {
			return n;
		}
	};
	var txt_weekdays = ["Sunday","Monday","Tuesday","Wednesday", "Thursday","Friday","Saturday"];
	var txt_ordin = {1:"st",2:"nd",3:"rd",21:"st",22:"nd",23:"rd",31:"st"};
	var txt_months =  ["", "Янв", "Фев", "Мрт", "Апр","Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Нбр","Дек"];

	var f = {
		// Day
		d: function(){
			return pad(f.j(), 2);
		},
		D: function(){
			t = f.l(); return t.substr(0,3);
		},
		j: function(){
			return jsdate.getDate();
		},
		l: function(){
			return txt_weekdays[f.w()];
		},
		N: function(){
			return f.w() + 1;
		},
		S: function(){
			return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th';
		},
		w: function(){
			return jsdate.getDay();
		},
		z: function(){
			return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
		},

		// Week
		W: function(){
			var a = f.z(), b = 364 + f.L() - a;
			var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

			if(b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b){
				return 1;
			} else{

				if(a <= 2 && nd >= 4 && a >= (6 - nd)){
					nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
					return date("W", Math.round(nd2.getTime()/1000));
				} else{
					return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
				}
			}
		},

		// Month
		F: function(){
			return txt_months[f.n()];
		},
		m: function(){
			return pad(f.n(), 2);
		},
		M: function(){
			t = f.F(); return t.substr(0,3);
		},
		n: function(){
			return jsdate.getMonth() + 1;
		},
		t: function(){
			var n;
			if( (n = jsdate.getMonth() + 1) == 2 ){
				return 28 + f.L();
			} else{
				if( n & 1 && n < 8 || !(n & 1) && n > 7 ){
					return 31;
				} else{
					return 30;
				}
			}
		},

		// Year
		L: function(){
			var y = f.Y();
			return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
		},
		//o not supported yet
		Y: function(){
			return jsdate.getFullYear();
		},
		y: function(){
			return (jsdate.getFullYear() + "").slice(2);
		},

		// Time
		a: function(){
			return jsdate.getHours() > 11 ? "pm" : "am";
		},
		A: function(){
			return f.a().toUpperCase();
		},
		B: function(){
			// peter paul koch:
			var off = (jsdate.getTimezoneOffset() + 60)*60;
			var theSeconds = (jsdate.getHours() * 3600) +
				(jsdate.getMinutes() * 60) +
				jsdate.getSeconds() + off;
			var beat = Math.floor(theSeconds/86.4);
			if (beat > 1000) beat -= 1000;
			if (beat < 0) beat += 1000;
			if ((String(beat)).length == 1) beat = "00"+beat;
			if ((String(beat)).length == 2) beat = "0"+beat;
			return beat;
		},
		g: function(){
			return jsdate.getHours() % 12 || 12;
		},
		G: function(){
			return jsdate.getHours();
		},
		h: function(){
			return pad(f.g(), 2);
		},
		H: function(){
			return pad(jsdate.getHours(), 2);
		},
		i: function(){
			return pad(jsdate.getMinutes(), 2);
		},
		s: function(){
			return pad(jsdate.getSeconds(), 2);
		},
		//u not supported yet

		// Timezone
		//e not supported yet
		//I not supported yet
		O: function(){
			var t = pad(Math.abs(jsdate.getTimezoneOffset()/60*100), 4);
			if (jsdate.getTimezoneOffset() > 0) t = "-" + t; else t = "+" + t;
			return t;
		},
		P: function(){
			var O = f.O();
			return (O.substr(0, 3) + ":" + O.substr(3, 2));
		},
		//T not supported yet
		//Z not supported yet

		// Full Date/Time
		c: function(){
			return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
		},
		//r not supported yet
		U: function(){
			return Math.round(jsdate.getTime()/1000);
		}
	};

	return format.replace(/[\\]?([a-zA-Z])/g, function(t, s){
		if( t!=s ){
			// escaped
			ret = s;
		} else if( f[s] ){
			// a date function exists
			ret = f[s]();
		} else{
			// nothing special
			ret = s;
		}

		return ret;
	});
}

/**
 * Подсчитывает количество элементов массива или что-то в объекте
 * @param o - массив или объект
 * @returns {number}
 */
function count(o){
	var c=0;
	for (var k in o)
		if(o.hasOwnProperty(k))
			++c;
	return c;
}

/**
 * Есть ли метод
 * @param obj - объект
 * @returns {boolean}
 */
function ifIssetMetods(obj){
	for(var m in obj)
		if(typeof obj[m] == "function")
			return true;
	return false;
}

/**
 * Возвращает логическое значение переменной
 * @param data
 * @returns {*}
 */
function boolval(data){
	var res;
	switch(typeof(data)) {
		case 'number':
			res =  (data == 0 || isNaN(data)) ? false : true;
			break;
		case 'string':
			res =  (data === '' || data === '0') ? false : true;
			break;
		case 'object':
			if((ifIssetMetods(data))){ //это объект с методами
				res =  true;
			}else{
				try{
					res = boolval(parseInt(data['length'])) ? true : boolval(count(data));
				}catch(e){
					res =  boolval(count(data));
				}
			}
			break;
		default:
			res = !!data;
			break
	}
	return res;
}

/**
 * Получить название страницы
 * @param AndGet
 * @returns {*}
 * @constructor
 */
function GetPageName(AndGet = false){
	if(boolval(AndGet))
		var path = window.location.href;
	else
		var path = window.location.pathname;
	return path.split("/").pop();
}

/**
 * Время из секунд
 * @param sek - колличество секунд
 * @returns {string}
 */
function getTime(sek){
	sek = parseInt(sek);
	var result = "";
	if(boolval(sek)){
		var h = Math.floor(sek/(60*60));
		var i = Math.floor((sek%(60*60))/60);
		h = h<10 ? '0'+h : h;
		i = i<10 ? '0'+i : i;
		result = h + ":" + i;
	}
	return result;
}

/**
 * Возвращает все или некоторое подмножество ключей массива
 * @param input - массив, содержащий возвращаемые ключи
 * @param search_value - если указано, будут возвращены только ключи, содержащие данное значение
 * @param strict - определяет использование строгой проверки на равенство (===) при поиске
 * @returns {Array}
 */
function array_keys( input, search_value, strict ) {
	var tmp_arr = new Array(), strict = !!strict, include = true, cnt = 0;
	for ( key in input ){
		include = true;
		if ( search_value != undefined ) {
			if( strict && input[key] !== search_value ){
				include = false;
			} else if( input[key] != search_value ){
				include = false;
			}
		}
		if( include ) {
			tmp_arr[cnt] = key;
			cnt++;
		}
	}
	return tmp_arr;
}

/**
 * Если массив
 * @param Var - данные
 * @returns {boolean}
 */
function is_array(Var){
	if(Var.constructor === Array){
		return true;
	}else if(Var.constructor === Object){
		return count(array_keys(Var))===count(Var);
	}else{
		return false;
	}
}

/**
 * Получает значение из массива по ключю
 * @param Var
 * @param path
 * @param Else
 * @param ElseIsFunction
 * @returns {*}
 */
function get(Var, path, Else=false, ElseIsFunction=false){
	if(boolval(ElseIsFunction)){
		var ElseF = Else;
		Else = function(){return ElseF;};
	}
	if(boolval(Var) && is_array(path)){
		var result = Var;
		for(detI in path){
			if(result[path[detI]]!=undefined){
				result = result[path[detI]];
			}else{
				return Else;
			}
		}
		return result;
	}else{
		return Else;
	}
}

/**
 * Если целое число
 * @param num
 * @returns {boolean}
 */
function isInteger(num) {
	return (num ^ 0) === num;
}

/**
 * Формат телефона из набора вида 99999999999 в +9(999)999-99-99
 * @param p - телефон (строка)
 * @param add - добавочный
 * @param sep - разделитель
 * @returns {*}
 */
function dPhone(p, add = false, sep = ""){
	p = String(p);
	if(boolval(p)){
		return '+'
			+get(p,[0],'')
			+sep
			+'('
			+get(p,[1],'')
			+get(p,[2],'')
			+get(p,[3],'')
			+')'
			+sep
			+get(p,[4],'')
			+get(p,[5],'')
			+get(p,[6],'')
			+'-'
			+get(p,[7],'')
			+get(p,[8],'')
			+'-'
			+get(p,[9],'')
			+get(p,[10],'')
			+ (boolval(add) ? ' ['+add+']' : '');
	}else{
		return "";
	}
}

/**
 * Функция изменения/возвращения значения у объекта с событием change
 * Поумолчанию экшен всегда срабатывает [action=true] (можно отключить)
 * Поумолчанию если значение новое и старое равно то замену не делаю и экшен не срабатывает [ifEqually=false]
 * @param value
 * @param action
 * @param ifEqually
 * @returns {*}
 * @constructor
 */
$.fn.ValDF = function(value=null, action=true, ifEqually=false){

	//Определяем мктоды работы с разными объектами
	function _getСheck_(obj){return obj.prop("checked");}
	function _setСheck_(obj,data){obj.prop("checked",boolval(data));}
	function _equallyСheck_(obj,data){return (_getСheck_(obj)==boolval(data));}

	function _getVal_(obj){return obj.val();}
	function _setVal_(obj,data){obj.val(data);}
	function _equallyVal_(obj,data){return (""+_getVal_(obj)==""+data);}

	function _getAttr_(obj){return htmlspecialchars_decode(""+obj.attr('value'));}
	function _setAttr_(obj,data){htmlspecialchars(""+obj.attr('value',data));}
	function _equallyAttr_(obj,data){return (""+_getAttr_(obj)==""+data);}

	function Undefined(){return '';}

	//переключатель
	//определяет тип объекта и в зависимости от этого
	//возвращает массив с ссылками на ранее определенные методы
	function Switch(obj){
		var tagName = get(obj,[0,'tagName'],'');
		//если это поле ввода или выпадающий список
		if(tagName.match(/^(input|select|textarea)$/gi)){
			var type = get(obj,[0,'type'],'');
			if(type.match(/^checkbox$/gi)){
				//если это ГАЛОЧКА
				return {get:_getСheck_,set:_setСheck_,equally:_equallyСheck_};
			}else if(type.match(/^radio$/gi)){
				//если это ПЕРЕКЛЮЧАТЕЛЬ
				return {get:_getVal_,set:_setСheck_,equally:_equallyСheck_};
			}else{
				//Остальные формы ввода
				return {get:_getVal_,set:_setVal_,equally:_equallyVal_};
			}
		}else if(obj.attr('value')!=undefined){
			//любые элементы где есть атрибут value
			return {get:_getAttr_,set:_setAttr_,equally:_equallyAttr_};
		}else{
			return {get:Undefined,set:_setAttr_,equally:_equallyAttr_};
		}
	}

	if(value!=null){
		for(vdfi=0; vdfi < count(this); vdfi++){
			if(typeof(this[vdfi])=='object'){
				var Obj = $(this[vdfi]);
				var functions = Switch(Obj);
				var val = functions.get(Obj);
				if(!functions.equally(Obj,value) || ifEqually){
					functions.set(Obj,value);
					if(action) Obj.change();
				}
			}
		}
		return $(this);
	}else{
		var functions = Switch($(this[0]));
		return functions.get($(this[0]));
	}

};


/**
 * Заменяет значения в строке из find на replace
 * @param find
 * @param replace
 * @returns {String}
 */
String.prototype.replaceArray = function(find, replace) {
	var replaceString = this;
	var regex;
	for (var i = 0; i < find.length; i++) {
		regex = new RegExp(find[i], "gi");
		replaceString = replaceString.replace(regex, replace[i]);
	}
	return replaceString;
};

/**
 * Проверка на корректность json строки
 * @param string
 * @returns {boolean}
 */
function is_json(string){
	try{
		JSON.parse(string);
		return true;
	}catch(e){
		return false
	}
}

/**
 * Соедиение массива в строку
 * @param glue - соединитель
 * @param pieces - массив
 * @returns {string}
 */
function implode( glue, pieces ) {
	pieces = array_values(pieces);
	return ( ( pieces instanceof Array ) ? pieces.join ( glue ) : pieces );
}

/**
 * Выбирает все значения массива
 * @param input - массив
 * @returns {Array}
 */
function array_values( input ) {
	var tmp_arr = [], cnt = 0;
	for ( key in input ){
		tmp_arr[cnt] = input[key];
		cnt++;
	}
	return tmp_arr;
}

/**
 * Проверяет, присутствует ли в массиве значение
 * @param needle - искомое значение
 * @param haystack - массив
 * @param strict - Если третий параметр strict установлен в TRUE, тогда функция in_array() также проверит соответствие типов параметра needle и соответствующего значения массива haystack
 * @returns {boolean}
 */
function in_array(needle, haystack, strict) {
	var found = false, key, strict = !!strict;
	for (key in haystack) {
		if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
			found = true;
			break;
		}
	}
	return found;
}

/**
 * Вычисляет сумму значений массива
 * @param array - массив
 * @returns {*}
 */
function array_sum(array){
	var key, sum=0;
	if( !array || (array.constructor !== Array && array.constructor !== Object) || !array.length ){
		return null;
	}
	for(var key in array){
		sum += array[key];
	}
	return sum;
}

/**
 * Если массив
 * @param Var - массив
 * @returns {boolean}
 */
function is_array(Var){
	if(Var.constructor === Array){
		return true;
	}else if(Var.constructor === Object){
		return count(array_keys(Var))===count(Var);
	}else{
		return false;
	}
}

/**
 * Преобразует специальные символы в HTML-сущности
 * @param string - Конвертируемая строка
 * @param quoteStyle - Битовая маска из нижеуказанных флагов, определяющих режим обработки кавычек, некорректных кодовых последовательностей и используемый тип документа
 * @param charset - Необязательный аргумент, определяющий кодировку, используемую при конвертации симоволов
 * @param doubleEncode
 * @returns {XML|*}
 */
function htmlspecialchars (string, quoteStyle, charset, doubleEncode) {
	var optTemp = 0;
	var i = 0;
	var noquotes = false;
	if (typeof quoteStyle === 'undefined' || quoteStyle === null) {
		quoteStyle = 2
	}
	string = string || '';
	string = string.toString();

	if (doubleEncode !== false) {
		// Put this first to avoid double-encoding
		string = string.replace(/&/g, '&amp;')
	}

	string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

	var OPTS = {
		'ENT_NOQUOTES': 0,
		'ENT_HTML_QUOTE_SINGLE': 1,
		'ENT_HTML_QUOTE_DOUBLE': 2,
		'ENT_COMPAT': 2,
		'ENT_QUOTES': 3,
		'ENT_IGNORE': 4
	};
	if (quoteStyle === 0) {
		noquotes = true
	}
	if (typeof quoteStyle !== 'number') {
		// Allow for a single string or an array of string flags
		quoteStyle = [].concat(quoteStyle);
		for (i = 0; i < quoteStyle.length; i++) {
			// Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
			if (OPTS[quoteStyle[i]] === 0) {
				noquotes = true
			} else if (OPTS[quoteStyle[i]]) {
				optTemp = optTemp | OPTS[quoteStyle[i]]
			}
		}
		quoteStyle = optTemp
	}
	if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
		string = string.replace(/'/g, '&#039;')
	}
	if (!noquotes) {
		string = string.replace(/"/g, '&quot;')
	}

	return string
}

/**
 * Преобразует специальные HTML-сущности обратно в соответствующие символы
 * @param string
 * @param quoteStyle
 * @returns {void|XML|*}
 */
function htmlspecialchars_decode (string, quoteStyle) { // eslint-disable-line camelcase
	var optTemp = 0;
	var i = 0;
	var noquotes = false;

	if (typeof quoteStyle === 'undefined') {
		quoteStyle = 2
	}
	string = string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
	var OPTS = {
		'ENT_NOQUOTES': 0,
		'ENT_HTML_QUOTE_SINGLE': 1,
		'ENT_HTML_QUOTE_DOUBLE': 2,
		'ENT_COMPAT': 2,
		'ENT_QUOTES': 3,
		'ENT_IGNORE': 4
	};
	if (quoteStyle === 0) {
		noquotes = true
	}
	if (typeof quoteStyle !== 'number') {
		// Allow for a single string or an array of string flags
		quoteStyle = [].concat(quoteStyle);
		for (i = 0; i < quoteStyle.length; i++) {
			// Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
			if (OPTS[quoteStyle[i]] === 0) {
				noquotes = true
			} else if (OPTS[quoteStyle[i]]) {
				optTemp = optTemp | OPTS[quoteStyle[i]]
			}
		}
		quoteStyle = optTemp
	}
	if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
		// PHP doesn't currently escape if more than one 0, but it should:
		string = string.replace(/&#0*39;/g, "'");
		// This would also be useful here, but not a part of PHP:
		// string = string.replace(/&apos;|&#x0*27;/g, "'");
	}
	if (!noquotes) {
		string = string.replace(/&quot;/g, '"');
	}
	// Put this in last place to avoid escape being double-decoded
	string = string.replace(/&amp;/g, '&');

	return string
}

/**
 *	Выводит удобочитаемую информацию о переменной
 * @param arr
 * @param level
 * @returns {string}
 */
function print_r(arr, level) {
	var print_red_text = "";
	if(!level) level = 0;
	var level_padding = "";
	for(var j=0; j<level+1; j++) level_padding += "    ";
	if(typeof(arr) == 'object') {
		for(var item in arr) {
			var value = arr[item];
			if(typeof(value) == 'object') {
				print_red_text += level_padding + "'" + item + "' :\n";
				print_red_text += print_r(value,level+1);
			}
			else
				print_red_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
		}
	}

	else  print_red_text = "===>"+arr+"<===("+typeof(arr)+")";
	return print_red_text;
}

/**
 * Вызывает callback-функцию с массивом параметров
 * @param cb
 * @param parameters
 * @returns {*}
 */
function call_user_func_array (cb, parameters) {
	var $global = (typeof window !== 'undefined' ? window : global);
	var func;
	var scope = null;

	var validJSFunctionNamePattern = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;

	if (typeof cb === 'string') {
		if (typeof $global[cb] === 'function') {
			func = $global[cb]
		} else if (cb.match(validJSFunctionNamePattern)) {
			func = (new Function(null, 'return ' + cb)()) // eslint-disable-line no-new-func
		}
	} else if (Object.prototype.toString.call(cb) === '[object Array]') {
		if (typeof cb[0] === 'string') {
			if (cb[0].match(validJSFunctionNamePattern)) {
				func = eval(cb[0] + "['" + cb[1] + "']") // eslint-disable-line no-eval
			}
		} else {
			func = cb[0][cb[1]]
		}

		if (typeof cb[0] === 'string') {
			if (typeof $global[cb[0]] === 'function') {
				scope = $global[cb[0]]
			} else if (cb[0].match(validJSFunctionNamePattern)) {
				scope = eval(cb[0]) // eslint-disable-line no-eval
			}
		} else if (typeof cb[0] === 'object') {
			scope = cb[0]
		}
	} else if (typeof cb === 'function') {
		func = cb
	}

	if (typeof func !== 'function') {
		throw new Error(func + ' is not a valid function')
	}

	return func.apply(scope, parameters)
}
