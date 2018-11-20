$(document).ready(function(){
	$("#header").hide().delay(300).fadeIn(3000);
	$("#follow").hide().delay(1000).fadeIn(3000);

	var boxdelay = 1000;
	var increment = 400;

	$(".btext").each(function(){
		boxdelay += increment;
		$(this).hide().delay(boxdelay).fadeIn(2000);
	});


});