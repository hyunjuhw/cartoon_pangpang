// lislisPaint main
var lislisPaint = function(options){
    this.version = 1.04;
    this.eventcatcher = options.canvas;
    
    this.scetchBookArea = options.drawArea ? options.drawArea : {
        left: 150,
        top: 40,
        width: 500,
        height: 500
    };
    this.undoDepth = 20;
    this.layerDepth = 2;
    this.curentLayer = 0;
    this.currentColor = {r: 0, g: 0, b: 0, a: 1};
    this.currentBrushSize = .5; // size 1
    this.paintFillThreshold = 1;
    this.paintFillAntialias = 1;
    this.paintFillBy = "integrated";
    this.onCanUndo = [];
    this.onColorChange = [];
    this.onToolChanged = [];
    this.onLayerVisible = [];
    this.currentTool = false;
    this.lastTool = false;
    this.eraserTool = false;
    this.syringeTool = false;
    
    // Create Layers.
    this.layer = new (function(left, top, width, height, depth){
        this.layerLength = depth;
        this.width = width;
        this.height = height;
        this.paperColor = "rgb(255,255,255)";
        this.buffers = new Array(this.layerLength);
        for(var i = 0; i < this.layerLength; i++){
            this.buffers[i] = new (function(left, top, width, height){
                this.canvas = document.createElement("canvas");
                var $canvas = $(this.canvas);
                $canvas.attr({width:width, height:height});
                $canvas.css({position:"absolute", left:left, top:top, zIndex: 90 - i * 2});
                $canvas.appendTo($("body"));
                this.backCanvas = document.createElement("canvas");
                var $backCanvas = $(this.backCanvas);
                $backCanvas.attr({width:width, height:height});
                this.visible = true;
            })(left, top, width, height);
        }
        
        // Get the layer by the number.
        this.getCanvas = function(n){
            if(n >= 0 && n < this.layerLength){
                return this.buffers[n].canvas;
            }
            return 0;
        };

        // Get the back canvas.
        this.getBackCanvas = function(n){
            if(n >= 0 && n < this.layerLength){
                return this.buffers[n].backCanvas;
            }
            return 0;
        };
        
        // Show the canvas.
        this.showCanvas = function(n){
            if(n >= 0 && n < this.layerLength){
                this.buffers[n].visible = true;
                $(this.buffers[n].canvas).show();
            }
        };

        // Hide the canvas.
        this.hideCanvas = function(n){
            if(n >= 0 && n < this.layerLength){
                this.buffers[n].visible = false;
                $(this.buffers[n].canvas).hide();
            }
        };
        
        this.getCanvasVisibility = function(n){
            if(n >= 0 && n < this.layerLength){
                return this.buffers[n].visible;
            }
        };
        
        // Clear all the layers.
        this.clearLayers = function(){
            for(var i = 0; i < this.layerLength; i++){
                var ctx = this.buffers[i].canvas.getContext("2d");
                ctx.clearRect(0, 0, this.buffers[i].canvas.width, this.buffers[i].canvas.height);
                ctx = this.buffers[i].backCanvas.getContext("2d");
                ctx.clearRect(0, 0, this.buffers[i].backCanvas.width, this.buffers[i].backCanvas.height);
            }
        };
        
        // Create Integrated layer.
        this.getIntegratedLayer = function(){
            var integratedLayer = document.createElement("canvas");
            var $integratedLayer = $(integratedLayer);
            $integratedLayer.attr({width: this.width, height: this.height});
            var ctx = integratedLayer.getContext("2d");
            ctx.fillStyle = this.paperColor;
            ctx.fillRect(0, 0, this.width, this.height);
            for(var i = this.layerLength - 1; i >= 0; i--){
                if(this.buffers[i].visible){
                    ctx.drawImage(this.buffers[i].canvas, 0, 0);
                }
            }
            return integratedLayer;
        };
   })(this.scetchBookArea.left, this.scetchBookArea.top, this.scetchBookArea.width, this.scetchBookArea.height, this.layerDepth);

    // Create undo buffers.
    this.undoBuffer = new (function(depth){
        this.undoLength = depth;
        this.undoCycle = 0;
        this.undoCycleTop = 0;
        this.buffers = new Array(this.undoLength);
        for(var i = 0; i < this.undoLength; i++){
            this.buffers[i] = new (function(){
                this.targetLayer = 0;
                area = false;
            })();
        }
        // Push undo buffer.
        this.pushUndo = function(layers, layerNum, area){
            var undoBuffer = this.buffers[this.undoCycle];
            undoBuffer.targetLayer = layerNum;
            var canvas = layers.getCanvas(layerNum);
            var ctx = canvas.getContext("2d");
            var backCanvas = layers.getBackCanvas(layerNum);
            var bctx = backCanvas.getContext("2d");
            var left = 0;
            var top = 0;
            var width = canvas.width;
            var height = canvas.height;
            if(area){
                undoBuffer.area = area;
                left = area.left;
                top = area.top;
                width = area.width;
                height = area.height;
            }else{
                undoBuffer.area = {left:left, top:top, width:width, height:height};
            }
            undoBuffer.imageData = bctx.getImageData(left, top, width, height);
            bctx.save();
            //bctx.globalCompositeOperation = "copy";
            //bctx.drawImage(canvas, left, top, width, height, left, top, width, height);
            bctx.putImageData(ctx.getImageData(left, top, width, height), left, top);
            bctx.restore();
            this.undoCycle = (this.undoCycle + 1 == this.undoLength) ?  0 : this.undoCycle + 1;
            if(this.undoCycle == this.undoCycleTop){
                this.undoCycleTop = (this.undoCycleTop + 1) % this.undoLength;
            }
        };
        
        // Return if undo buffer is ready or not.
        this.canUndo = function(){
            return this.undoCycle != this.undoCycleTop;
        };
        
        // Pop undo buffer.
        this.popUndo = function(layers){
            if(this.canUndo()){
                this.undoCycle = this.undoCycle ? this.undoCycle - 1 : this.undoLength - 1;
                var undoBuffer = this.buffers[this.undoCycle]
                var layerNum = undoBuffer.targetLayer;
                var ctx = layers.getCanvas(layerNum).getContext("2d");
                ctx.putImageData(undoBuffer.imageData, undoBuffer.area.left, undoBuffer.area.top);
                var bctx = layers.getBackCanvas(layerNum).getContext("2d");
                bctx.putImageData(undoBuffer.imageData, undoBuffer.area.left, undoBuffer.area.top);
                delete undoBuffer.imageData;
            }
        };
        
        // Clear undo buffer.
        this.clearUndo = function(){
            while(this.canUndo()){
                this.undoCycle = this.undoCycle ? this.undoCycle - 1 : this.undoLength - 1;
                delete this.buffers[this.undoCycle].imageData;
            }
        };
    })(this.undoDepth);

    // Init tools
    this.tools = new (function(){
        this.tools = [];
        this.selectByName = function(name){
            for(var i = 0; i < this.tools.length; i++){
                if(this.tools[i].name == name){
                    return this.tools[i];
                }
            }
            return false;
        };
        this.addTool = function(tool){
            this.tools.push(tool);
        };
    });

    // Bind events
    var thisInstant1 = this;
    var $eventcatcher = $(this.eventcatcher);
    $eventcatcher.mousedown(function(e){thisInstant1.onMouseEvents(e);});
    $eventcatcher.mouseup(function(e){thisInstant1.onMouseEvents(e);});
    $eventcatcher.mousemove(function(e){thisInstant1.onMouseEvents(e);});
    $eventcatcher.mouseover(function(e){thisInstant1.onMouseEvents(e);});
    $eventcatcher.mouseout(function(e){thisInstant1.onMouseEvents(e);});
    $("body").keydown(function(e){thisInstant1.onKeyEvents(e);});
    
};

