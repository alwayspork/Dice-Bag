// JavaScript Document
var maxSearchIterations = 1000;
var scrWide = $(window).width();
var min_x = -scrWide/2 + 100;
var max_x = scrWide/2 - 100;
var scrTall = $(window).height();
var min_y = 375;
var max_y = scrTall + 160;
var filled_areas = [];
var howManyToRoll;
var sidesnumber;
var diceSound = '1Die.wav';
var obj = document.createElement("audio");
topRtGrandTotal = parseInt(0);

obj.setAttribute('src',diceSound);

function giveMeRandom(maxNum, floor) {
	return (Math.floor(Math.random() * maxNum) + floor);
}

function dieSides() {
	if ( $('.js-change-dice-type .change-dice__option--selected').length > 0 ) {
		return $('.js-change-dice-type .change-dice__option--selected').val();
	} else {
		return 6;
	}
};

function howManyDice() {
	if  ( dieSides() == 'percent' ) {
		return '%';
	} else if ( $('.js-change-dice-count .change-dice__option--selected').length > 0 ) {
		return parseInt($('.js-change-dice-count .change-dice__option--selected').attr('value'));
	} else {
		return 1;
	}
};

function rollThisMany() {
	var howManyToRoll;
	var diceSound;

	switch ( howManyDice() ) {
			case 1: howManyToRoll = dieTypeImage();
					diceSound = "1Die.wav";
					break;
			case 2: howManyToRoll = dieTypeImage()+dieTypeImage();
					diceSound = "2Dice.wav";
					break;
			case 3: howManyToRoll = dieTypeImage()+dieTypeImage()+ dieTypeImage();
					diceSound = "3Dice.wav";
					break;
			case 4: howManyToRoll = dieTypeImage()+dieTypeImage()+ dieTypeImage()+dieTypeImage();
					diceSound = "4Dice.wav";
					break;
			case 5: howManyToRoll = dieTypeImage()+dieTypeImage()+ dieTypeImage()+dieTypeImage()+dieTypeImage();
					diceSound = "5Dice.wav";
					break;
			case 6: howManyToRoll = dieTypeImage()+dieTypeImage()+ dieTypeImage()+dieTypeImage()+dieTypeImage()+dieTypeImage();
					diceSound = "6Dice.wav";
					break;
					case 'percent': howManyToRoll = dieTypeImagePercentTens()+dieTypeImagePercentOnes();
					diceSound = "2Dice.wav";
					break;
		}

	$('.dieimage').html(howManyToRoll);
	obj.setAttribute('src',diceSound);
}

function dieTypeImage() {
	var sidesnumber = giveMeRandom((dieSides()), 1);

	return ('<img class="die" src="images/' + dieSides() + 'sided' + sidesnumber + '.png" />');
}

function dieTypeImagePercentTens() {
	var sidesnumber = giveMeRandom(9, 0);

	return ('<img class="die" src="images/10sided' + sidesnumber + '0.png" />');
}

function dieTypeImagePercentOnes() {
	var sidesnumber = giveMeRandom(9, 0);

	return ('<img class="die" src="images/10sided' + sidesnumber + '.png" />');
}

$(document).ready(function() {

	$('.js-change-dice-type').click(function() {
		$(this).toggleClass('change-dice--tapped');
	});

	$('.js-change-dice-count').click(function() {
		$(this).toggleClass('change-dice--tapped');
	});

	$('.change-dice__dropdown--type button').click(function() {
		$('.js-change-dice-type .change-dice__option--selected').removeClass('change-dice__option--selected');
		$(this).addClass('change-dice__option--selected');
		if ( $('.js-change-dice-type').hasClass('change-dice--tapped') ) {
			$(this).removeClass('change-dice--tapped');
		}
		$('.die').removeAttr('style');
		$('.js-change-dice-type-toggle').html('<img src="images/' + dieSides() + 'sided' + dieSides() + '.png" />');
	});

	$('.change-dice__dropdown--count button').click(function() {
		$('.js-change-dice-count .change-dice__option--selected').removeClass('change-dice__option--selected');
		$(this).addClass('change-dice__option--selected');
		if ( $('.js-change-dice-count').hasClass('change-dice--tapped') ) {
			$(this).removeClass('change-dice--tapped');
		}
		$('.die').removeAttr('style');
		$('.js-change-dice-count-toggle').html( howManyDice() );
	});

	$('.content').click(function() {
		rollThisMany();

		$('.die').each(function() {
			$(this).removeAttr('style').rotate({
				duration: giveMeRandom(0, 850),
				angle: 0,
				animateTo: giveMeRandom(110, 1020)
			});
		});

		randomize();
		obj.play();

		if ( dieSides() == 6 && howManyDice() == 1 ) {
			var dieimgsrc = $('.die').prop('src');
			var topRtTotal = parseInt(dieimgsrc.charAt(dieimgsrc.length-5));
			topRtGrandTotal = topRtTotal + topRtGrandTotal;
			$('.top-right-total').html(topRtTotal);
			$('.top-right-grandtotal').html(topRtGrandTotal);
		}
	});
});

