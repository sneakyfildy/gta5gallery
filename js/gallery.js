(function($){
  var methods = {
    init                : function( options ){
        window.galleryMode = true;
        options = options || {};
        window._sneakyGalerizeData = window._sneakyGalerizeData || {
            schedule    : {}
        };
        options = $.extend({
            'scheduleId' : 'scheduleId-' + this.sneakyGalerize('id')
        }, options);

        this.data(options);
        this.sneakyGalerize('checkForIe');

        if ( window._sneakyGalerizeData.ltIe7 ){
            $.error( 'Browser is not supported by jQuery.sneakyGalerize' );
        }

        this.sneakyGalerize('setListeners');
        this.sneakyGalerize('scheduleResizeImages');
        return this;
    }
    
    ,setListeners       : function(){
        $(window).on( 'resize', $.proxy( methods.onWindowResize, this ) );
    }
    
    ,onWindowResize     : function(event){
        this.sneakyGalerize('scheduleResizeImages');
    }
    ,resizeImages       : function(){
        function normalizeImages($images){
            $images.each(function(){
                var $image = $(this);
                if ( $image.attr('data-width') ){
                   $image.attr( 'width', $image.attr('data-width') );
                }
                if ( $image.attr('data-height') ){
                   $image.attr( 'height', $image.attr('data-height') );
                }
                $image.css({ 'margin-left': 0 });
            });
        }

        function fixRow(elems, curW, fixedW){
            var diff = Math.abs( fixedW - curW ),
                personalDiff,
                isElWide,
                wideDiff,
                moreDiff,
                totalDiff = 0
                ,newTotalWidth;

            if (elems.length == 1){
                elems[0].attr( 'data-width', elems[0].attr('width') );
                elems[0].attr( 'data-height', elems[0].attr('height') );
                elems[0].attr('width', fixedW);
                elems[0].removeAttr('height');
                elems[0].css({ 'margin-left': 0 });

                return;
            }

            if ( curW < fixedW ){
                var ratioSum = 0;

                for (var j = 0, l1 = elems.length; j < l1; j++){
                    ratioSum += parseFloat(elems[j].attr('ratio') );
                }

                var height = ( fixedW )  / ratioSum;

                for (j = 0; j < l1; j++){
                    elems[j].removeAttr('width');
                    elems[j].attr('height', Math.ceil(height) );
                }

                newTotalWidth = 0;

                for (j = 0; j < l1; j++){
                    newTotalWidth += Math.round( elems[j][0].height * parseFloat(elems[j].attr('ratio')).toFixed(10)  );
                }

                elems[0].css({ 'margin-left': - Math.abs(newTotalWidth - fixedW)});
                return;
            }

            var eachDiff = Math.round( diff / elems.length )
                ,countWide = doCountWide(elems)
                ,margins = calcMargins(countWide, elems.length, diff);
            
            for (i = 0; i < elems.length; i++){
                personalDiff = 0;
                isElWide = isWide(elems[i]);

                if ( countWide > 0 && !isElWide ){
                    personalDiff =  margins[2];//Math.round ( ( ( diff - totalDiff ) / ( l - i ) )  / 2);
                    elems[i].css({ 'margin-left': - personalDiff });

                    totalDiff += personalDiff;
                }else if (isElWide){

                    personalDiff =  margins[4];//Math.round ( ( diff - totalDiff ) / ( l - i ) );

                    if ( countWide == 1 ){
                        personalDiff += margins[5];
                    }

                    elems[i].css({ 'margin-left': - personalDiff });

                    totalDiff += personalDiff;

                    countWide--;
                }else{
                    personalDiff =  Math.round ( ( diff - totalDiff ) / ( elems.length - i ) );
                    elems[i].css({ 'margin-left': - personalDiff });

                    totalDiff += personalDiff;
                }


            }
        }

        function calcMargins(wides, total, diff){
            var thins = total - wides;
            var normalDiff = Math.round(diff / total);
            var thinDiff = Math.round( normalDiff / 2 );
            var totalThinDiff = thins * thinDiff;
            var totalWideDiff = diff - totalThinDiff;
            var normalWideDiff = Math.round( totalWideDiff / wides );

            return [thins, wides, thinDiff, totalWideDiff, normalWideDiff, diff - totalThinDiff - normalWideDiff * wides];

        }

        function doCountWide(elems){
            var count = 0;
            for (var i = 0, l = elems.length; i < l; i++){
                if ( isWide(elems[i]) ){
                    count++;
                }
            }

            return count;
        }

        function isWide($elem){
            if ($elem[0].width >= $elem[0].height){
                return true;
            }

            return false;
        }
        
        function isVeryWide($elem){
            return $elem.width() > 600;
        }

        var $gallery = this;
        $gallery.width( parseInt( $gallery.parent('.galerize-wrap').width() ) );
        var i = 0
            ,fixedW     = $gallery.outerWidth()
            ,$images    = $gallery.find('img')
            ,rowW       = 0
            ,toCrop     = [];

        normalizeImages($images);

        $images.each(function(){
            var $image = $(this);
            toCrop.push($image);

            rowW += $image.outerWidth();
            if ( rowW > ( fixedW - (toCrop.length * 0) )
                || ( rowW > ( fixedW - (toCrop.length * 0) - 10 )  && toCrop.length == 1 )
                || ($images[i + 1] && rowW + $images[i + 1].width > ( fixedW * 150 / 100 ) )
            ){
                fixRow(toCrop, rowW, fixedW - (toCrop.length * 0));
                rowW = 0;
                toCrop = [];
            }

            i++;
        });

        if ( !!this.data('useRenderOnResize') ){
            $().sneakyLazyRender('tryRenderImages');
        }

        window._sneakyGalerizeData
            .schedule[ this.sneakyGalerize('getScheduleId') ] = false;
    }


    ,getScheduleId      : function(){
        return this.data('scheduleId');
    }

    ,getTimeoutId      : function(){
        return this.data('timeoutId');
    }

    ,setTimeoutId      : function(timeoutId){
        this.data('timeoutId', timeoutId);
    }

    ,clearTimeoutId      : function(){
        this.data('timeoutId', null);
    }

    ,scheduleResizeImages: function(){
        this.sneakyGalerize(
            'schedule'
            ,$.proxy(methods.resizeImages, this)
            ,this.sneakyGalerize('getScheduleId')
        );
    }

    ,schedule           : function(fn, id, time){
        id = id || this.sneakyGalerize('getScheduleId');

        if ( !fn ){
            $.error( 'Function is not supplied for schedule in jQuery.sneakyGalerize.schedule' );
            return false;
        }

        if ( window._sneakyGalerizeData.schedule[id] ){
            clearTimeout( window._sneakyGalerizeData.schedule[id].timeoutId );
        }
        
        window._sneakyGalerizeData.schedule[id] = {
            timeoutId: setTimeout(fn, time || 200)
        };

        return this;
    }

    ,id         : function(){
        window._sneakyGalerizeData.lastId = parseInt(window._sneakyGalerizeData.lastId, 10) || 0;
        return  window._sneakyGalerizeData.lastId++;
    }

    ,checkForIe : function(){
        var $html = $('html');
        window._sneakyGalerizeData.ltIe9 = $html.hasClass('lt-ie9');
        window._sneakyGalerizeData.ltIe8 = $html.hasClass('lt-ie8');
        window._sneakyGalerizeData.ltIe7 = $html.hasClass('lt-ie7');
        return this;
    }
  };

    $.fn.sneakyGalerize = function( method ){
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' doesn\'t exist for jQuery.sneakyGalerize' );
            return false;
        }
    };

})(jQuery);

