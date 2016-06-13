// Menu UI

$(function(){
    $("#button_brush").addClass("selected");
    $("div.menu button").hover(
        function(){
            $(this).addClass("hover");
            return false;
        },
        function(){
            $(this).removeClass("hover");
            return false;
        }
    );
    
    $("div.menu").mousedown(function(){
        //return false;
    });

    $("body").mousedown(function(e){
        switch(e.target.tagName){
            case "INPUT":
            case "SELECT":
                return true;
            
            default:
                return false;
        }
    });
    
    $("div.menu button").mousedown(function(){
        $(this).addClass("pushed");
        return false;
    });

    $("div.menu button").mouseup(function(){
        $(this).removeClass("pushed");
        return false;
    });

    $("div.menu button").mouseout(function(){
        $(this).removeClass("pushed");
        return false;
    });

    $("#button_brush").click(function(){
        painter.selectTool("brush");
        return false;
    });

    $("#button_airbrush").click(function(){
        painter.selectTool("airbrush");
        return false;
    });

    $("#button_syringe").click(function(){
        painter.selectTool("syringe");
        return false;
    });


    $("#button_eraser").click(function(){
        painter.selectTool("eraser");
        return false;
    });

    $("#button_fillrect").click(function(){
        painter.selectTool("fillrect");
        return false;
    });

    $("#button_clearrect").click(function(){
        painter.selectTool("clearrect");
        return false;
    });

    $("#button_paintfill").click(function(){
        painter.selectTool("paintfill");
        return false;
    });
    
    painter.onToolChanged.push(function(name){
        $("div#tools button.selected").removeClass("selected");
        $("#brushedit").hide();
        $("#paintfill").hide();
        switch(name){
            case "brush":
                $("#button_brush").addClass("selected");
                $("#brushedit").show();
                break;
            case "airbrush":
                $("#button_airbrush").addClass("selected");
                $("#brushedit").show();
                break;
            case "syringe":
                $("#button_syringe").addClass("selected");
                break;
            case "eraser":
                $("#button_eraser").addClass("selected");
                $("#brushedit").show();
                break;
            case "fillrect":
                $("#button_fillrect").addClass("selected");
                break;
            case "clearrect":
                $("#button_clearrect").addClass("selected");
                break;
            case "paintfill":
                $("#button_paintfill").addClass("selected");
                $("#paintfill").show();
                break;
        }
    });
    
    $("#button_layer1").click(function(){
        $("div#layers button.selected").removeClass("selected");
        $(this).addClass("selected");
        painter.selectLayer(0);
        return false;
    });

    $("#button_layer2").click(function(){
        $("div#layers button.selected").removeClass("selected");
        $(this).addClass("selected");
        painter.selectLayer(1);
        return false;
    });
    
    $("div#layers img.eye").click(function(){
        painter.toggleLayer(this.name);
        return false;
    });
    
    painter.onLayerVisible.push(function(n, visibility){
        if(visibility){
            $("div#layers img.eye[name='" + n + "']").attr("src", "./icons/eye_open.png");
        }else{
            $("div#layers img.eye[name='" + n + "']").attr("src", "./icons/eye_close.png");
        }
    });
    
    $("#button_undo").click(function(){
        painter.popUndo();
        return false;
    });

    $("#button_getimage").click(function(){
        painter.getImageToWindow();
        return false;
    });
    
    $("#button_clearall").click(function(){
        painter.clearAllLayers();
        return false;
    });
    
    $("#button_postimage").click(function(){
        $("#postimage").show();
        return false;
    });
    
    // Paint Fill options
    $("#paintfill").hide();

    $("#check_paintfill_antialias").change(function(){
        painter.paintFillAntialias = $("#check_paintfill_antialias").attr("checked");
    });
    
    $("#select_paintby").change(function(){
        painter.paintFillBy = $("#select_paintby").val();
    });
    
    
    $("#paintfill_threshold_range").mousedown(function(e){
        var position = $("#paintfill_threshold_range").offset();
        var value = e.clientX - position.left;
        $("#paintfilloption .range_pos").css("left", value -3.5 +"px");
        $("#paintfill_threshold").text(value + 1);
        $("#paintfill_threshold_range").data("tracking", true);
        painter.paintFillThreshold = value + 1;
        return false;
    });

    $("#paintfill_threshold_range").mousemove(function(e){
        if($("#paintfill_threshold_range").data("tracking")){
            var position = $("#paintfill_threshold_range").offset();
            var value = e.clientX - position.left;
            $("#paintfilloption .range_pos").css("left", value -3.5 +"px");
            $("#paintfill_threshold").text(value + 1);
            painter.paintFillThreshold = value + 1;
        }
        return false;
    });

    $("#paintfill_threshold_range").mouseup(function(e){
        $("#paintfill_threshold_range").data("tracking", false);
        return false;
    });

    $("#paintfill_threshold_range").mouseout(function(e){
        $("#paintfill_threshold_range").data("tracking", false);
        return false;
    });

    // Undo button
    
    painter.onCanUndo.push(function(canUndo){
        if(canUndo){
            $("#button_undo").removeClass("disabled");
        }else{
            $("#button_undo").addClass("disabled");
        }
        return false;
    });
    
    // Dialog drag and drop
    
    $("div.menu h2").easydrag();
    
    $("div.menu h2").ondrag(function(e, element){  });
    $("div.menu h2").ondrop(function(e, element){  });
});