function calc_overlap(a1) {
		var overlap = 0;
		for (i = 0; i < filled_areas.length; i++) {
			var a2 = filled_areas[i];

			// no intersection cases
			if (a1.x + a1.width < a2.x) {
				continue;
			}
			if (a2.x + a2.width < a1.x) {
				continue;
			}
			if (a1.y + a1.height < a2.y) {
				continue;
			}
			if (a2.y + a2.height < a1.y) {
				continue;
			}

			// intersection exists : calculate it!
			var x1 = Math.max(a1.x, a2.x);
			var y1 = Math.max(a1.y, a2.y);
			var x2 = Math.min(a1.x + a1.width, a2.x + a2.width);
			var y2 = Math.min(a1.y + a1.height, a2.y + a2.height);

			var intersection = ((x1 - x2) * (y1 - y2));

			overlap += intersection;
		}

		return overlap;
}

function randomize() {
		filled_areas.splice(0, filled_areas.length);
		var index = 0;
		$('.die').each(function() {
			var rand_x = 0;
			var rand_y = 0;
			var i = 0;
			var smallest_overlap = 50;
			var best_choice;
			var area;
			for (i = 0; i < maxSearchIterations; i++) {
				rand_x = Math.round(min_x + ((max_x - min_x) * (Math.random() % 1)));
				rand_y = Math.round(min_y + ((max_y - min_y) * (Math.random() % 1)));
				area = {
					x: rand_x,
					y: rand_y,
					width: 80,
					height: 80
				};
				var overlap = calc_overlap(area);
				if (overlap < smallest_overlap) {
					smallest_overlap = overlap;
					best_choice = area;
				}
				if (overlap === 0) {
					break;
				}
			}

			filled_areas.push(best_choice);

			$(this).css({
					position: "absolute",
					"z-index": index++
			});
			$(this).animate({
					left: rand_x,
					bottom: rand_y
			});
		});
		return false;
}


// starting to attempt using accelerometer to see if a "shake" happened
document.addEventListener('deviceready', onDeviceReady, false);
var lastX,lastY,lastZ;
var moveCounter = 0;
function onDeviceReady() {
		navigator.accelerometer.watchAcceleration(gotMovement, errHandler,{frequency:200});
}
function errHandler(e) {
		console.log("--- ERROR ---");
		console.dir(e);
}
function gotMovement(a) {
		if(!lastX) {
				lastX = a.x;
				lastY = a.y;
				lastZ = a.z;
				return;
		}
		var deltaX, deltaY, deltaZ;
		deltaX = Math.abs(a.x-lastX);
		deltaY = Math.abs(a.y-lastY);
		deltaZ = Math.abs(a.z-lastZ);
		if(deltaX + deltaY + deltaZ > 3) {
				moveCounter++;
		} else {
				moveCounter = Math.max(0, --moveCounter);
		}
		if(deltaX !=0 || deltaY != 0 || deltaZ != 0) console.log(deltaX,deltaY,deltaZ,moveCounter);
		if(moveCounter > 1) {
				rollThisMany();
				$('.die').each(function() {
						$(this).removeAttr('style').rotate({
								duration: giveMeRandom(0, 850),
								angle: 0,
								animateTo: giveMeRandom(110, 1020)
						})
				});
				randomize();
				obj.play();
				moveCounter=0;
		}
		lastX = a.x;
		lastY = a.y;
		lastZ = a.z;
}
