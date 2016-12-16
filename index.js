/**
 * @module  pan-zoom
 *
 * Events for pan and zoom
 */
'use strict';


var Impetus = require('impetus');
var wheel = require('mouse-wheel');
var touchPinch = require('touch-pinch');
var position = require('touch-position');


module.exports = panzoom;


function panzoom (target, cb) {
	if (!target || !(cb instanceof Function)) return false;


	//enable panning
	var pos = position({
		element: target
	});

	var impetus;

	var lastY = 0, lastX = 0;
	impetus = new Impetus({
		source: target,
		update: function(x, y) {
			var e = {
				type: 'mouse',
				dx: x-lastX, dy: y-lastY, dz: 0,
				x: pos[0], y: pos[1]
			};

			lastX = x;
			lastY = y;

			cb(e);
		},
		multiplier: 1,
		friction: .75
	});


	//enable zooming
	wheel(target, function(dx, dy, dz, e) {
		e.preventDefault();
		cb({
			type: 'mouse',
			dx: 0, dy: 0, dz: dy,
			x: pos[0], y: pos[1]
		});
	});

	//mobile pinch zoom
	var pinch = touchPinch(target);
	var mult = 2;
	var initialCoords;

	pinch.on('start', function(curr) {
		impetus && impetus.pause();

    var f1 = pinch.fingers[0];
    var f2 = pinch.fingers[1];

		initialCoords = [f2.position[0]*.5 + f1.position[0]*.5, f2.position[1]*.5 + f1.position[1]*.5];
	});
	pinch.on('end', function() {
		initialCoords = null;

		impetus && impetus.resume();
	});
	pinch.on('change', function(curr, prev) {
		if (!pinch.pinching || !initialCoords) return;

		cb({
			type: 'touch',
			dx: 0, dy: 0, dz: -(curr - prev)*mult,
			x: initialCoords[0], y: initialCoords[1]
		});
	});
}
