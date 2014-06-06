// Server Properties
var SERVER_URL ="/";
var TIME_OUT = 10000;
var PER_DAY = 1;
var PER_HOUR = 2;
var PER_QUARTER = 3;
var DEFAULT_DURATION_HOUR = 2;
var welcome_text = "VPP|";
var CONFIRMATION_EXPIRE = 30*60*1000; //miliseconds

function reloadPage(){
    if (navigator.onLine){
        location.reload();
    }else{
        var text = '<div class="well" style="text-align: center;">'
            +'<div>No connection</div>'
            +'<input value="Reload" class="btn btn-primary" type="button" onclick="reloadPage();">'
            +'</div>';
        $("body").html(text);
    }
}
