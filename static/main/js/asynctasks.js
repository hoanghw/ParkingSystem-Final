// JavaScript Document
function confirmed(event){
    var today = new Date();
    today.setHours(0,0,0,0);
    var timestamp = new Date().getTime();
    var oldTimestamp = new Date(event.data.timestamp).getTime();
    var un = window.localStorage["username"];
    var pw = window.localStorage["password"];

    if ((timestamp - oldTimestamp) > CONFIRMATION_EXPIRE || today.getTime() > oldTimestamp || !un || !pw){
        $(".modal-footer").hide();
        $("#conf-message").html(changetoSessionExpire());
        return false;
    }

	var garageName = event.data.garageName;
	var rate = event.data.rate;
	var totalCost = event.data.totalCost;
    var granularity = event.data.granularity;
    var duration = event.data.duration;

    $("#order-number").val(timestamp);

	$.get(SERVER_URL+"ucheckin/", {data:JSON.stringify({garage:garageName,
        rate:rate,
        totalCost:totalCost,
        username:un,
        password:pw,
        timestamp:timestamp,
        orderNumber:timestamp,
        granularity:granularity,
        duration:duration,
        space:space})},
        function(data, textStatus, jqXHR) {
            if (data["isSuccessful"]){
                $('#confirming').modal('hide');
	            $('#content-window').html(changeToParked(garageName,data["endTime"]));
                window.localStorage['parkingGarage'] = garageName;
                window.localStorage['parkingEndTime'] = data["endTime"];
                window.localStorage['parkingRate'] = rate;
                $('#payment').submit();
            }
        },"json")
        .done(function(){

        })
        .fail(function(){
            $('#confirming').modal('hide');
	        $('#content-window').html(changeToError());
        });
}

var favorite = new Array();
function getStatus(){
    $.get(SERVER_URL+"ugetstatus/", {data:JSON.stringify({username: window.localStorage['username']})}, function(data, textStatus, jqXHR) {
        if (data){
            if (data.error){
                signOut();
            }else{
                window.localStorage['token'] = data.token;
                $("#favorite-list").html("");
                for (var i=0; i<data.favorite.length; i++){
                    favorite.push(data.favorite[i]);
                }
                if (Object.keys(data.isParking).length != 0){
                    window.localStorage['parkingGarage'] = data.isParking.garage;
                    window.localStorage['parkingEndTime'] = data.isParking.endTime;
                    window.localStorage['parkingRate'] = data.isParking.rate;
                    $('#content-window').html(changeToParked(data.isParking.garage,data.isParking.endTime));
                }else{
                    window.localStorage.removeItem('parkingGarage');
                    window.localStorage.removeItem('parkingEndTime');
                    window.localStorage.removeItem('parkingRate');
                    $('#content-window').html(changeToNotParked());
                }
            }
        }
        },"json")
        .done(function(){
            updateFavorite(favorite);
        })
        .fail(function(){
            signOut();
        });
}

function fetchPrice(){
//    var tempStorage = window.sessionStorage;
    if (false){
//        console.log('in tempStorage');
//        rate=tempStorage[garageName+"_rate"];
//        totalCost=tempStorage[garageName+"_totalCost"];
    }else{
        $.get(SERVER_URL+"getrate/", {data:JSON.stringify({garage:garageName, username: window.localStorage['username']})}, function(data, textStatus, jqXHR) {
            var jsonObj = data;
            if (jsonObj){
                switch (jsonObj.granularity){
                    case PER_HOUR:
                        console.log('per hour');
                        $("#select-duration").show();
                        $("#select-space").show();
                        $("#slider").width(width*60/100);
                        rate = jsonObj.magnitude;
                        granularity = PER_HOUR;
                        duration = DEFAULT_DURATION_HOUR;
                        totalCost = duration*rate;
                        $("#rate").text("$"+rate+"/hour");
                        setTimePicker(rate);
                        setSpacePicker();
                        break
                    case PER_DAY:
                        console.log('per day');
                        $("#select-duration").hide();
                        $("#select-space").show();
                        rate = jsonObj.magnitude;
                        totalCost = jsonObj.magnitude;
                        granularity = PER_DAY;
                        duration = 1;
                        $("#rate").text("$"+rate+"/day");
                        setSpacePicker();
                        break;
                    default:
                        console.log('default');
                        rate = jsonObj.magnitude;
                        totalCost = jsonObj.magnitude;
                        granularity = PER_DAY;
                        duration = 1;
                        $("#rate").text("$"+rate+"/day");

                }
//                tempStorage[garageName+"_rate"] = rate;
//                tempStorage[garageName+"_totalCost"] = totalCost;
//                tempStorage[garageName]="was fetched at...";

                if (jsonObj.isFavorite){
                    markFavorite(false);
                }else{
                    unmarkFavorite(false);
                }
            }
            else {
                console.log('cannot parse');
                rate = 10;
                totalCost = 10;
                granularity = PER_DAY;
                duration = 1;
                $("#rate").text("$"+rate+"/day");
            }
        },"json").fail(function(){
                $('#content-window').html(changeToError());
            }).always(function(){
                $("#park-btn").removeAttr("disabled");
            });
    }
}

function setTimePicker(r){
    $('#duration-value').on('keyup change', function(){
        duration = Math.abs(parseInt(this.value,10));
        if (isNaN(duration)&&(duration==0)){
            duration = DEFAULT_DURATION_HOUR;
        }
        totalCost = duration*r;
    });
}

function setSpacePicker(){
    $('#space-value').on('keyup change', function(){
        space = parseInt(this.value,10);
    });
}

$('#confirming').on('show.bs.modal', function () {
    //Adjust Total Cost
    var current = window.localStorage["parkingGarage"];
    var endTime = window.localStorage["parkingEndTime"];
    var today = new Date();
    today.setHours(0,0,0,0);
    if ((current) && (endTime) && (today.getTime() < new Date(endTime*1000).getTime())){
        if (granularity == PER_DAY){
            var currentRate = window.localStorage["parkingRate"];
            if (rate > currentRate){
                totalCost = rate - currentRate;
            }else{
            totalCost = 0;
            }
        }
    }else if (current){
        window.localStorage.removeItem('parkingGarage');
        window.localStorage.removeItem('parkingEndTime');
        window.localStorage.removeItem('parkingRate');
    }

    $('#conf-garage').html(garageName);
    $('#conf-rate').html("$"+totalCost);

    //HOP
    $("#user-trans").val(window.localStorage['username']);
    $("#token-trans").val(window.localStorage['token']);
    $("#amount").val(""+totalCost);
    $("#order-number").val("2");

    var today = new Date();
    var timestamp = today.getTime();
    $('#confirmed').click({rate: rate,
        garageName: garageName,
        totalCost: totalCost,
        duration: duration,
        granularity: granularity,
        space: space,
        timestamp: timestamp
        },confirmed);
});