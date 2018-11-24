var map;
var directionsDisplay;
var directionsService;
var allAddress = [];
var aTextArea;
var bTextArea;


  function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
    gestureHandling: 'greedy',
        center: {lat: 45.811961, lng: 7.363960} // center Europe
      });

  search();
      directionsService = new google.maps.DirectionsService;
      directionsDisplay = new google.maps.DirectionsRenderer({
        draggable: true,
        map: map,
        panel: null// document.getElementById('right-panel')
      });

      displayRoute();

  google.maps.event.addListener(directionsDisplay, "directions_changed", function(){
    var res = directionsDisplay.getDirections();
    setDiv(res);
  });

  }


function resetMap(){
  allAddress = [];
  document.getElementById("list").innerHTML = '';
  document.getElementById("info_box").innerHTML = '';
  document.getElementById("origin").value = '';
  document.getElementById("destination").value = '';
  directionsDisplay.setMap(null);

}


  function displayRoute() {
  // add origin->destination->waypoints
  //var waypoints    = [];
  var       origin;
  var  destination;
  var geocoder = new google.maps.Geocoder();
  map.addListener('click', function(event) {

    geocoder.geocode({'latLng': event.latLng}, function(results, status) {
    if (status === "OK") {
      if (results[0]) {
        // has origin
        eventAddress = results[0].formatted_address;
        allAddress.push(eventAddress);
        origin = allAddress[0];
        document.getElementById("origin").value = origin;
        if(allAddress.length > 1){// has destination
          destination = allAddress[1];
          document.getElementById("destination").value = destination;
          var waypoints    = [];
          if(allAddress.length > 2){// has waypoint

            for(var k=2; k<allAddress.length; k++){
              waypoints.push({
                location: allAddress[k],
                stopover: true
              });
            }
          }

          console.log("displayRoute: "+origin);
          console.log("displayRoute: "+destination);
          console.log("displayRoute: "+waypoints);
          console.log("======================================" );
          doRequest(origin, destination, waypoints);
        }
      }
    }
    else
      console.log('Geocode was not successful for the following reason: ' + status);
    });
  });
}

function doRequest(origin, destination, waypoints ){
  // request
  directionsService.route({
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: 'WALKING',
      avoidTolls: true
    }, function(response, status) {
      if (status === 'OK') {
      directionsDisplay.setDirections(response);
      setDiv(response);
      } else {
      console.log('Could not display directions due to: ' + status);
      }
  });
}

