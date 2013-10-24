/**
 * 2013.08
 * Scroll ver 0.04
 */

(function () {
    var _bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
    var getPagePos = function(e){
        var pos, touch;
        pos = {x:0, y:0};
        if("ontouchstart" in window) {
            if (e.touches != null) {
                touch = e.touches[0];
            } else {
                touch = e.originalEvent.touches[0];
            }
            pos.x = touch.clientX;
            pos.y = touch.clientY;
        } else {
            pos.x = e.clientX;
            pos.y = e.clientY;
        }
        return pos;
    }
    /* *********************************************************
    *  Constructor 
    ********************************************************** */

    function Scroll(option){
        this.config     = {
            speed       : 0.1,
            friction    : 0.94,
            touchSpeed  : 5,
            type        : "wheel",
            step        : function(){}
        }

        $.extend(this.config,option);

        this.offset         = 0;
        this.isRender       = false;
        this.onRender       = _bind(this.onRender,this);
        
        //wheelEvent
        this.onWheel = _bind(this.onWheel,this);
        $(document).bind("mousewheel", this.onWheel);

        //touchEvent
        this.onTouchStart   = _bind(this.onTouchStart,this);
        this.onTouchMove    = _bind(this.onTouchMove,this);
        this.onTouchEnd     = _bind(this.onTouchEnd,this);

        $(document).bind("touchstart", this.onTouchStart);
        $(document).bind("touchmove", this.onTouchMove);
        $(document).bind("touchend", this.onTouchEnd);
    };

    Scroll.prototype.constructor = Scroll;
    Scroll.prototype.init = function(){

    }


    /* *********************************************************
    *  SCROLL EVENT 
    ********************************************************** */
    Scroll.prototype.EVENT_TOUCHSTART       = "touch_start";
    Scroll.prototype.EVENT_TOUCHEND         = "touch_end";

    Scroll.prototype.EVENT_SCROLLSTART      = "scroll_start";
    Scroll.prototype.EVENT_SCROLLAFTER      = "scroll_after";

    Scroll.prototype.event_dispatch = function(event){
        $(this).trigger(event);
    }
    /* *********************************************************
    *  Event Handler
    ********************************************************** */
    
    Scroll.prototype.onTouchStart = function(e){
        $(this).trigger(this.EVENT_TOUCHSTART);
        // e.preventDefault();
        this.touchMoveOffset    = 0;
        this.isTouch            = true;
        this.t_startP           = this.getTouchInfo(e);
        this.startRender();
    }

    Scroll.prototype.onTouchMove = function(e){
        e.preventDefault();
        this.offset     = 0;
        this.t_moveP    = this.getTouchInfo(e);
        this.touchMoveOffset = this.t_startP.y - this.t_moveP.y
    }

    Scroll.prototype.onTouchEnd = function(e){
        this.isTouch = false;
        this.t_moveP.time = new Date().getTime();

        var speed = (this.touchMoveOffset)/(this.t_startP.time - this.t_moveP.time);
        this.offset = -this.config.touchSpeed*speed;

        this.startRender();
    }


    Scroll.prototype.getTouchInfo = function(e){
        if(!this.time)this.time = new Date();
        var info = { x : 0 , y : 0 , time: new Date().getTime()};
        $.extend(info,getPagePos(e));
        return info;
    }


    Scroll.prototype.onWheel = function(event, delta, deltaX, deltaY){
        if(delta > 0){
            this.offset -= this.config.speed;
        }else if(delta < 0){
            this.offset += this.config.speed;
        }
        this.startRender();
    }

    /* *********************************************************
    *  Rendering
    ********************************************************** */
    

    Scroll.prototype.startRender = function(){
        if(!this.isRender){
            this.isRender = true;
            this.renderingID = requestAnimationFrame(this.onRender);
            this.event_dispatch(this.EVENT_SCROLLSTART);
        }
    }

    Scroll.prototype.stopRender = function(){
        this.isRender = false;
        cancelAnimationFrame(this.renderingID);
    }

    Scroll.prototype.onRender = function(){
        if(!this.isRender){
            this.offset = 0;
            return;
        }

        this.offset *= this.config.friction;
        this.config.step(); 

        var check = this.offset < 0? this.offset*-1:this.offset;
        if(check > 0.00001){
            this.renderingID = requestAnimationFrame(this.onRender);
        }else{
            this.isRender = false;
            this.event_dispatch(this.EVENT_SCROLLAFTER);
        }

        // console.log(this.offset)
    }




    this.Scroll = Scroll;
}).apply(window);