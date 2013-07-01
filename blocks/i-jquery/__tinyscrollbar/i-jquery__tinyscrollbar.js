(
    function ($) {
        $.tiny = $.tiny || {};
        $.tiny.scrollbar = {options: {axis: 'y', wheel: 40, scroll: true, size: 'auto', sizethumb: 'auto'}};
        $.fn.tinyscrollbar = function (options) {
            var options = $.extend({}, $.tiny.scrollbar.options, options);
            this.each(function () {
                $(this).data('tsb', new Scrollbar($(this), options));
            });
            return this;
        };
        $.fn.tinyscrollbar_update = function (sScroll) {
            return $(this).data('tsb').update(sScroll);
        };
        function Scrollbar(root, options) {
            var oSelf = this;
            var oWrapper = root;
            var oViewport = {obj: $('.viewport', root)};
            var oContent = {obj: $('.overview', root)};
            var oScrollbar = {obj: $('.scrollbar', root)};
            var oTrack = {obj: $('.track', oScrollbar.obj)};
            var oThumb = {obj: $('.thumb', oScrollbar.obj)};
            var sAxis = options.axis == 'x', sDirection = sAxis ? 'left' : 'top', sSize = sAxis ? 'Width' : 'Height';
            var iScroll, iPosition = {start: 0, now: 0}, iMouse = {};

            function initialize() {
                oSelf.update();
                setEvents();
                return oSelf;
            }

            this.update = function (sScroll) {
                console.log('oViewport.obj = ', oViewport.obj);
                oViewport[options.axis] = oViewport.obj.context['offset' + sSize];
                oContent[options.axis] = oContent.obj.context['scroll' + sSize];
                oContent.ratio = oViewport[options.axis] / oContent[options.axis];
                oScrollbar.obj.toggleClass('disable', oContent.ratio >= 1);
                oTrack[options.axis] = options.size == 'auto' ? oViewport[options.axis] : options.size;
                oThumb[options.axis] = Math.min(oTrack[options.axis], Math.max(0, (
                    options.sizethumb == 'auto' ? (
                        oTrack[options.axis] * oContent.ratio) : options.sizethumb)));
                oScrollbar.ratio = options.sizethumb == 'auto' ? (
                    oContent[options.axis] / oTrack[options.axis]) : (
                    oContent[options.axis] - oViewport[options.axis]) / (
                    oTrack[options.axis] - oThumb[options.axis]);
                iScroll = (
                    sScroll == 'relative' && oContent.ratio <= 1) ? Math.min((
                    oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll)) : 0;
                iScroll = (
                    sScroll == 'bottom' && oContent.ratio <= 1) ? (
                    oContent[options.axis] - oViewport[options.axis]) : isNaN(parseInt(sScroll)) ? iScroll : parseInt(sScroll);
                setSize();
            };
            function setSize() {
                oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
                oContent.obj.css(sDirection, -iScroll);
                iMouse['start'] = oThumb.obj.offset()[sDirection];
                var sCssSize = sSize.toLowerCase();
                oScrollbar.obj.css(sCssSize, oTrack[options.axis]);
                oTrack.obj.css(sCssSize, oTrack[options.axis]);
                oThumb.obj.css(sCssSize, oThumb[options.axis]);
            }

            ;
            function setEvents() {
                oThumb.obj.bind('mousedown', start);
                oThumb.obj[0].ontouchstart = function (oEvent) {
                    oEvent.preventDefault();
                    oThumb.obj.unbind('mousedown');
                    start(oEvent.touches[0]);
                    return false;
                };
                oTrack.obj.bind('mouseup', drag);
                if (options.scroll && this.addEventListener) {
                    oWrapper[0].addEventListener('DOMMouseScroll', wheel, false);
                    oWrapper[0].addEventListener('mousewheel', wheel, false);
                }
                else if (options.scroll) {
                    oWrapper[0].onmousewheel = wheel;
                }
            }

            ;
            function start(oEvent) {
                iMouse.start = sAxis ? oEvent.pageX : oEvent.pageY;
                var oThumbDir = parseInt(oThumb.obj.css(sDirection));
                iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;
                $(document).bind('mousemove', drag);
                document.ontouchmove = function (oEvent) {
                    $(document).unbind('mousemove');
                    drag(oEvent.touches[0]);
                };
                $(document).bind('mouseup', end);
                oThumb.obj.bind('mouseup', end);
                oThumb.obj[0].ontouchend = document.ontouchend = function (oEvent) {
                    $(document).unbind('mouseup');
                    oThumb.obj.unbind('mouseup');
                    end(oEvent.touches[0]);
                };
                return false;
            }

            ;
            function wheel(oEvent) {
                if (!(
                    oContent.ratio >= 1)) {
                    oEvent = $.event.fix(oEvent || window.event);
                    var iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3;
                    iScroll -= iDelta * options.wheel;
                    iScroll = Math.min((
                        oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll));
                    oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
                    oContent.obj.css(sDirection, -iScroll);
                    oEvent.preventDefault();
                }
                ;
            }

            ;
            function end(oEvent) {
                $(document).unbind('mousemove', drag);
                $(document).unbind('mouseup', end);
                oThumb.obj.unbind('mouseup', end);
                document.ontouchmove = oThumb.obj[0].ontouchend = document.ontouchend = null;
                return false;
            }

            ;
            function drag(oEvent) {
                if (!(
                    oContent.ratio >= 1)) {
                    iPosition.now = Math.min((
                        oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (
                        iPosition.start + (
                            (
                                sAxis ? oEvent.pageX : oEvent.pageY) - iMouse.start))));
                    iScroll = iPosition.now * oScrollbar.ratio;
                    oContent.obj.css(sDirection, -iScroll);
                    oThumb.obj.css(sDirection, iPosition.now);
                    ;
                }
                return false;
            }

            ;
            return initialize();
        }

        ;
    })(jQuery);