/**
 * 2013.03.
 * Scenes ver 0.03
 * Author : Heonwongeun
 * FaceBook : https://www.facebook.com/heo.wongeun
 */

(function(){
    var _bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

    /* *********************************************************
    *  Constructor
    ********************************************************** */
    
    function Scenes(option){
        var scope       = this;

        this.option     = { infoView : false}
        $.extend(this.option,option);

        this.scrollPossible = true;
        this.frame      = { root:scope, current:0, old:0, total:0 , estimate:0, estimation:frameEstimation, update:frameUpdate, direction:0};
        this.scene      = { root:scope, current:0, old:0, total:0 , estimate:0, estimation:sceneEstimation, update: sceneUpdate, scene:null, type:null, jump:null, link : null};
        this.type       = { current:null, old:null };
        this.direction  = "";

        this.scenes    = [];
        this.actors    = [];

        touchPosY      = 0;
        
        this.browserCheck();
        this.addEvent();
    }

    //update
    function frameUpdate(offset){
        if(this.current < 0 )this.current += -this.current*0.7;
        if(this.current > this.total )this.current += (this.total-this.current)*0.7;
        this.current    += offset;
        this.direction  = this.current-this.old;
        this.old        = this.current;
        this.estimate   = this.current;
    }

    function sceneUpdate(id){
        this.current    = id;
        this.scene      = this.root.scenes[this.current];
        this.type       = this.scene.type;
        this.estimate   = this.current;
    }

    //estimation
    function frameEstimation(offset){
        this.estimate += offset;
    }

    function sceneEstimation(){
        for(var o in this.root.scenes){
            this.root.scenes[o].estimation();
        }
    }

    Scenes.prototype.constructor = Scenes;
    /* *********************************************************
    *  SCROLL EVENT 
    ********************************************************** */
    Scenes.prototype.addEvent = function(){
        this.onResize = _bind(this.onResize,this);
        $(window).bind("resize", this.onResize);
        this.onResize();
    }
    Scenes.prototype.EVENT_DELETE_SCROLL = "delete_scroll";

    /* *********************************************************
    *  ADD , REMOVE 
    ********************************************************** */
    Scenes.prototype.addScene = function(sceneID,sceneFrame,type,option){
        if(typeof this.scenes[sceneID] == "undefined"){
            this.scenes[sceneID] = new Scene(sceneID,sceneFrame,type,this);
            if(typeof option != "undefined")this.scenes[sceneID].option = option;
            this.frame.total += sceneFrame;
            if(this.scene.total == 0)this.scene.update(0);
            this.scene.total = this.scenes.length - 1;

            for(var o in this.scenes){
                this.scenes[o].init();
            }
        }
    }

    Scenes.prototype.removeScene = function(sceneID){
        
    }

    Scenes.prototype.addToScene = function(sceneID,fn){
        if(typeof this.getScene(sceneID) != "undefined"){
            this.getScene(sceneID).add(fn);
        }
    };

    Scenes.prototype.addToActor = function(startFrame,totalFrame,fn){
        var actor   = new Actor(startFrame,totalFrame,fn);
        actor.stage = this;
        this.actors.push(actor);
    }


    /* *********************************************************
    *  Scenes update 
    ********************************************************** */
    Scenes.prototype.scrollPossibleOn = function(delay){
        var scope = this;
        setTimeout(function(){
            scope.scrollPossible = true;
        },delay);
    }

    Scenes.prototype.update = function(offset,type){
        if(offset == 0)return;
        var type = this.scene.type,estimate,tgScene;
        if(this.scrollPossible){
            this.frame.estimation(offset);
            this.scene.estimation();
            estimate = this.scene.estimate;
        }

        if(this.scene.current != this.scene.estimate){
            if(!this.scrollPossible)return;

            if(offset > 0){
                this.frame.update(this.getScene(this.scene.estimate).frame.start-this.frame.current);
                this.animation();
            }else{
                this.frame.update(this.getScene(this.scene.estimate).frame.end-this.frame.current);
                this.animation();
                this.scene.current  = estimate;
                this.scene.estimate = estimate;
                this.scene.type     = this.getScene(this.scene.estimate).type;
            }

            // $(this).trigger(this.EVENT_DELETE_SCROLL);
            // this.scrollPossible = false;
            // this.scrollPossibleOn(500);
            
        }else{
            if(!this.scrollPossible)return;
            if(type == "normal"){
                this.frame.update(offset);
                this.animation();
            }else if(type == "quick"){
                if(offset > 0){
                    tgScene         = this.getScene(this.scene.current+1);
                    this.direction  = 1;
                    if(typeof tgScene != "undefined")this.gotoAndScene(tgScene.id,this.scene.scene.option);
                    // console.log(this.scene.scene.option);
                }else{
                    tgScene         = this.getScene(this.scene.current);
                    this.direction  = -1;
                    if(typeof tgScene != "undefined")this.gotoAndScene(tgScene.id,tgScene.option);
                }

            }
        }
    }

    /* *********************************************************
    *   Scene Function
    ********************************************************** */
    
    Scenes.prototype.nextScene = function(){
        if(this.scene.current < this.scene.total){
            var nextScene       = this.scene.current+1;

            this.scrollPossible = false;
            this.gotoAndFrame(this.scenes[nextScene].frame.start);
            this.scene.update(nextScene);
        }
    }

    Scenes.prototype.prevScene = function(){
        if(this.scene.current > 0){
            var prevScene = this.scene.current-1;

            this.scrollPossible = false;
            this.gotoAndFrame(this.scenes[prevScene].frame.start);
            this.scene.update(prevScene);
        }
    }

    Scenes.prototype.gotoAndScene = function(sceneID,option){
        if(!this.scrollPossible)return;
        this.scrollPossible = false;
        if(this.scene.current < sceneID){
            this.direction = 1;
            this.gotoAndFrame(this.getScene(sceneID).frame.start,option);
        }else{
            this.direction = 0;
            this.gotoAndFrame(this.getScene(sceneID).frame.start,option);
        }
    }

    /* *********************************************************
    *  Scenes type check 
    ********************************************************** */
    Scenes.prototype.animation = function(){
        for(var o in this.scenes)this.scenes[o].update();
        for(var a in this.actors)this.actors[a].update();

        if(this.option.infoView)this.status();
    }

    Scenes.prototype.gotoAndFrame = function(tgFrame,option) {
        var obj = { current : tgFrame, estimate : tgFrame },scope = this, config = typeof option != "undefined"?option:{duration:1000,ease:"easeInOutQuint"};
        if(config.duration==0){
            $.extend(this.frame,obj);
            onComplete();
        }else{
            $(this.frame).stop().clearQueue().animate( obj, { step : stepAnimation, duration : config.duration, easing :config.ease, complete : onComplete });    
        }
        
        function onComplete(){
            stepAnimation();
            $(scope).trigger(scope.EVENT_DELETE_SCROLL);
            scope.scrollPossible = true;

            var option = scope.scene.scene.option;

            if(scope.direction > 0){
                if(option.jump && typeof option.jump.next != "undefined")scope.gotoAndScene(scope.scene.scene.option.jump.next);
            }else{
                if(option.jump && typeof option.jump.prev != "undefined")scope.gotoAndScene(scope.scene.scene.option.jump.prev);
            }
        }

        function stepAnimation(){
            scope.animation();
        }
    };


    Scenes.prototype.getScene = function(sceneID){
        return this.scenes[sceneID];
    }


    
    /* *********************************************************
    *  EventHandler
    ********************************************************** */
    Scenes.prototype.onResize = function(){
        this.sw    = this.windowWidth();
        this.sh    = this.windowHeight();
        this.animation();
    }

    /* *********************************************************
    *  infomation stats
    ********************************************************** */
    Scenes.prototype.status = function(){
        if(typeof this.sceneStatus == 'undefined'){
            this.sceneStatus = "<div id='sceneStatus' style='position:absolute; z-index:1000000; padding:10px; font-size:12px; background-color:#000; color:#fff'></div>"
            $('body').prepend(this.sceneStatus);
            this.sceneStatus = $("#sceneStatus");
        }
        this.sceneStatus.html("<br>" +"frame =" + this.frame.current.toFixed(1) + "<br>" +"totalframe = " + this.frame.total + "<br>" +"currentScene = " + this.scene.current);
    }
    

    /* *********************************************************
    * Class
    ********************************************************** */

    function Scene(id,frame,type,parent){

        this.id             = id;
        this.type           = type;
        this.parent         = parent;
        this.option         = {};
        this.progress       = 0;
        this.oldProgress    = 0;
        this.objs;

        this.init = function(){
            var startFrame = 0;
            for(var o in this.parent.scenes){
                if(o < this.id)startFrame += this.parent.scenes[o].frame.total;
            }
            this.frame = { start : startFrame , end : startFrame+frame, total:frame }; 
        }


        this.add = function(fn){
            if(typeof this.objs =="undefined")this.objs = [];
            fn = _bind(fn,this);
            this.objs.push(fn)
        }

        this.remove = function(){

        }

        this.update = function(){
            this.progress = (this.parent.frame.current - this.frame.start)/this.frame.total;
            if(this.progress >= 0 && this.progress <= 1){
                this.sceneCheck();
                for(var f in this.objs)this.objs[f]();
            }else{
                this.overCheck();
            }
            this.oldProgress = this.progress;
        }

        this.sceneCheck = function(){
            if(this.progress >= 0 && this.progress <= 1){
                this.parent.scene.update(this.id);
            }
        }

        this.estimation = function(){
            var p = (this.parent.frame.estimate - this.frame.start)/this.frame.total;
            if(p >= 0 && p < 1){
                this.parent.scene.estimate = this.id;
            }
        }

        this.overCheck = function(){
            if(this.progress < 0)this.progress = 0;
            if(this.progress > 1)this.progress = 1;
            if(this.oldProgress != this.progress){
                for(var f in this.objs)this.objs[f]();
            }
        }

        this.timefactor = function(startF,totalF){
            var totalframe = typeof totalF=="undefined"?(this.frame.total - startF):totalF,
                newPogress = (this.parent.frame.current - this.frame.start - startF) / totalframe // (totalF != "undefined"?totalF:(this.frame.total - startF)); 
            if(newPogress < 0) newPogress = 0;
            if(newPogress > 1) newPogress = 1;
            return newPogress;
        }
    }

    Scene.prototype.constructor = Scene;


    function Actor(startFrame,totalFrame,act){
        this.stage          = null;
        this.act            = act;
        this.progress       = 0;
        this.oldProgress    = 0;
        this.frame          = { start : startFrame , end : startFrame+totalFrame, total:totalFrame }; 

        this.update = function(){
            this.progress = (this.stage.frame.current - this.frame.start)/this.frame.total;
            if(this.progress >= 0 && this.progress <= 1){
                this.act();
            }else{
                this.overCheck();
            }

            this.oldProgress = this.progress;
        }

        this.overCheck = function(){
            if(this.progress < 0)this.progress = 0;
            if(this.progress > 1)this.progress = 1;
            if(this.oldProgress != this.progress){
                if(Math.floor(this.oldProgress) == 1 || Math.floor(this.oldProgress) == 0){
                    this.act();
                }
            }
        }

    }

    Actor.prototype.constructor = Actor;

    /* *********************************************************
    *  UTILITY FUNCTION
    ********************************************************** */
    function undefinedCheck(obj){
        return typeof obj != "undefined" ? obj : "undefined";
    }

    Scenes.prototype.windowWidth = function(){
        if (document.documentElement.clientWidth) {
            this.sw = document.documentElement.clientWidth;
        } else if (document.body.clientWidth) {
            this.sw = document.body.clientWidth;
        } else if (window.innerWidth) {
            this.sw = window.innerWidth;
        }
    }
    
    Scenes.prototype.windowHeight = function(){
        if (document.documentElement.clientHeight) {
            this.sh = document.documentElement.clientHeight;
            
        } else if (document.body.clientHeight) {
            this.sh = document.body.clientHeight;
        } else if (window.innerHeight) {
            this.sh = window.innerHeight;
        }
    }

    Scenes.prototype.browserCheck = function(){
        this.ua = navigator.userAgent.toLowerCase();
        return {
          // IE
          isIE: /msie (\d+)/.test(this.ua),
          // IE6
          isIE6: /msie (\d+)/.test(this.ua) && RegExp.$1 == 6,
          // IE7
          isIE7: /msie (\d+)/.test(this.ua) && RegExp.$1 == 7,
          // IE8
          isIE8: /msie (\d+)/.test(this.ua) && RegExp.$1 == 8,
          // IE9
          isIE9: /msie (\d+)/.test(this.ua) && RegExp.$1 == 9,
          // IE9未満
          isLtIE9: /msie (\d+)/.test(this.ua) && RegExp.$1 < 9
       }
    }

    this.Scenes = Scenes;
}).call(this)