function setDiv(response){
    console.log(response.routes[0]);

  var address = [];
  var route = response.routes[0];
  var legs = route.legs;
  document.getElementById("list").innerHTML = "";
  var totalDistance=0;
  var totalDuration=0;
  var toAdd = document.createDocumentFragment();
  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var labelIndex = 0;
  var i ;
  for (i = 0; i < legs.length; i++) {
    totalDistance += legs[i].distance.value;
    totalDuration += legs[i].duration.value;
    var start      = legs[i].start_address;
    var end 	   = legs[i].end_address;
    var startCoord = legs[i].start_location;
    var endCoord   = legs[i].end_location;
    if(!address.includes(start) ){
      address.push(start);
      //div : 1)span 2)image 3)li
      var div = document.createElement('DIV');
      var li = document.createElement('LI');
      li.id = 'start'+i;
      //li.id = labels[labelIndex++ % labels.length];
      li.innerHTML = start;
      li.setAttribute("address", start);
      li.setAttribute("addressCoord", startCoord);
      li.className = "address";
      var span = document.createElement('SPAN');
      span.className="close";
      span.id="close";
      span.textContent="x";
      var image = document.createElement('DIV');
      image.style.backgroundImage = "url('red.png')";
      image.className="image";
      image.textContent=labels[labelIndex++ % labels.length];
      var arrowUp = document.createElement('I');
      arrowUp.className="arrowUp";
      var arrowDown = document.createElement('I');
      arrowDown.className="arrowDown";
      var steps = document.createElement('UL');
      steps.className="steps";
      //steps.textContent="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      steps.innerHTML="";
      var stepsVar = legs[i].steps
      for (j=0;j<stepsVar.length;j++) {
        steps.innerHTML += "<li>"+stepsVar[j].instructions;
        var dist_dur = "";
        if (stepsVar[j].distance && stepsVar[j].distance.text)
          dist_dur += "&nbsp;"+stepsVar[j].distance.text;
        if (stepsVar[j].duration && stepsVar[j].duration.text)
          dist_dur += "&nbsp;"+stepsVar[j].duration.text;
        if (dist_dur != "")
          steps.innerHTML += dist_dur+"<br /></li>";
        else
          steps.innerHTML += "</li>";
      }

      var comment = document.createElement('TEXTAREA');
      comment.className= "comment";
      comment.value= "";
      comment.placeholder= "Add recommendation...";
      comment.type = "text";
      comment.rows="1";
      comment.cols="55";

      div.appendChild(span);
      div.appendChild(image);
      div.appendChild(arrowUp);
      div.appendChild(arrowDown);
      div.appendChild(li);
      div.appendChild(comment);
      div.appendChild(steps);

      toAdd.appendChild(div);
    }
    //if(!address.includes(end)){
    if(i===legs.length-1){
      address.push(end);
      var div = document.createElement('DIV');
      var li = document.createElement('LI');
      //li.id = labels[labelIndex++ % labels.length];
      li.id = 'end'+i;
      li.innerHTML = end;
      li.setAttribute("address", end);
      li.setAttribute("addressCoord", endCoord);
      li.className = "address";
      var span = document.createElement('SPAN');
      span.id="close";
      span.className="close";
      span.textContent="x";
      var image = document.createElement('DIV');
      image.style.backgroundImage = "url('red.png')";
      image.className="image";
      image.textContent=labels[labelIndex++ % labels.length];
      var arrowUp = document.createElement('I');
      arrowUp.className="arrowUp";
      var arrowDown = document.createElement('I');
      arrowDown.className="arrowDown";
      //var steps = document.createElement('LI');
      //steps.textContent="Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      //steps.className="steps";
      var comment = document.createElement('TEXTAREA');
      comment.className= "comment";
      comment.value= "";
      comment.placeholder= "Add recommendation...";
      comment.type = "text";
      comment.rows="1";
      comment.cols="55";

      div.appendChild(span);
      div.appendChild(image);
      div.appendChild(arrowUp);
      div.appendChild(arrowDown);
      div.appendChild(li);
      div.appendChild(comment);
      //div.appendChild(steps);

      toAdd.appendChild(div);
    }

  }
  secondsToHmsDistance(totalDuration, totalDistance);

  //update global var
  allAddress=address;
  //put end to 2nd pos
  allAddress.splice(1, 0, allAddress.pop());
  document.getElementById("destination").value = allAddress[1];
  document.getElementById("origin").value = allAddress[0];
  document.getElementById('list').appendChild(toAdd);

  handleCloseButton();
  handleSwapButton();
  handleCollapsible();
  handleCommentArea();
  handleSugestionTable();
}

function handleSugestionTable(){
  var row = document.getElementsByClassName("clickable-row");
  for (var i = 0; i < row.length; i++) {
    row[i].addEventListener("click", function() {
      //console.log("this:   "+ this.cells[1].innerHTML);
      allAddress.push(this.cells[1].innerHTML);
      if(allAddress.length>1){
        var waypoints=[];
        for (var j = 2; j < allAddress.length ; j++) {
            waypoints.push({
              location: allAddress[j],
              stopover: true
            });
        }
        doRequest(allAddress[0],allAddress[1],waypoints);
      }
    });
  }
}


