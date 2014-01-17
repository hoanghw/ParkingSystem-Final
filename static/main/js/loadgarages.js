// JavaScript Document
var width = $(window).width();
var height = $(window).height();
var garageName="default";
var rate=17;
var totalCost=17;
var duration= DEFAULT_DURATION_HOUR;
var granularity= PER_DAY;
var isFavorite=false;
var space=0;
var loading_css = $('#loading');

function showMap() {
    $("#content-window").html(changeToNotParked());
    $("#select-favorite").val("");
    var map_canvas = $("#map-canvas");
    loading_css.show();
    $("#list-canvas").hide();
    map_canvas.show();
	var myLatlng = new google.maps.LatLng(37.870296,-122.258995);
	var mapOptions = {
		zoom: 15,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

    map_canvas.height(height*60/100);
	var map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);

    //var kmlLayer = new google.maps.KmlLayer('https://dl.dropboxusercontent.com/u/12960227/UCBerkeleyParkingLotsGarages.kml',
	var kmlLayer = new google.maps.KmlLayer('https://dl.dropboxusercontent.com/u/63704802/UCBerkeleyParkingLotsGarages-noimg.kml',
	//var kmlLayer = new google.maps.KmlLayer('http://localhost:8080/UCBerkeleyParkingLotsGarages.kml',
	{
		suppressInfoWindows: true,
		preserveViewport: true
	});
	kmlLayer.setMap(map);

	google.maps.event.addListener(kmlLayer, 'click', function(kmlEvent) {
		var text = changeToParkingGarage(kmlEvent.featureData.name);
        text += '<div class="well well-sm">'
            + kmlEvent.featureData.description
			+ '</div>';

		showInContentWindow(text);
        $(".fav-garage").hide();
		$("#park-btn").attr("disabled","disabled");
		garageName = kmlEvent.featureData.name;
		fetchPrice();

	});

	function showInContentWindow(text) {
		var sidediv = document.getElementById('content-window');
		sidediv.innerHTML = text;
	}

	google.maps.event.addListener(kmlLayer, 'metadata_changed', function () {
        loading_css.hide();
	});
}

//google.maps.event.addDomListener(window, 'load', initialize);

var listGarages=["4th Street Lot","Anna Head Court","Anna Head Lot","Bancroft/Fulton Lot","Bancroft/Fulton West (Underground)","Bancroft Structure","Banway Lot","Barrows Annex Lot","Barrows Lane","Berkeley Way Lot","Bechtel Drive","Boalt Lot","Botanical Garden Lot","Bowles Lot ","Carleton Street","Centennial Drive","Clark Kerr - Building 4","Clark Kerr-Building 19","Clark Kerr - Building 20","Clark Kerr-Golden Bear Lot","Clark Kerr-Horseshoe Driveway","Clark Kerr - Lower Court Street","Clark Kerr-North Street","Clark Kerr Northwest Lot","Clark Kerr Southwest Lot","Clark Kerr-Sports Lane","Clark Kerr - Upper Court Street","Cleary Hall (Haste/Channing Housing)","Coffer Dam Lot","College Lot","Dana/Durant Lot","Donner Lot","Dwinelle Annex","Dwinelle Lot","East Lot","Ellsworth Structure","Epworth West Lot","Eshleman Road","Extension Lot North","Extension Lot South","Faculty Club Lane","Foothill Lot","Frank Schlessinger Way","Genetics Structure (Underground)","Haas Pavilion Lot","Hearst Gym","Hildebrand Hall, East of","Hill Terrace 1","Hill Terrace 2","Hill Terrace 3","Kroeber Lot","Lawrence Hall of Science - Circle","Lawrence Hall of Science Staff Lot","Lower Hearst Structure","Manville Lot (Underground)","Moses Court Lot","MSRI Parking Only","Mulford Hall Lot","NorthWest Crescent","Optometry Lane","Oxford Research Unit Lot","Oxford Tract South Lot","Prospect Court Lot (Construction)","Public Parking Off-Campus","Recreational Sports Facility Structure (Underground)","Ridge Lot ","Sather Lot","South Drive","SouthWest Crescent","Space Science Access Road","Space Sciences Laboratory Lot","Space Science Laboratory - Upper Lot","Sproul Lot","Strawberry Canyon Lot","Stadium Rim Way Lot","Tang Center 30min Lot","Tolman Hall Breezeway","Underhill Structure","Unit 1 Lot","Unit 2 Lot","University Drive","University Hall Well Lot","University Hall West Lot","Upper Hearst Structure","Vista Lot","Wellman Courtyard Lot","West Circle","Wickson Road","Witter Field Lot"];

function showList(){
    $("#content-window").html(changeToNotParked());
    $("#select-favorite").val("");
    var list_canvas = $("#list-canvas");
    $("#map-canvas").hide();
    list_canvas.show();

    var l = listGarages.length;
    var text = '<div class="well well-sm"><select id="select-garage" '
            +'onChange="if (this.options[this.selectedIndex].value) parkGarage(this.options[this.selectedIndex].value);" '
            +'class="form-control"> '
            +'<option value=""></option>';
        for (var i=0; i<l; i++){
            text +='<option value="'
                +listGarages[i]
                +'">'
                +listGarages[i]
                +'</option>';
        }
        text += '</select></div>';
    list_canvas.html(text);
}

function parkGarage(g){
    $("#list-canvas").hide();
    garageName=g;
    $("#content-window").html(changeToParkingGarage(garageName));
    fetchPrice();
}

function changeGarage(){
    $("#content-window").html(changeToNotParked());
    //$('html,body').scrollTop($('#favorite').position().top);
    $('html,body').scrollTop(0);
}