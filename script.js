
///////////////////////////////////////////////////////////////////
//Constants

const gmap_key = "AIzaSyB6ky0s6kmaxH15hsxsNHKuZeI6n_OG2eA";
const uber_key = "Token ECWcv5urK26d-pz-OHio9c9ovHpahx4UBbQIzMTi";
var remind_every = 8000; //time duration in seconds

///////////////////////////////////////////////////////////////////

	function validateEmail(email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	}

	function show_alert_func(text) {
	    var x = document.getElementById("snackbar")
	    x.className = "show";
	    x.innerHTML = text;
	    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
	}

	var initiate_hour_selector = function(minimum_hour)
	{
		$('#hour_select').contents().remove();
		for (var i = minimum_hour; i<=24; i++){
		    var opt = document.createElement('option');
		    opt.value = i;
		    opt.innerHTML = (i < 10) ? '0' + i.toString() : i.toString();
		    $('#hour_select').append(opt);
		}
	}
	var initiate_minute_selector = function(minimum_minute){
		$('#min_select').contents().remove();
		for (var i = minimum_minute; i<=59; i++){
		    var opt = document.createElement('option');
		    opt.value = i;
		    opt.innerHTML = (i < 10) ? '0' + i.toString() : i.toString();
		    $('#min_select').append(opt);
		}
	}

	var update_minute_selector = function(){
		if($('#hour_select').val() <= date.getHours()) initiate_minute_selector(date.getMinutes());
		else initiate_minute_selector(0);
	}

	var date = new Date();
	var calltimer;
	initiate_hour_selector(date.getHours());
	initiate_minute_selector(date.getMinutes());

	var get_distance = function(show_alert){
			
		clearInterval(calltimer);
		var start_latitude = parseFloat($('#start_latitude').val().trim());
		var start_longitude = parseFloat($('#start_longitude').val().trim());
		var end_latitude = parseFloat($('#end_latitude').val().trim());
		var end_longitude = parseFloat($('#end_longitude').val().trim());
		var desired_hour = parseFloat($('#hour_select').val());
		var desired_min = parseFloat($('#min_select').val());
		var user_email = $('#email').val();
		if(validateEmail(user_email)){

			var user_time_in_seconds = (desired_min*60 + desired_hour*60*60);
			var current_time_in_seconds = (date.getMinutes()*60 + date.getHours()*60*60);

			$.ajax({
	         	url: "https://api.uber.com/v1/estimates/price?start_latitude="+start_latitude+"&start_longitude="+start_longitude+"&end_latitude="+end_latitude+"&end_longitude="+end_longitude,
	         	type: "GET",
	         	beforeSend: function(xhr){xhr.setRequestHeader('Authorization', uber_key);},
	         	success: function(uber_response) {
	         		$.ajax({
			         	url: "https://maps.googleapis.com/maps/api/directions/json?origin="+start_latitude+","+start_longitude+"&destination="+end_latitude+","+end_longitude+"&key="+gmap_key,
			         	type: "GET",
			         	success: function(gmap_response) {
			         		var minimum_google_time = gmap_response.routes[0].legs[0].duration.value;
			         		var minimum_uber_time = uber_response.prices[0].duration;
			         		
			         		uber_response.prices.forEach(function(u){
			         			if(minimum_uber_time>u.duration) minimum_uber_time = u.duration;
			         		});

			         		var max_deviation_time = minimum_uber_time + 15*60 + minimum_google_time + 60*60;
			         		var remaining_time = user_time_in_seconds - max_deviation_time - current_time_in_seconds;
			         		if(remaining_time>0)
			         		{
			         			show_alert_func('You have ' + parseInt(remaining_time/3600) + ' Hours and ' + parseInt((remaining_time%3600)/60) + ' Minutes');
			         			setTimeout(function(){ 
			         				get_distance(true);
			         			}, ((remaining_time)*1000));
			         		}
			         		else{
			         			calltimer = setInterval(function(){ 
			         				get_distance(true);
			         			}, remind_every);
			         		}

			         		if(show_alert){
			         			show_alert_func('You should book your cab now<br>Estimated Travel Time : <b>'+ parseInt(minimum_google_time/60) +' Mins</b><br>Estimated Cab Arrival Time : <b>'+ parseInt(minimum_uber_time/60) +' Mins</b>');
			         		}

			         		$('#message_div').show();
			         		$('#message_div').contents().remove();
			         		$('#message_div').append('<p>Estimated Travel Time : <b>'+ parseInt(minimum_google_time/60) + ' Mins</b></p><p>Estimated Cab Arrival Time : <b>'+ parseInt(minimum_uber_time/60) +' Mins</b></p>');
			         		if(remaining_time > 0){
			         			$('#message_div').append('<p>You will be reminded again after '+ parseInt(remaining_time/3600) +' Hours and '+ parseInt((remaining_time%3600)/60) +' Mins</p>');
			         		}
			         		else{
			         			$('#message_div').append('<p>You will be reminded again after '+ remind_every/1000 +' Seconds</p>');	
			         		}

			        	}
			      	});
	        	}
	      	});
	    }

	    else{
	    	show_alert_func('Please enter valid email');
	    }
	}
