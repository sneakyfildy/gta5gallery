<?php
$path = '/var/www/vhosts/feeldeeng.v.shared.ru/httpdocs/include';
set_include_path(get_include_path() . PATH_SEPARATOR . $path);
require 'htmlInserts.inc';
?>
<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js"><!--<![endif]-->
    <head>
        <title>GTA V photo gallery. By Sneakyfildy.</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        
        <link rel="stylesheet" href="/css/vendor/normalize.min.css">
        <link rel="stylesheet" href="/css/vendor/h5bp.css">
        <link rel="stylesheet" href="css/styles.css">
        <link rel="stylesheet" href="css/imgviewer.css">

        <?php echo insertModernMinJS(); ?>
        <script type="text/javascript" src="/js/myplugins/sneaky-lazy-render-1.0.js"></script>
		<script type="text/javascript" src="/js/myplugins/sneaky-odometrize-1.0.js"></script>
		
        <script type="text/javascript" src="js/main.js"></script>
        <script type="text/javascript" src="js/gallery.js"></script>
    </head>
    <body class="centered">
    <div class="content">
    <div id="welcome">Sneakyfildy's GTA V photo gallery. Just in case.</div>
    <div class="galerize-wrap">
        <div id="gallery" class="clearfix sneaky-galerize">
            <?php
                $photos = Array();
                $handle = opendir('photos');
                if ($handle) {
                    while ( false !== ( $entry = readdir($handle) ) ) {
                        if ($entry != "." && $entry != "..") {
                            array_push($photos, Array(
                                'path'      => $entry
                                ,'inc'      => intval($entry)
                            ));
                        }
                    }
                    closedir($handle);
                }

                $photosHtml = '';
                $photoTmpl = '<a class="image galerize" href="{realsrc}">
                    <img src="img/placeholder.gif"
                    class="slr"
                    data-src="{src2}"
                    width="{width}"
                    height="{height}"
                    data-width="{data-width}"
                    data-height="{data-height}"
                    realwidth="{realwidth}"
                    realheight="{realheight}"
                    ratio="{ratio}"
                    realratio="{realratio}"
                    /></a>';
                
                function cmp($a, $b){
                    if ($a['inc'] == $b['inc']) {
                        return 0;
                    }
                    return ($a['inc'] < $b['inc']) ? -1 : 1;
                }

                usort($photos, 'cmp');
                for ($i = 0; $i < count($photos); $i++) {
                    $newLine = '';
                    $path = $photos[$i]['path'];
                    $realSrc = 'photos/' . $path;//$photos[$i];
                    $previwSrc = getPhotoSrc($realSrc);
                    $size = getPhotoSize($previwSrc);
                    $realSize = getPhotoSize($realSrc);
                    $size = calcSize($size, $realSize);

                    $newLine = str_replace('{realsrc}', $realSrc, $photoTmpl);
                    $newLine = str_replace('{src2}', $previwSrc, $newLine);

                    $newLine = str_replace('{width}', $size['width'], $newLine);
                    $newLine = str_replace('{height}', $size['height'], $newLine);

                    $newLine = str_replace('{data-width}', $size['width'], $newLine);
                    $newLine = str_replace('{data-height}', $size['height'], $newLine);

                    $newLine = str_replace('{realwidth}', $realSize['width'], $newLine);
                    $newLine = str_replace('{realheight}', $realSize['height'], $newLine);

                    $newLine = str_replace('{ratio}', $size['ratio'], $newLine);
                    $newLine = str_replace('{realratio}', $size['realratio'], $newLine);

                    $photosHtml .= $newLine;

                }
                echo $photosHtml;

                // ф-ция получения пути к изображению, сначала проверяется
                // наличие превью (исходный путь + нижнее подчеркивание)
                function getPhotoSrc($path){
                    $pathPreview = explode('.', $path);
                    $preLastIndex = count($pathPreview) - 2;
                    // если какая-то хрень с путем, то вернем его же во избежание
                    // (в нормальном пути должно быть минмиум 2 элемента - название и расширение)
                    // !!!следите!!!
                    if ( $preLastIndex < 0 ){                        
                        return $path;
                    }

                    // добавляем подчеркивание
                    $pathPreview[$preLastIndex] = $pathPreview[$preLastIndex] . '_';
                    $pathPreview = implode('.', $pathPreview);

                    // если такой файл существует, вернем его путь, иначе вернем изначальный путь
                    // (то есть превьюшки нет)
                    // !!!делайте превьюшки!!!
                    if ( file_exists($pathPreview) ){
                        return $pathPreview;
                    }else{
                        
                        return $path;
                    }
                }

                // ф-ция получения размера изображения
                function getPhotoSize($path){
                    $size = getimagesize($path);

                    return Array(
                        'width'     => $size[0],
                        'height'    => $size[1]
                    );
                }

                // ф-ция, подсчитывающая размер изображения после уменьшения
                // коэффициент считается от высоты,
                // !!! высота задана в коде php !!!
                function calcSize($size, $realSize){
                    $FIXED_HEIGHT = 200;

                    $aspect = $size['width'] / $size['height'];
                    $realAspect = $realSize['width'] / $realSize['height'];
                    $newWidth = $FIXED_HEIGHT * $aspect;

                    return Array(
                        'width'     => round($newWidth),
                        'height'    => $FIXED_HEIGHT,
                        'ratio'     => round($aspect, 3),
                        'realratio' => round($realAspect, 3)
                    );
                }
            ?>
        </div>
            </div>
    </div>
        <div class="all-mask"></div>
    </body>
</html>