
function updateFavorite(garages){
    var l = garages.length;
    if (l == 0){
        $("#favorite-list").html("No favorite garages selected");
    }else if (l == 1){
        var text = '<input type="button" style="margin-bottom: 0px; padding-bottom: 0px;" class="btn btn-danger" id="'
                +garages[0]
                +'" value="'
                +garages[0]
                +'" onclick="parkGarage(this.id);"/>';
        $("#favorite-list").html(text);
    }else{
//        var text ='<div class="btn-group"><button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown">Click here ... <span class="caret"></span></button>'
//            +'<ul style="text-align: center; background-color: whitesmoke;" class="dropdown-menu" role="menu">';
//        for (var i=0; i<l; i++){
//            text +='<li><input type="button" class="btn btn-danger" style="margin-bottom: 5px;" id="'
//                +garages[i]
//                +'" onclick="parkGarage(this.id);" value="'
//                +garages[i]
//                +'"></li>';
//        }
//        text += '</ul></div>';
        var text = '<select id="select-favorite" '
            +'onChange="if (this.options[this.selectedIndex].value) parkGarage(this.options[this.selectedIndex].value);" '
            +'class="form-control">'
            +'<option value=""></option>';
        for (var i=0; i<l; i++){
            text +='<option value="'
                +garages[i]
                +'">'
                +garages[i]
                +'</option>';
        }
        text += '</select>';
        $("#favorite-list").html(text);
    }
}


function toggleFavorite(){
    if (isFavorite){
        unmarkFavorite(true);
    }else{
        markFavorite(true);
    }
    updateFavorite(favorite);
}
function markFavorite(toServer){
    $("#mark-favorite-btn").attr("class", "btn btn-danger");
    $("#mark-favorite-btn").val("Unfavorite");
    $(".fav-garage").show();
    if (favorite.indexOf(garageName) == -1)
        favorite.push(garageName);
    isFavorite=true;
    if (toServer){
        updateFavToServer(true);
    }
}

function unmarkFavorite(toServer){
    $("#mark-favorite-btn").attr("class", "btn btn-warning");
    $("#mark-favorite-btn").val("Favorite");
    $(".fav-garage").hide();
    var index = favorite.indexOf(garageName);
    if (index != -1)
        favorite.splice(favorite.indexOf(garageName),1);
    isFavorite=false;
    if (toServer){
        updateFavToServer(false);
    }
}

function updateFavToServer(isFavorite){
    console.log("garage: "+garageName+" isFavorite: "+isFavorite);
    $.get(SERVER_URL+"uupdatefav/", {data:JSON.stringify({garage:garageName,isFavorite:isFavorite,username:window.localStorage["username"]})}, function(data, textStatus, jqXHR) {
        },"json")
        .done(function(){

        })
        .fail(function(){
            $('#content-window').html(changeToError());
        });
}