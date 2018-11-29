$(document).ready(function(){
	$("#header").hide().delay(300).fadeIn(3000);
	$("#follow").hide().delay(800).fadeIn(3000);
	$("#follow2").hide().delay(1300).fadeIn(3000);

	var boxdelay = 700;
	var increment = 400;

	$(".bform").hide().delay(boxdelay+700).fadeIn(3000);

	$(".btext").each(function(){
		boxdelay += increment;
		$(this).hide().delay(boxdelay).fadeIn(2000);
	});

	var boxdelay2 = 700
	$(".profiletext").each(function(){
		boxdelay2 += increment;
		$(this).hide().delay(boxdelay2).fadeIn(2000);
	});

	$(".backbutton").hide().delay(boxdelay).fadeIn(2000);

});