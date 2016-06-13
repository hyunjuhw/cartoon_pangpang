// Tools

$(function(){

    // Basic tool object
    function tool(){
        this.name = "tool";
        this.type = "tool";
        this.stroke = false;
        this.lastPoint = {};
        this.area = false;
        this.recuireUpdate = false;
        this.restoreBeforeStroke = false;
        this.requireResoreTool = false;
    };

    tool.prototype.updateArea = function(area){
        if(this.area){
            this.area.left = this.area.left > area.left ? area.left : this.area.left;
            this.area.top = this.area.top > area.top ? area.top : this.area.top;
            this.area.right = this.area.right < area.right ? area.right : this.area.right;
            this.area.bottom = this.area.bottom < area.bottom ? area.bottom : this.area.bottom;
        }else{
            this.area = area;
        }
    };

    tool.prototype.getRgbaString =function(color){
        return "rgba(" + Math.round(color.r) + "," +  Math.round(color.g) + "," + Math.round(color.b) + "," + color.a  + ")";
    };

    // Paint Fill
    
    
    function paintFill(){
        this.name = "paintfill";
        this.type = "paintfill";
        this.maxColorDistance = 1;
    }

    paintFill.prototype = new tool();

    paintFill.prototype.getColorDistance = function(x, y, color){
        var i = (x + y * this.width) * 4;
        var data = this.imageDataSrc.data;
        var dr = data[i    ] - color.r;
        var dg = data[i + 1] - color.g;
        var db = data[i + 2] - color.b;
        var da = data[i + 3] - color.a;
        return Math.sqrt(dr * dr + dg * dg + db * db + da * da);
    };

    paintFill.prototype.getPixel = function(x, y){
        var i = (x + y * this.width) * 4;
        var data = this.imageDataSrc.data;
        return {
            r: data[i    ],
            g: data[i + 1],
            b: data[i + 2],
            a: data[i + 3]
        };
    };

    paintFill.prototype.setPixel = function(x, y, color){
        var i = (x + y * this.width) * 4;
        var data = this.imageDataSrc.data;
        data[i    ] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
        data[i + 3] = color.a;
        data = this.imageDataDst.data;
        data[i    ] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
        data[i + 3] = color.a;
    };

    paintFill.prototype.setDstPixel = function(x, y, color, alpha){
        var i = (x + y * this.width) * 4;
        data = this.imageDataDst.data;
        if(!data[i + 3]){
            data[i    ] = color.r;
            data[i + 1] = color.g;
            data[i + 2] = color.b;
            data[i + 3] = color.a * alpha;
        }
    };

    paintFill.prototype.seedFill = function(x, y, fillColor){
        this.seed = [];
        var color = this.getPixel(x, y);
        if(this.getColorDistance(x, y, fillColor) <= this.maxColorDistance) return;
        
        this.seed.push({x: x, y: y});
        var width = this.width - 1;
        var height = this.height - 1;
        do{
            var point = this.seed.shift();
            var left = point.x;
            var right = point.x;
            y = point.y;
            var distance = this.maxColorDistance - this.getColorDistance(left, y, color);
            if(distance < 0) distance = 0;
            this.setPixel(left, y, fillColor);
            // Scan right
            while(right < width){
                var distance = this.maxColorDistance - this.getColorDistance(right + 1, y, color);
                if(distance < 0) break;
                this.setPixel(right + 1, y, fillColor);
                right++;
            }
            // Scan left
            while(left > 0){
                var distance = this.maxColorDistance - this.getColorDistance(left - 1, y, color);
                if(distance < 0) break;
                this.setPixel(left - 1, y, fillColor);
                left--;
            }
            // Easy Antialias
            if(this.antialias){
                if(left - 1 >= 0) this.setDstPixel(left - 1, y, fillColor, .4);
                if(right + 1 < width) this.setDstPixel(right + 1, y, fillColor, .4);
            }
            // Scan upper
            if(y - 1 >= 0){
                var foundSeed = this.scanRaster(left, right, y - 1, color);
                if(this.antialias){
                    this.fillRaster(left, right, y - 1, fillColor, .4);
                }
            }
            // Scan lower
            if(y + 1 <= height){
                var foundSeed = this.scanRaster(left, right, y + 1, color);
                if(this.antialias){
                    this.fillRaster(left, right, y + 1, fillColor, .4);
                }
            }
            this.updateArea({left: left - 2, top: y - 2, right: right + 2, bottom: y + 2})
        }while(this.seed.length);
    };
    
    paintFill.prototype.fillRaster = function(left, right, y, fillColor, alpha){
        while(left <= right){
            this.setDstPixel(left, y, fillColor, alpha);
            left++;
        }
    };
    
    paintFill.prototype.scanRaster = function(left, right, y, color){
        var foundSeed = false;
        while(left < right){
            while(left <= right){
                if(this.getColorDistance(left, y, color) <= this.maxColorDistance) break;
                left++;
            }
            if(left <= right && this.getColorDistance(left, y, color) > this.maxColorDistance) break;
            
            while(left <= right){
                if(this.getColorDistance(left, y, color) > this.maxColorDistance) break;
                left++;
            }
            this.seed.push({x:left - 1, y: y});
            foundSeed = true;
            // There might be bugs if it is too seedy...
            if(this.seed.length > 5000){
                throw ("paintFill.prototype.scanRaster: Too many Seeds! " +  (left-1) + ", " + y + ", right: "  + right);
                break;
            }
        }
        return foundSeed;
    };
    
    paintFill.prototype.startStroke = function(ctx, x, y, painter){
        this.width = painter.scetchBookArea.width;
        this.height = painter.scetchBookArea.height;
        this.maxColorDistance = painter.paintFillThreshold;
        this.antialias = painter.paintFillAntialias;
        if(x >= 0 && y >= 0 && x < this.width && y < this.height ){
            var color = {
                r: painter.currentColor.r,
                g: painter.currentColor.g,
                b: painter.currentColor.b,
                a: painter.currentColor.a
            };
            color.a *= 255;
            switch(painter.paintFillBy){
                case "0":
                    var ctxl = painter.getLayer(0).getContext("2d");
                    this.imageDataSrc = ctxl.getImageData(0, 0, this.width, this.height);
                    break;

                case "1":
                    var ctxl = painter.getLayer(1).getContext("2d");
                    this.imageDataSrc = ctxl.getImageData(0, 0, this.width, this.height);
                    break;

                default:
                case "current":
                    this.imageDataSrc = ctx.getImageData(0, 0, this.width, this.height);
                    break;

                case "integrated":
                    var ctxl = painter.getIntegratedLayer().getContext("2d");
                    this.imageDataSrc = ctxl.getImageData(0, 0, this.width, this.height);
                    break;
            }
            var canvasDst = document.createElement("canvas");
            canvasDst.width = this.width;
            canvasDst.height = this.height;
            var ctxDst = canvasDst.getContext("2d");
            this.imageDataDst = ctxDst.getImageData(0, 0, this.width, this.height);
            this.seedFill(x, y, color);
            ctxDst.putImageData(this.imageDataDst, 0, 0);
            ctx.drawImage(canvasDst, 0, 0);
            delete this.imageDataSrc;
            delete this.imageDataDst;
            // this.area = {left: 0, top: 0, right: this.width, bottom: this.height};
            this.recuireUpdate = true;
        }
    };

    paintFill.prototype.connectStroke = function(ctx, x, y, painter){
    };

    paintFill.prototype.endStroke = function(ctx, x, y, painter){
    };

    paintFill.prototype.stop = function(ctx, x, y, painter){
    };

    painter.addTool(new paintFill());

    // Syringe
    function syringe(){
        this.name = "syringe";
        this.type = "syringe";
    }
    syringe.prototype = new tool();

    syringe.prototype.pickupColor = function(ctx, x, y, painter){
        var imageData = ctx.getImageData(x, y, 1, 1);
        return {r : imageData.data[0], g: imageData.data[1], b: imageData.data[2], a: 1 };
    };

    syringe.prototype.startStroke = function(ctx, x, y, painter){
        this.stroke = true;
        this.integratedLayer =  painter.getIntegratedLayer();
        var ictx = this.integratedLayer.getContext("2d");
        painter.setColor(this.pickupColor(ictx, x, y, painter));
    };

    syringe.prototype.connectStroke = function(ctx, x, y, painter){
        if(this.stroke){
            var ictx = this.integratedLayer.getContext("2d");
            painter.setColor(this.pickupColor(ictx, x, y, painter));
        }
    };

    syringe.prototype.endStroke = function(ctx, x, y, painter){
        this.stroke = false;
        if(this.integratedLayer){
            delete this.integratedLayer;
        }
        this.requireResoreTool = true;
    };

    syringe.prototype.stop = function(){
        if(this.integratedLayer){
            delete this.integratedLayer;
        }
        this.stroke = false;
    };

    painter.addTool(new syringe());
    painter.setAsSyringeTool("syringe");

    // Fill rect
    function fillRect(){
        this.name = "fillrect";
        this.type = "rect";
        this.restoreBeforeStroke = true;
    }

    fillRect.prototype = new tool();
    
    fillRect.prototype.fillRect = function(ctx, left, top, width, height, color){
        ctx.save();
        ctx.fillStyle = this.getRgbaString(color);
        ctx.fillRect(left, top, width, height);
        ctx.restore();
    };
    
    fillRect.prototype.startStroke = function(ctx, x, y, painter){
        this.startPoint = {x: x, y: y};
        this.stroke = true;
    };

    fillRect.prototype.connectStroke = function(ctx, x, y, painter){
        if(this.stroke){
            var left = x < this.startPoint.x ? x : this.startPoint.x;
            var top = y < this.startPoint.y ? y : this.startPoint.y;
            var right = x > this.startPoint.x ? x : this.startPoint.x;
            var bottom = y > this.startPoint.y ? y : this.startPoint.y;
            this.area = {left: left, top: top, right: right, bottom: bottom};
            this.fillRect(ctx, left, top, right - left, bottom - top, painter.currentColor);
        }
    };

    fillRect.prototype.endStroke = function(ctx, x, y, painter){
        if(this.stroke && this.area){
            this.recuireUpdate = true;
        }
        this.stroke = false;
    };

    fillRect.prototype.stop = function(){
        if(this.stroke && this.area){
            this.recuireUpdate = true;
        }
        this.stroke = false;
    };

    painter.addTool(new fillRect());

    // Clear rect
    
    function clearRect(){
        this.name = "clearrect";
        this.type = "rect";
    }
    clearRect.prototype = new fillRect();
    
    clearRect.prototype.fillRect = function(ctx, left, top, width, height, color){
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(left, top, width, height);
        ctx.restore();
    };

    painter.addTool(new clearRect());

    // Digital brush
    function brush(){
        this.name = "brush";
        this.type = "brush";
    };

    brush.prototype = new tool();

    brush.prototype.drawParticle = function(ctx, x, y, size, color, alpha){
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = this.getRgbaString(color);
        ctx.arc(x, y, size, 0, Math.PI*2, false);
        ctx.fill();
        ctx.restore();
        this.updateArea({left: x - size - 1, top: y - size - 1, right: x + size + 1, bottom: y + size + 1});
    };

    brush.prototype.startStroke = function(ctx, x, y, painter){
        var wacom = document.embeds["wacom-plugin"];
        var size = painter.currentBrushSize;
        size *= (wacom && wacom.isWacom) ? wacom.pressure : 1;
        var alpha = 1;
        if(size < .5){
            alpha = size * size * 4;
            size = .5;
        }
        this.drawParticle(ctx, x, y, size, painter.currentColor, alpha);
        this.lastPoint = {x:x , y: y, size: size, alpha: alpha};
        this.stroke = true;
    };

    brush.prototype.connectStroke = function(ctx, x, y, painter){
        if(this.stroke){
            var wacom = document.embeds["wacom-plugin"];
            var size = painter.currentBrushSize;
            size *= (wacom && wacom.isWacom) ? wacom.pressure : 1;
            var alpha = 1;
            if(size < .5){
                alpha = size * size * 4;
                size = .5;
            }
            var dx = this.lastPoint.x - x;
            var dy = this.lastPoint.y - y;
            var dsize = this.lastPoint.size - size;
            var dalpha = this.lastPoint.alpha - alpha;
            var length = Math.sqrt(dx * dx + dy * dy);
            var step =   (size + dsize) / 2.5 + .75;
            for(var i = 0; i < length; i += step){
                var progress = i / length;
                var px = x + dx * progress;
                var py = y + dy * progress;
                var psize = size + dsize * progress;
                var palpha = alpha + dalpha * progress;
                this.drawParticle(ctx, px, py, psize, painter.currentColor, palpha);
            }
            this.lastPoint = {x:x , y: y, size: size, alpha: alpha};
        }
    };

    brush.prototype.endStroke = function(ctx, x, y, painter){
        if(this.stroke && this.area){
            this.recuireUpdate = true;
        }
        this.stroke = false;
    };

    brush.prototype.stop = function(){
        if(this.stroke && this.area){
            this.recuireUpdate = true;
        }
        this.stroke = false;
    };

    painter.addTool(new brush());
    painter.selectTool("brush");

    // Eraser
    function eraser(){
        this.name = "eraser";
        this.type = "eraser";
    };

    eraser.prototype = new brush();

    eraser.prototype.drawParticle = function(ctx, x, y, size, color, alpha){
        ctx.save();
        ctx.beginPath();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.arc(x, y, size, 0, Math.PI*2, false);
        ctx.fill();
        ctx.restore();
        this.updateArea({left: x - size - 1, top: y - size - 1, right: x + size + 1, bottom: y + size + 1});

    };

    painter.addTool(new eraser());
    painter.setAsEraserTool("eraser");

    // Air brush
    function airBrush(){
        this.name = "airbrush";
    };

    airBrush.prototype = new brush();

    airBrush.prototype.drawParticle = function(ctx, x, y, size, color, alpha){
        ctx.save();
        ctx.beginPath();
        var grad = ctx.createRadialGradient(x, y, 0, x, y, size);
        grad.addColorStop(0, "rgba(" + Math.round(color.r) + "," + Math.round(color.g) + "," + Math.round(color.b)  + "," + color.a * .5 * alpha + ")");
        grad.addColorStop(1, "rgba(" + Math.round(color.r) + "," + Math.round(color.g) + "," + Math.round(color.b)  + "," + 0 + ")");
        ctx.fillStyle = grad;
        ctx.arc(x, y, size, 0, Math.PI*2, false);
        ctx.fill();
        ctx.restore();
        this.updateArea({left: x - size - 1, top: y - size - 1, right: x + size + 1, bottom: y + size + 1});
    };

    painter.addTool(new airBrush());

});
