// JavaScript Document
function changeToParked(garageName,endTime){
	var text = '<div class="well well-sm">'
			+'You have parked at '
            +'<strong>'
			+garageName
            +'</strong>';
    if (endTime){
        text +=' until '
            + formatTime(endTime);
    }

    text +='</div>'
	    //+'<div class="well well-sm">'
		//+'<input id="check-out-btn" class="btn btn-danger" type="button" value="Check Out" onclick="checkOut();"/>'
		//+'</div>'
		+' ';

	$('html,body').scrollTop(0);
	return text;
}

function changeToNotParked(){
	var text = '<div class="well well-sm">Pick a garage from the favorites, list or map</div>';
	$('html,body').scrollTop(0);
	return text;
}

function changeToError(){
    var text = '<div class="well well-sm"><strong>Connection errors...</strong></div>';
    $('html,body').scrollTop(0);
    return text;
}

function changetoSessionExpire(){
    var text = '<p>Session Expired</p>'
        +'<p>Please restart the app, or </p>'
        +'<input id="reload-btn" class="btn btn-primary" type="button" value="Reload" onClick="reloadPage();">';
    return text;
}

function changeToParkingGarage(garageName){
    var text ='<div id="parkingInput" class="well well-sm">'
            +'<span id="garage-name"><strong>'+garageName+'&nbsp</strong></span><span class="fav-garage glyphicon glyphicon-star"></span><button onclick="changeGarage();" type="button" class="close close-modal" aria-hidden="true">&times;</button>'
            +'<br><font color="#3366ff">Current Rate: </font>'
            +'<strong><span id="rate">Fetching</span></strong>'
            +'<br><br>'

            +'<form class="form-horizontal">'

            +'<div class="form-group row" id="select-duration">'
            +'<label for="duration" class="col-lg-5 col-md-5 col-sx-6  control-label" >Enter Duration (hour)</label>'
            +'<div class="col-lg-3 col-md-3 col-sx-6">'
            +'<input type="text" class="form-control" id="duration-value" placeholder="2" value="" min="1" max="24">'
            +'</div>'
            +'</div>'

            +'<div class="form-group row" id="select-space">'
            +'<label for="space" class="col-lg-5 col-md-5 col-sx-6 control-label">Enter Space (optional)</label>'
            +'<div class="col-lg-3 col-md-3 col-sx-6">'
            +'<input type="text" class="form-control" id="space-value" placeholder="0" value="" min="0">'
            +'</div>'
            +'</div>'

            +'</form>'
            +'</div>'

            +'<div class="well well-sm">'
            +'<input id="park-btn" class="btn btn-primary" type="button" data-toggle="modal" data-target="#confirming" value="Park"/>&nbsp'
            +'<input onclick="toggleFavorite();" id="mark-favorite-btn" type="button" class="btn btn-warning" value="Favorite"/>&nbsp'
            +'<input onclick="changeGarage();" id="change-garage-btn" type="button" class="btn btn-default" value="Cancel"/>'
            +'</div>';
    //$('html,body').scrollTop($('#favorite').position().top);
    $('html,body').scrollTop(0);
    return text;

}

var formatTime = function(unixTimestamp) {
    var dt = new Date(unixTimestamp * 1000);

    var hours = dt.getHours();
    var minutes = dt.getMinutes();
//    var ampm;
//
//    if (hours < 12)
//     ampm = 'a.m.'
//    else
//     ampm = 'p.m.'
//
//    if (hours > 12 )
//     hours -= 12;
//
    if (minutes < 10)
        minutes = '0' + minutes;
//
//    return hours + ':' + minutes + ' ' + ampm;

    var day = dt.getDate();
    var month = dt.getMonth()+1;
    if (month < 10)
        month = '0' + month;
    var year = dt.getFullYear().toString().substring(2,4);
    return month +'/'+ day +'/'+ year +' '+ hours +':'+ minutes
}