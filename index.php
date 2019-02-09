<?php
include "functions.php";
include "DB_Helper.php";
include "Security.php";

$Security = new Security();
pre($Security->valid_SDU(true));


?>

<html>
	<head>
		<meta charset="UTF-8" />
		<script src="jquery-1.12.4.min.js"></script>
		<script src="functions.js"></script>
		<script src="/?SDU_HtmlScript"></script>
	</head>
</html>