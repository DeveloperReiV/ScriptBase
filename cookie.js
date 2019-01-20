/*Функция для установки куки
Установка куки станет проще, если мы напишем специальную функцию, 
которая будет выполнять простые операции, 
такие как перекодирование значений и построение строки document.cookie. 
Например:
*/
function set_cookie ( name, value, exp_y, exp_m, exp_d, path, domain, secure )
{
  var cookie_string = name + "=" + escape ( value );
 
  if ( exp_y )
  {
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
/*
Функция получает данные для куки в качестве аргументов, 
затем строит соответствующую строку и устанавливает куки.
Например, установка куки без срока хранения:
set_cookie ( "username", "Вася Пупкин" );
Установка куки со сроком хранения до 15 февраля 2011:
set_cookie ( "username", "Вася Пупкин", 2011, 01, 15 );
Установка куки со сроком хранения, доменом ruseller.com, использованием SSL, но без пути:
set_cookie ( "username", "Вася Пупкин", 2003, 01, 15, "",
             "ruseller.com", "secure" );
Функция для удаления куки.
Другая полезная функция для работы с куки представлена ниже.
Функция "удаляет" куки из браузера посредством установки срока хранения на одну секунду раньше текущего значения времени.
*/
 
function delete_cookie ( cookie_name )
{
  var cookie_date = new Date ( );  // Текущая дата и время
  cookie_date.setTime ( cookie_date.getTime() - 1 );
  document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}
/*
Для использования данной функции нужно только передать ей имя удаляемого куки: 
delete_cookie ( "username" );
Получение значения куки
Для того, чтобы получить значение предварительно установленного куки для текущего 
документа, нужно использовать свойство document.cookie: 
var x = document.cookie;
Таким образом возвращается строка, которая состоит из списка пар имя/значение, 
разделенных точкой с запятой для всех куки, которые действуют для текущего документа. 
Например: 
"username=Вася; password=abc123"
В данном примере 2 куки, которые были предварительно установлены: username, 
который имеет значение "Вася", и password, который имеет значение "abc123".
Функция для получения значения куки
Обычно, нам нужно только значение одного куки за один раз. Поэтому строка куки не удобна для использования! Здесь приводится функция, которая обрабатывает строку document.cookies, возвращет только то куки, которое представляет интерес в конкретный момент:
*/
 
function get_cookie ( cookie_name )
{
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}
/*
Данная функция использует регулярное выражение для поиска имени куки, 
которое представляет интерес, а затем возвращает значение, 
которое обработано функцией unescape() для перекодирования к нормальному символьному виду. 
(Если куки не найдено, возвращается значение null.)
Данная функция проста в использовании. Например, для возврата значения куки username: 
var x = get_cookie ( "username" );
*/