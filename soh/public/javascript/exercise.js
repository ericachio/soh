$(document).ready(function(){


	$.getJSON("data.json", function (data) {
	    $.each(data, function (index, value) {
	       console.log(value);
	    });
	});

});