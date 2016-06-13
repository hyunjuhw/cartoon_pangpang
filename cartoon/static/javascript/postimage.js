// Post the image.

$(function(){
    $("#postimage").hide();
    $("#button_post").click(function(){
    
        var integratedLayer = painter.getIntegratedLayer();
        var dataUrl = integratedLayer.toDataURL();
        var name = $("#postimage_name").val() || "Anonymous";
        var comment = $("#postimage_comment").val();
        var data = {
            name: name,
            comment: comment,
            dataurl: dataUrl
        };
        var callback = function(data, dataType){
            $("#postimage").hide();
            document.location = "./gallery/lislispainter_gallery01.php";
        };
        var type = "html";
        $.ajaxSetup({ 
            scriptCharset: "utf-8",
            contentType: "application/x-www-form-urlencoded; charset UTF-8"
        });
        $.post("./gallery/lislispainter_post01.php", data, callback, type);
    });
    $("#button_cancelpost").click(function(){
        $("#postimage").hide();
    });
});