// Mouse up/down/move/out events
lislisPaint.prototype.onMouseEvents = function(e){
    var canvas = this.layer.getCanvas(this.curentLayer);
    var $canvas = $(canvas);
    var ctx = canvas.getContext("2d");
    var position = $canvas.offset();
    var left = position.left;
    var top = position.top;
    
    var x = e.offsetX || e.layerX  || 0;
    var y = e.offsetY || e.layerY  || 0;
    
    x -= left;
    y -= top;
    
    var inScetchBook = (
        x >= 0 &&
        y >= 0 &&
        x <= this.scetchBookArea.width &&
        y <= this.scetchBookArea.height
    );

    var wacom = document.embeds["wacom-plugin"];
    var currentTool = this.currentTool;
    if(wacom && wacom.isWacom && wacom.pointerType == 3 && this.eraserTool){// eraser
        currentTool = this.eraserTool;
    }
    if(e.altKey && this.syringeTool){
        currentTool = this.syringeTool;
    }
    
    if(!this.layer.getCanvasVisibility(this.curentLayer) && currentTool.type != "syringe"){
        return false;
    }

    switch(e.type){
        case "mousedown":
            if(currentTool.restoreBeforeStroke){
                this.resoreCanvas();
            }
            currentTool.startStroke(ctx, x, y, this);
            break;

        case "mouseout":
        case "mouseup":
            currentTool.endStroke(ctx, x, y, this);
            break;
        
        case "mouseover":
            break;

        case "mousemove":
            if(currentTool.restoreBeforeStroke){
                this.resoreCanvas();
            }
            currentTool.connectStroke(ctx, x, y, this);
            break;
    }

   // Update the layer and the undo buffer
   if(currentTool.recuireUpdate){
        var left = Math.floor(currentTool.area.left);
        var top = Math.floor(currentTool.area.top);
        var right = Math.ceil(currentTool.area.right);
        var bottom = Math.ceil(currentTool.area.bottom);
        left = left < 0 ? 0 : left;
        left = left > canvas.width ? canvas.width : left;
        top = top < 0 ? 0 : top;
        top = top > canvas.height ? canvas.height : top;
        right = right < 0 ? 0 : right;
        right = right > canvas.width ? canvas.width : right;
        bottom = bottom < 0 ? 0 : bottom;
        bottom = bottom > canvas.height ? canvas.height : bottom;
        var width = right - left;
        var height = bottom - top;
        if(width && height){
            this.pushUndo({left: left, top: top, width:width, height: height});
        }
        currentTool.recuireUpdate = false;
        currentTool.area = false;
    }
    
    if(this.currentTool.requireResoreTool){
        this.currentTool.requireResoreTool = false;
        this.restoreTool();
    }
    e.cancelBubble = true;
    return false;
};

