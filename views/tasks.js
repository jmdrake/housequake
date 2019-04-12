$("#tasks").load("./views/tasks.html", function(){
    showTasks(null);
});

function viewsTaskListInit() {
    $(".namefield").on("change", function(event){
        var taskDiv = $(this).parent().parent();
        var id = taskDiv.find("#_id").val();
        ctrlsTasksGetTask(id, function(task){
            task["name"] = taskDiv.find("#namefield").val();
            ctrlsTasksUpdateTask(task);
        });
    });

    $(".btnDelete").on("click", function(event){
        var taskDiv = $(this).parent().parent();
        var id = taskDiv.find("#_id").val();
        ctrlsTasksGetTaskList(id, function(results){
            if(results.length == 0){
                var r = confirm("Delete this task?");
                if (r == true) {
                    ctrlsTasksGetTask(id, function(task){
                        ctrlsTasksDeleteTask(task);                    
                        taskDiv.hide();
                    })                      
                }
            } else {
                alert("Cannot delete task with subtasks")
            }
        })
    });

    $("#btnConfirmDelete").on("click", function(event){
        var id =  $("#mdlVerifyDelete").find("#taskid").val();
        ctrlsTasksGetTask(id, function(task){
            ctrlsTasksDeleteTask(task);
        });
        $("#mdlVerifyDelete").hide();
    });

    $("#btnCancelDelete").on("click", function(event){
        $("#mdlVerifyDelete").hide();
    });    
    
    $(".btnTimer").on("click", function(event){
        var taskDiv = $(this).parent().parent();
        $("#mdlTimer").find("#taskid").val(taskDiv.attr("id"))
        $("#mdlTimer").find("#timeelapsed").val(taskDiv.find(".timeelapsed").val());
        $("#lblTimeelapsed").html(formatms(taskDiv.find(".timeelapsed").val()))
        $("#mdlTimer").show();
    });
    
    $(".btnToggleTimer").on("click", function(event){
        event.stopImmediatePropagation();
        if(typeof(w)=="undefined")
            startWorker();
        else
            stopWorker();
    })
    
    $(".btnSubtask").on("click", function(event){
        event.stopImmediatePropagation();
        var taskDiv = $(this).parent().parent();
        subTask(taskDiv.find("#_id").val());
        $("#parentheader").show();
    });
    
    $("#btnUpLevel").on("click", function(event){
        var parentTask = $("#parent").val();
        console.log("Up level");
        event.stopImmediatePropagation();
        ctrlsTasksGetTask(parentTask, function(task){
            if(task["parent"] == null) {
                $("#parentheader").hide();
                $("#parent").val("");
                $("#header").html("");
                showTasks(null)
            } else {
                subTask(task["parent"])
            }
        })
    });
    
    $(".togglecompleted").on("change", function(event){
        var taskDiv = $(this).parent().parent();
        var id = taskDiv.find("#_id").val();
        ctrlsTasksGetTask(id, function(task){
            if(taskDiv.find(".togglecompleted").prop("checked")) {
                taskDiv.find("label").addClass("completed");
                task["completed"] = true;
            } else {
                taskDiv.find("label").removeClass("completed");
                task["completed"] = false;
            }
            ctrlsTasksUpdateTask(task);
        });
    });
    
    $("#chkShowTimes").on("change", function(event){
        if($(this).prop("checked")) {
            $(".lblTimeelapsed").show();
        } else {
            $(".lblTimeelapsed").hide();
        }
    });
}

function subTask(id) {
    ctrlsTasksGetTask(id, function(task){
        $("#header").html(task["name"]);
        $("#parent").val(id);
    });
    showTasks(id);
}

function showTasks(id) {
    var tmplTask = $("#tmplTask");
    tmplTask.hide();
    $("#lstTasks").html("");
    $("#lstTasks").append(tmplTask);
    ctrlsTasksGetTaskList(id, function(tasklist){
        utilsFormcontrolsPopulateDivList($("#lstTasks"), tasklist, tmplTask, {
            callback : function(div, data){
                div.find("#namefield").val(data["name"]);
                if(data["completed"]){
                    div.find("label").addClass("completed");
                    div.find(".togglecompleted").prop("checked", true);
                }
                div.attr("id", "task" + data["_id"]);
                var timeelapsed = data["timeelapsed"] ? data["timeelapsed"] : 0;
                div.find(".timeelapsed").val(timeelapsed);
                div.find(".lblTimeelapsed").html(formatms(timeelapsed));
            }
        });
        viewsEditlabelInit();
        viewsTaskListInit();
    });
}

function viewsTasksAddTask(){
    ctrlsTasksAddTask($("#newtask").val(), $("#parent").val(), function(newTaskDoc){
        var newTaskItem = utilsFormcontrolsCloneDiv($("#tmplTask"), newTaskDoc, "");
        newTaskItem.find("#namefield").val(newTaskDoc["name"]);
        $("#lstTasks").append(newTaskItem);
        viewsTaskListInit();
        viewsEditlabelInit();
        newTaskItem.show();
        $("#newtask").val("");
    })
}

var w;

function startWorker() {
    if(typeof(Worker) !== "undefined") {
        if(typeof(w) == "undefined") {
            w = new Worker("views/timerwebworker.js");
        }
        w.onmessage = function(event) {
            var timeelapsed = parseInt($("#timeelapsed").val());
            var fmtTimeelapsed = formatms(timeelapsed);
            $("#timeelapsed").val(timeelapsed + 1);
            $("#lblTimeelapsed").html(fmtTimeelapsed);
            var taskDiv = $("#" + $("#taskid").val());
            taskDiv.find(".lblTimeelapsed").html(fmtTimeelapsed);
            taskDiv.find(".timeelapsed").val(timeelapsed);
            var id = taskDiv.find("#_id").val();
            ctrlsTasksGetTask(id, function(task){
                task["timeelapsed"] = taskDiv.find(".timeelapsed").val();
                ctrlsTasksUpdateTask(task);
            });
        };
    } else {
        console.log("Sorry! No Web Worker support.");
    }
}

function stopWorker() {
    w.terminate();
    w = undefined;
}

function formatms(ms) {
    var seconds = Math.floor(ms % 60);
    var minutes = Math.floor(ms / 60) % 60;
    var hours = Math.floor(ms / 3600);
    return hours.toString() + ":" + minutes.toString() + ":" + seconds.toString();
}

