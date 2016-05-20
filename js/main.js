window.global = {
    ltIe7: false,
    ltIe8: false,
    ltIe9: false
};

$(document).ready(onDocumentReady);


function onDocumentReady(){
    calculateGlobalVars();

    if (!window.global.ltIe7){
        window.Scroller = new ScrollerObject();

        window.onscroll = onWindowScroll;
    }

    if ( !window.galleryMode ){
        onWindowScroll();
    }

    $().sneakyLazyRender();
}


function onWindowScroll(){
    if ( window.allowNavFixed ){
        var $this = $(this),
        currentScrollTop = +$this.scrollTop();
        if ( currentScrollTop >= window.SCROLL_TOP_LIMIT && !window.fixedMode ){
            window.Scroller.fixTop();
        }else if ( currentScrollTop < window.SCROLL_TOP_LIMIT && window.fixedMode ){
            window.Scroller.unfixTop();
        }
    }
}


function calculateGlobalVars(){
    
    window.galleryMode = !!$('#gallery')[0];
}


function ScrollerObject(){
    var me = this;

    me.fixTop = function(){
        var $headerNav = $(HEADER_NAV_SELECTOR);
        $headerNav.fadeIn(100);

        window.fixedMode = 1;
    };

    me.unfixTop = function(){
        var $headerNav = $(HEADER_NAV_SELECTOR);
        $headerNav.fadeOut(100);

        window.fixedMode = 0;
    };
}

/**
 * Кнопка с действием, гененрирует вызов события, одноименного параметру action
 * на родителя - $parent
 */
function ActionButton(text, action, $parent, $insertWhere){
    var me = this;
    this.parent = $parent;
    this.action = action;
    this.el = $('<div class="btn">{0}</div>'.format(text));

    var $insertEl = $insertWhere || $parent;

    $insertEl.append(this.el);

    this.el.on('click', onBtnClick);

    function onBtnClick(e){
        e.preventDefault();
        e.stopPropagation();
        me.parent.trigger(me.action);
    }
}

/**
 * Панель с действием, гененрирует вызов события, одноименного параметру action
 * на родителя - $parent
 */
function ActionPanel(text, action, cls, $parent, $insertWhere){
    var me = this;
    this.parent = $parent;
    this.action = action;
    this.el = $('<div class="action-panel {0}">{1}</div>'.format(cls, text));

    var $insertEl = $insertWhere || $parent;

    $insertEl.append(this.el);

    this.el.on('click', onPanelClick);

    function onPanelClick(e){
        e.preventDefault();
        e.stopPropagation();
        me.parent.trigger(me.action);
    }
}