// Key events
lislisPaint.prototype.onKeyEvents = function(e){
    if(e.keyCode == 90 && e.ctrlKey){ // ctrl + z
        this.popUndo();
        return true;
    }
};

// Clear all layers
lislisPaint.prototype.clearAllLayers = function(){
    if(window.confirm("All layers will be deleted. This operation cannot be restored by undo. ")){
        this.layer.clearLayers();
        this.undoBuffer.clearUndo();
        this.fireCanUndoEvent();
    }
};


// Restore current layer
lislisPaint.prototype.resoreCanvas = function(){
    var canvas = this.layer.getCanvas(this.curentLayer);
    var backCanvas = this.layer.getBackCanvas(this.curentLayer);
    ctx = canvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(backCanvas, 0, 0);
    ctx.restore();
};


// Set current color
lislisPaint.prototype.setColor = function(color){
    this.currentColor = color;
    if(this.onColorChange.length){
        for(var i = 0; i < this.onColorChange.length; i++){
            this.onColorChange[i](this.currentColor);
        }
    }
};

// Set brush size
lislisPaint.prototype.setBrushSize = function(size){
    this.currentBrushSize = size;
};

// Select current layer
lislisPaint.prototype.selectLayer = function(number){
    if(number >= 0 && number < this.layerDepth){
        this.curentLayer = number;
    }
};

