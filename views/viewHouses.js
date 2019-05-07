$("#houses").load("./views/viewHouses.html", function(){
    showHouses();
    viewsEditlabelInit();
    $("#btnAddHouse").on("click", function(event){
        viewsHousesAddHouse();
    })
});

function viewsHouseListInit() {
    $(".btnSave").on("click", function(event){
        var houseDiv = $(this).parent().parent().parent();
        var id = houseDiv.find("#_id").val();
        var file = houseDiv.find(".editimage").prop("files")[0];
        ctrlsHousesGetHouse(id, function(house){
            house["address"] = houseDiv.find("#addressfield").val();
            house["number"] = houseDiv.find("#numberfield").val();
            house["notes"] = houseDiv.find("#notes").val();
            houseDiv.find("#address").html(house["address"]);
            houseDiv.find("#number").html(house["number"]);
            houseDiv.find("#notes").html(house["notes"]);
            ctrlsHousesUpdateHouse(house, file);
            houseDiv.find(".displayfield").show();
            houseDiv.find(".editfield").hide();
            houseDiv.find(".notesDiv").attr("disabled", "");
            houseDiv.find(".notesDiv").addClass("w3-hide");
        });        
    });

    $(".previewimg").on("click", function(event){
        $("#housepiclarge").attr("src", $(this).find("img").attr("src"));
        $("#houseimage").show();
    })

    $(".btnDelete").on("click", function(event){
        var houseDiv = $(this).parent().parent().parent();
        var id = houseDiv.find("#_id").val();
        ctrlsHousesGetHouse(id, function(results){
            var r = confirm("Delete this house?");
            if (r == true) {
                ctrlsHousesGetHouse(id, function(house){
                    ctrlsHousesDeleteHouse(house);                    
                    houseDiv.hide();
                })                      
            }
        })
    });
    
    $(".btnEdit").on("click", function(event){
        var houseDiv = $(this).parent().parent().parent();
        var notesDiv = $(this).parent().parent().parent().find("#notes");
        notesDiv.removeClass("w3-hide");
        notesDiv.removeAttr("disabled");
        houseDiv.find(".displayfield").hide();
        houseDiv.find(".editfield").show();
    });
    

    $(".editimage").on("change", function(event){
        // var houseDiv = $(this).parent().parent();
        var preview = $(this).parent().parent().find("#housepic");
        // document.getElementById('housepic'); //selects the query named img
        // var file    = document.querySelector('input[type=file]').files[0]; //sames as here
        var file = $(this).prop("files")[0];
        var reader  = new FileReader();
        
        reader.onloadend = function () {
           preview.attr("src", reader.result);
        }
        
        if (file) {
           reader.readAsDataURL(file); //reads the data as a URL
        } else {
           preview.attr("src", "");
        }
    });
    
    $("#btnConfirmDelete").on("click", function(event){
        var id =  $("#mdlVerifyDelete").find("#houseid").val();
        ctrlsTasksGetTask(id, function(task){
            ctrlsTasksDeleteTask(task);
        });
        $("#mdlVerifyDelete").hide();
    });

    $("#btnCancelDelete").on("click", function(event){
        $("#mdlVerifyDelete").hide();
    });    
    
    $(".btnToggleNotes").on("click", function(even){
        var notesDiv = $(this).parent().find("#notes");
        if(notesDiv.hasClass("w3-hide")) {
            notesDiv.removeClass("w3-hide")
        } else {
            notesDiv.addClass("w3-hide")
        }
    });
    
    $("#btnToggleAllNotes").on("click", function(event){
        if($("#notes").hasClass("w3-hide")) {
            $(".notesDiv").removeClass("w3-hide")
        } else {
            $(".notesDiv").addClass("w3-hide")
        }
    })
}   

function showHouses() {
    var tmplHouse = $("#tmplHouse");
    var notestr;
    tmplHouse.hide();
    $("#lstHouses").html("");
    $("#lstHouses").append(tmplHouse);
    ctrlsHousesGetHouseList(function(houseList){
        utilsFormcontrolsPopulateDivList($("#lstHouses"), houseList, tmplHouse, {
            callback : function(div, data){
                div.attr("id", "house" + data["_id"]);
                div.find("label").attr("for", "editimage" + data["_id"]);
                div.find("#editimage").attr("id", "editimage" + data["_id"]);
                div.find("#numberfield").val(data["number"]);
                div.find("#addressfield").val(data["address"]);
                if(data._attachments) {
                    dbHouses.getAttachment(data["_id"], "filename").then(
                        function(blob){
                            var url = URL.createObjectURL(blob);
                            console.log(url);
                            div.find("#housepic").attr("src", url);
                        }
                    )
                }                
                if(typeof data.notes === "object") {
                    notestr = jsyaml.safeDump(data.notes);
                    div.find(".notesDiv").html(notestr);
                    div.find("#notesfield").val(notestr);
                } else {
                    div.find("#notesfield").val(data.notes);
                }
            }
        });
        viewsEditlabelInit();
        viewsHouseListInit();
        if(houseList instanceof Array && houseList.length > 0)
            $("#newnumber").val(parseInt(houseList[houseList.length - 1].number) + 1);
    });
}

function viewsHousesAddHouse(){
    $("#btnAddHouse").attr("disabled", "")
    var file = document.getElementById("housefile").files[0];
    ctrlsHousesAddHouse($("#newnumber").val(), $("#newaddress").val(), $("#newnotes").val(), file, function(newHouseDoc){
        var newHouse = utilsFormcontrolsCloneDiv($("#tmplHouse"), newHouseDoc, "");
        newHouse.attr("id", "house" + newHouseDoc["_id"]);
        newHouse.find("label").attr("for", "editimage" + newHouseDoc["_id"]);
        newHouse.find("#editimage").attr("id", "editimage" + newHouseDoc["_id"]);        
        newHouse.find("#numberfield").val(newHouseDoc["number"]);
        newHouse.find("#addressfield").val(newHouseDoc["address"]);
        newHouse.find("#notesfield").val(newHouseDoc["notes"]);
        // newHouse.find("#previewimg").attr("src", newHouseDoc["image"]);
        $("#lstHouses").append(newHouse);
        viewsHouseListInit();
        viewsEditlabelInit();
        if(newHouseDoc._attachments) {
            dbHouses.getAttachment(newHouseDoc["_id"], "filename").then(
                function(blob){
                    var url = URL.createObjectURL(blob);
                    console.log(url);
                    newHouse.find("#housepic").attr("src", url);
                }
            )
        }           
        newHouse.show();
        $("#newhouse").val("");
        $("#newnumber").val(parseInt(newHouseDoc.number)+1);
        $("#newaddress").val("");
        $("#newnotes").val("");
        $("#housepic").attr("src", "./views/cliparthouse.jpg");
        $("#btnAddHouse").removeAttr("disabled");
        $("#housefile").val("");
    })
}

function previewFile(){
   var preview = document.getElementById('housepic'); //selects the query named img
   var file    = document.querySelector('input[type=file]').files[0]; //sames as here
   var reader  = new FileReader();

   reader.onloadend = function () {
       preview.src = reader.result;
   }

   if (file) {
       reader.readAsDataURL(file); //reads the data as a URL
   } else {
       preview.src = "";
   }
}