$(document).ready(function(){
    $('.sneaky-galerize').sneakyGalerize({
        useRenderOnResize: true
    });
    
    calculateGlobalVars();
    window.imgViewer = new ImageViewer();
    if (window.imgViewer){
        window.imgViewer.init();
    }
});


/**
 * shit to rewrite
 */
$(document).on('keydown', onKeyDown);
function onKeyDown(e){
    if ( e.keyCode === 27 ){
        onEsc();
    }
}

function onEsc(){
    window.imgViewer.onClose();
}

function scheduleSizeImage(){
    if ( window.abortSize )
        return;

    window.abortSize = true;

    setTimeout(function(){sizeImages();}, 500);
}

function ImageViewer(){
    var me = this;
    this.DEFAULT_SRC = "/cheptsa/img/system/placeholder.gif";
    this.mask = this.mask || $('.all-mask');
    this.init = function(){
        $(document).on('click', 'a.image', me.onPreviewClick);
        me.el = $('<div id="imgViewer" class="unselectable">\n\
<div id="viewArea">\n\
<img class="image" src="/cheptsa/img/system/placeholder.gif"/>\n\
<div id="loading"><img src="/cheptsa/img/system/loading.gif"/></div>\n\
</div>\n\
</div>');

        me.viewArea = me.el.children('#viewArea');
        me.imgEl = me.viewArea.children('img');
        me.loadingMask = me.viewArea.children('#loading');
        me.toolsEl = $('<div id="imgTools"></div>');
        me.btns = me.btns || [];
        me.btns.push( new ActionButton('Закрыть', 'close', me.el, me.toolsEl) );
        me.el.append(me.toolsEl);

        me.btns.push( new ActionPanel('Назад', 'previmage', 'gallery-control left', me.el, me.viewArea) );
        me.btns.push( new ActionPanel('Вперед', 'nextimage', 'gallery-control right', me.el, me.viewArea) );

        //me.toolsEl.prepend('<span>Для перехода по галерее используйте клик мышью в левый или правый край экрана. \n\
        //Для выхода - клик по темной области вокруг изображения, кнопка "Закрыть" или клавиша Esc на клавиатуре</span>');
        $('body').append(me.el);

        me.imgEl.on('click', me.onImageClick);

        me.viewArea.on('click', me.onClose);

        me.el.on('close', me.onClose);
        me.el.on('previmage', me.onPrevImage);
        me.el.on('nextimage', me.onNextImage);

        if ( window.galleryMode ){
            me.initGalleryMode();
        }

        me.loadingPath = '/cheptsa/img/system/loading.gif';
    };


    this.initGalleryMode = function(){
        var $gallery = $('#gallery')
            ,i = 0;

        me.galleryImages = [];

        $gallery.find('a.image').each(
            function(){
                var $link = $(this)
                    ,$img = $link.children('img');

                $link.attr('data-index', i);

                var image = {
                    link        : $link.prop('href')
                    ,image      : $img
                };

                me.galleryImages.push(image);

                i++;
            }
        );
    }

    this.onPreviewClick = function(e){
        e.preventDefault();

        var $link = $(this)
            ,target = e.target || e.srcElement
            ,$clickedImg = $(target);

        me.activeImage = $clickedImg;
        me.activeTarget = $link.prop('href');
        me.activeIndex = $link.attr('data-index');

        openImage();
    };

    this.onImageClick = function(e){
        e.preventDefault();
        e.stopPropagation();

        me.onNextImage();
    };

    this.showEl = function(callbackFn){
        //@TODO cross-browser
        //me.el.css({top:$(document.body).scrollTop()});
        //me.el.show(0, callbackFn && function(){callbackFn();});
        me.el[0].style.display = 'block';
        me.mask.show();
        callbackFn.call(this);
    };

    /**
     * Функция на событие закрытия окна просмотра изображения
     * закрывает окно
     */
    this.onClose = function(){
        //me.el.fadeOut(100);
        me.el[0].style.display = 'none';
        me.activeImage = null;
        me.activeTarget = null;
        me.resetImageSrc();
        me.closed = true;
        // просмотр изображений закрыт, снимаем слушатель
        $(window).off('resize', scheduleViewerSizeImage);

        me.mask.hide();
    };

    /**
     *  Функция перехода на следующее изображение в галерее
     *  высчитывается индекс и вызывается общая функция перехода
     */
    this.onNextImage = function(){
        me.activeIndex = +me.activeIndex;
        me.activeIndex = ( me.activeIndex < me.galleryImages.length - 1 ) ?
            me.activeIndex + 1 :
            0;

        me.imageMove();
    }

    /**
     *  Функция перехода на предыдущее изображение в галерее
     *  высчитывается индекс и вызывается общая функция перехода
     */
    this.onPrevImage = function(){
        me.activeIndex = +me.activeIndex;
        me.activeIndex = ( me.activeIndex != 0 ) ?
            me.activeIndex - 1 :
            me.galleryImages.length - 1;

        me.imageMove();
    };

    /**
     * Функция перехода по галерее. Работает на посчитанном activeIndex
     * т.е. он уже должен быть проставлен верно (верно = так как нам надо)
     */
    this.imageMove = function(){
        me.activeTarget = me.galleryImages[me.activeIndex].link;
        me.activeImage = me.galleryImages[me.activeIndex].image;

        openImage();
    };

    this.resetImageSrc = function(){
        me.imgEl.prop('src', me.DEFAULT_SRC);
    }
    /**
     * Функция открытия изображения
     * делается ресайз для вписывания в экран и вызывается общая функция
     */
    function openImage(){
        var bigPath = me.activeTarget;

        hideImg();
        setLoading();
        me.showEl(function(){
            me.imgEl.prop('src', bigPath);
            me.imgEl.on('load', onImgLoad);

        });

        // после открытия просмотра повесим слушатель, который будет
        // запускать ресайз изображения при ресайзе всего окна (нам нужен наш "умный" ресайз)
        if ( me.closed ){
            $(window).on('resize', scheduleViewerSizeImage);
            me.closed = false;
        }
    }

    /**
     * Функция ресайза "большого" изображения, которая старается вписать его
     * максимально в экран. Для работы необходимо наличие атрибутов
     * realratio, realwidth, realheight у изображения !ЭТО ОБЯЗАТЕЛЬНО!
     */
    function resizeImgEl(){
        var $imgEl = me.imgEl
            ,ratio = me.activeImage.attr('realratio')
            ,realWidth = me.activeImage.attr('realwidth')
            ,realHeight = me.activeImage.attr('realheight');

        normalizeImageSize($imgEl);

        var elW = me.el.width()
            ,elH = me.el.height();

        if ( realWidth < elW && realHeight < elH ){
            me.abortSize = false;
            return;
        }

        ratio = parseFloat(ratio);

        var realW2elW = realWidth / elW;

        var newRealWidth = Math.floor(realWidth / realW2elW);
        var newRealHeight = Math.floor(newRealWidth / ratio);

        if ( newRealHeight > elH ){
            $imgEl.attr('height','100%');
        }else{
            $imgEl.attr('width','100%');
        }

        me.abortSize = false;
    }
    /**
     * Функция изменения положения "большого" изображения,
     * пытается отцентрировать по высоте
     */
    function posImage(){
        var $imgEl = me.imgEl
            ,imgWidth = $imgEl.width()
            ,imgHeight = $imgEl.height()
            ,elW = me.el.width()
            ,elH = me.el.height();

        normalizeImagePos();
        if ( elH < imgHeight + 5){
            me.abortPos = false;
            return;
        }

        var offset = Math.round( ( elH - imgHeight ) / 2 );
        me.viewArea.css({'padding-top': offset});
        me.abortPos = false;
    }

    function onImgLoad(){
        me.imgEl.off('load', onImgLoad);
        unsetLoading();
        resizeImgEl();
        posImage();
        showImg();
    }
    function showImg(){
        me.imgEl[0].style.display = 'block';
    }
    function hideImg(){
        me.imgEl[0].style.display = 'none';
    }

    function setLoading(){
        me.loadingMask[0].style.display = 'block';
    }
    function unsetLoading(){
        me.loadingMask[0].style.display = 'none';
    }
    /**
     * "Нормализация" размера изображения (сброс поправок высоты и ширины)
     * @param {jquery object} $img элемент
     */
    function normalizeImageSize($img){
        $img.removeAttr('width');
        $img.removeAttr('height');
    }

    /**
     * "Нормализация" положения изображения (сброс поправок высоты и ширины)
     */
    function normalizeImagePos(){
        me.viewArea.css({'padding-top': 0});
    }

    /**
     * Функция "назначающая" выполнение ресайза и откладывающая его на некоторое время
     * нужна, чтобы сократить количество выполнений ресайза изображения при
     * ресайзе окна
     */
    function scheduleViewerSizeImage(){
        if ( me.abortSize )
            return;

        me.abortSize = true;

        setTimeout(function(){resizeImgEl();}, 500);
    }
}