// Fire the event to notify undo status
lislisPaint.prototype.fireCanUndoEvent = function(){
    if(this.onCanUndo.length){
        for(var i = 0; i < this.onCanUndo.length; i++){
            this.onCanUndo[i](this.undoBuffer.canUndo());
        }
    }
};

// Push undo buffer
lislisPaint.prototype.pushUndo = function(area){
    this.undoBuffer.pushUndo(this.layer, this.curentLayer, area);
    this.fireCanUndoEvent();
};

// Pop undo buffer
lislisPaint.prototype.popUndo = function(){
    this.undoBuffer.popUndo(this.layer);
    this.fireCanUndoEvent();
};

// Return undo status
lislisPaint.prototype.canUndo = function(){
    return this.undoBuffer.canUndo();
};

// Add the tool to lislisPaint
lislisPaint.prototype.addTool = function(tool){
    this.tools.addTool(tool);
};

// Set the tool as the eraser
lislisPaint.prototype.setAsEraserTool = function(name){
    this.eraserTool = this.tools.selectByName(name);
};

// Set the tool as the syringe
lislisPaint.prototype.setAsSyringeTool = function(name){
    this.syringeTool = this.tools.selectByName(name);
};


// Select the tool by name
lislisPaint.prototype.selectTool = function(name){
    if(this.currentTool){
        this.currentTool.stop();
    }
    if(!this.currentTool || this.currentTool.name != name){
        this.lastTool = this.currentTool;
        this.currentTool = this.tools.selectByName(name);
    }
    this.fireToolChangedEvent();
};

// Select the tool selected last
lislisPaint.prototype.restoreTool = function(){
    var currentTool = this.currentTool;
    this.currentTool = this.lastTool;
    this.lastTool = currentTool;
    this.fireToolChangedEvent();
};

// Fire the event to notify curent tool chenged
lislisPaint.prototype.fireToolChangedEvent = function(){
    if(this.onToolChanged.length){
        for(var i = 0; i < this.onToolChanged.length; i++){
            this.onToolChanged[i](this.currentTool.name);
        }
    }
};

// Get the layer
lislisPaint.prototype.getLayer = function(n){
    return this.layer.getCanvas(n);
};

// Get the integrated layer
lislisPaint.prototype.getIntegratedLayer = function(){
    return this.layer.getIntegratedLayer();
}

// Get the image file as the new window
lislisPaint.prototype.getImageToWindow = function(){
    var integratedLayer = this.getIntegratedLayer();
    window.open(integratedLayer.toDataURL());
};


// Hide the layer
lislisPaint.prototype.hideLayer = function(n){
    this.fireLayerVisible(n, false);
    return this.layer.hideCanvas(n);
};

// Show the layer
lislisPaint.prototype.showLayer = function(n){
    this.fireLayerVisible(n, true);
    this.layer.showCanvas(n);
};
// Toggle the layer
lislisPaint.prototype.toggleLayer = function(n){
    if(this.layer.getCanvasVisibility(n)){
        this.hideLayer(n);
    }else{
        this.showLayer(n);
    }
};

// Fire the event when the layer visible status changed
lislisPaint.prototype.fireLayerVisible = function(n, visibility){
    if(this.onLayerVisible.length){
        for(var i = 0; i < this.onLayerVisible.length; i++){
            this.onLayerVisible[i](n, visibility);
        }
    }
};

// Create lislisPaint object
var painter;
$(function(){
    var paperPosition = $("#paper").offset();
    var drawArea = {
        left: paperPosition.left + 1,
        top: paperPosition.top + 1,
        width: $("#paper").width(),
        height: $("#paper").height()
    };
    painter = new lislisPaint({canvas: $("div#eventcatcher").get(0), drawArea : drawArea});
});