function secondsToHmsDistance(sec, totalDistance) {
  //compute total time
  sec = Number(sec);
  var h = Math.floor(sec / 3600);
  var m = Math.floor(sec % 3600 / 60);
  var s = Math.floor(sec % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  var totalDuration = hDisplay + mDisplay + sDisplay;

  //compute total distance
  totalDistance=totalDistance/1000;
  document.getElementById("info_box").innerHTML="Total distance: " +totalDistance +" km " +'<br />'+"Duration: "+totalDuration ;
}

function handleCommentArea(){
  var textarea = document.getElementsByClassName("comment");
  for (var i = 0; i < textarea.length; i++) {
    textarea[i].addEventListener("click", function() {
      this.rows="5";
    });
  }
}

function handleCollapsible(){
  var coll = document.getElementsByClassName("address");
  for (var i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
}

function handleSwapButton(){
  var arrowUp = document.getElementsByClassName('arrowUp');
  for (var i=0; i < arrowUp.length; i++)
    arrowUp[i].addEventListener("click", arrowU);
  var arrowDown = document.getElementsByClassName('arrowDown');
  for (var j=0; j < arrowDown.length; j++)
    arrowDown[j].addEventListener("click", arrowD);
}

function arrowU(){
  var waypoints = [];
  var divA = this.parentNode;
  var a = divA.childNodes[4].getAttribute("address");// 4=li(address)
  var divB = this.parentNode.previousSibling;
  var b = divB.childNodes[4].getAttribute("address");
  var list = document.getElementById("list").children;
  if(divB !=null){
    //swap address
    divA.parentNode.insertBefore(divA,divB);
    for (var i = 0; i < list.length; i++) {
      if(list[i]===divA){
        //put end in last position
        allAddress.push(allAddress.splice(1, 1)[0]);
        var indexA = allAddress.indexOf(a);
        var indexB = allAddress.indexOf(b);
        //swap positions
        var temp = allAddress[indexA];
        allAddress[indexA] = allAddress[indexB];
        allAddress[indexB] = temp;
        //put end in 2nd position
        allAddress.splice(1, 0, allAddress.pop());
        //fill waypoints
        for (var j = 2; j < allAddress.length ; j++) {
          waypoints.push({
            location: allAddress[j],
            stopover: true
          });
        }
        doRequest(allAddress[0],allAddress[1],waypoints);
        waypoints=[];
      }
    }
  }
}

function arrowD(){
  var waypoints = [];
  var divA = this.parentNode;
  var a = divA.childNodes[4].getAttribute("address");
  var divB = this.parentNode.nextSibling;
  var b = divB.childNodes[4].getAttribute("address");
  var list = document.getElementById("list").children;
  if(divB !=null){
    //swap address
    divA.parentNode.insertBefore(divB, divA);
    for (var i = 0; i < list.length; i++) {
      if(list[i]===divA){
        //put end in last position
        allAddress.push(allAddress.splice(1, 1)[0]);
        var indexA = allAddress.indexOf(a);
        var indexB = allAddress.indexOf(b);
        //swap positions
        var temp = allAddress[indexA];
        allAddress[indexA] = allAddress[indexB];
        allAddress[indexB] = temp;
        //put end in 2nd position
        allAddress.splice(1, 0, allAddress.pop());
        //fill waypoints
        for (var j = 2; j < allAddress.length ; j++) {
          waypoints.push({
            location: allAddress[j],
            stopover: true
          });
        }
        doRequest(allAddress[0],allAddress[1],waypoints);
      }
    }
  }
}

function handleCloseButton(){
  var close = document.getElementsByClassName('close');
  for (var i=0; i < close.length; i++)
    close[i].addEventListener("click", removeDirection);
}

function removeDirection(){
  var waypoints = [];
  var listold = document.getElementById("list").children;

  if(listold.length <= 2){
    resetMap();
  }


  if(listold.length > 2){
    //remover do global
    for (var i = 0; i < listold.length; i++) {
      //o a remover é igual uma pos da lista de divs
      if(listold[i]===this.parentNode){
        //console.log("o a remover: "+listold[i].innerHTML);
        //var counter=i;
        var index = i+1;
        //console.log("pos i: "+i +"--<> value in pos i: "+ allAddress[i]+"--<> in array: "+ allAddress);
        //console.log("allAddress[1]: "+ allAddress[1]);
        //console.log("listold[i].childNodes[2].getAttribute(address): "+listold[i].childNodes[2].getAttribute("address"));
        //if remove origin swap with 3rd
        if(allAddress[0] === listold[i].childNodes[4].getAttribute("address")){
          index = 2;
          var temp = allAddress[0];
          allAddress[0] = allAddress[2];
          allAddress[2] = temp;
        }
        //if remove end
        if(allAddress[1] === listold[i].childNodes[4].getAttribute("address"))
          index = 1;
        //console.log("all address position deleted: "+index);
        //update/remove from global var
        if (index > -1)
          allAddress.splice(index, 1);
        // if end removed, last pos is end in 2nd pos
        if(index===1)
          allAddress.splice(1, 0, allAddress.pop());


        //console.log("new all address: "+ allAddress);
      }
    }
    this.parentNode.parentNode.removeChild(this.parentNode);
    var list = document.getElementById("list").children;
      //for (var i = 0; i < list.length; i++) {
    for (var j = 2; j < allAddress.length ; j++) {
      //console.log("Remove waypoints: "+allAddress[j]);
      waypoints.push({
        location: allAddress[j],
        stopover: true
      });
    }
    //console.log("Remove start: "+allAddress[0]);
    //console.log("Remove end: "+allAddress[1]);
    //console.log("------------------------------------------------");
    doRequest(allAddress[0],allAddress[1],waypoints);
    waypoints=[];
    //}
  }
}

 function search(){
  // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      var searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      // Bias the SearchBox results towards current map's viewport.
      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });

   var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

  // Clear out the old markers.
  window.setTimeout(function() {
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
  }, 3000);
      markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

     // Create a marker for each place.

          markers.push(new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location
          }));



          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });
}

function selectValue(form) {
  var f = form.cities;
  var coord = f.options[f.selectedIndex].value;

    var partsOfStr = coord.split(', ');
    var lat = partsOfStr[0];
    var lng = partsOfStr[1];
    var latLng = new google.maps.LatLng(lat, lng); //Makes a latlng
    map.panTo(latLng);
    map.setZoom(10);
}
