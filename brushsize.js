// Brush size UI

$(function(){
    function brushEditor(parent){
        this.parent = parent;
        this.brushSize = .5;
        this.createBrushSizer();
        this.drawBrushSizer();
    }
    
    brushEditor.prototype.createBrushSizer = function(){
        var thisInstant1 = this;
        this.brushSizeDisplay = document.createElement("div");
        var $brushSizeDisplay = $(this.brushSizeDisplay);
        $brushSizeDisplay.css({position: "absolute", left: "200px", top: "10px", width: "80px", height: "30px"});
        $brushSizeDisplay.appendTo($(this.parent));
        
        var buttons = {top: 34, left: 220, margin: 20};
        for(var i = 0; i < 8; i ++){
            var size = 1 << i;
            var $button = $("<button>" + size + "</button>")
                .hover(function(){$(this).css("backgroundColor", "#f0f0f0")}, function(){$(this).css("backgroundColor", "#dddddd")})
                .click(function(){thisInstant1.onClickSizeButton($(this).text())})
                .css({position: "absolute",borderStyle:"solid", borderColor:"#000000", backgroundColor: "#dddddd", borderWidth:"1px", left: buttons.left + "px", top: buttons.top + buttons.margin * i + "px", width: "50px", height: "18px", padding: "2px", fontSize: "8px"})
                .appendTo($(this.parent));
        }

        this.brushSizer = document.createElement("canvas");
        var $brushSizer = $(this.brushSizer);
        $brushSizer.attr({width: 180, height: 180});
        $brushSizer.css({borderStyle:"solid", borderColor:"#000000", borderWidth:"1px", position: "absolute", left: "10px", top: "10px"});
        $brushSizer.appendTo($(this.parent));
        
        $brushSizer.mousedown(function(e){thisInstant1.onMouseEvents(e);});
        $brushSizer.mouseup(function(e){thisInstant1.onMouseEvents(e);});
        $brushSizer.mouseout(function(e){thisInstant1.onMouseEvents(e);});
        $brushSizer.mousemove(function(e){thisInstant1.onMouseEvents(e);});
    };
    
    
    brushEditor.prototype.drawBrushSizer = function(){
        $(this.brushSizeDisplay).text("Size:" + Math.round(this.brushSize * 10) / 5);
        
        var ctx = this.brushSizer.getContext("2d");
        var width = this.brushSizer.width;
        var height = this.brushSizer.height;
        ctx.save();
        ctx.fillStyle = "#666666";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#bbbbbb";
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, this.brushSize, 0, Math.PI*2, false);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,.5)";
        ctx.lineWidth = 1;
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.restore();
    };

    brushEditor.prototype.onClickSizeButton = function(size){
        this.brushSize = size / 2;
        this.drawBrushSizer();
        this.setBrushSize();
        return false;
    };
    
    brushEditor.prototype.onMouseEvents = function(e){
        var x = e.offsetX || e.layerX || 0;
        var y = e.offsetY || e.layerY || 0;
        
        var width = this.brushSizer.width;
        var height = this.brushSizer.height;
        var dx = width / 2 - x;
        var dy = height / 2 - y;
        var dist = Math.round(Math.sqrt(dx * dx + dy * dy) * 2) / 2;
        dist = dist < 1 ? .5 : dist;
        switch(e.type){
            case "mousedown":
                this.drag = true;
                this.brushSize = dist;
                this.drawBrushSizer();
                this.setBrushSize();
                break;

            case "mouseout":
            case "mouseup":
                this.drag = false;
                break;

            case "mousemove":
                if(this.drag){
                    this.brushSize = dist;
                    this.drawBrushSizer();
                    this.setBrushSize();
                }
                break;
        }
        return false;
    };

    brushEditor.prototype.setBrushSize = function(){
        painter.setBrushSize(this.brushSize);
    };

    new brushEditor($("#brushsizer").get(0));
});