<?php
$filename = '/tmp/airtime-live-info';  // define here the path and name of uploaded live-info file

header('Content-Type: text/javascript');
header("Expires: Thu, 01 Jan 1970 00:00:00 GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");

$callback = empty($_GET['callback']) ? null : $_GET['callback'];
$content = file_get_contents($filename);
$content = str_replace('***', $callback, $content);
echo $content;
?>
