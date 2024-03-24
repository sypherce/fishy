import { canvas, context } from '../core/globals.js';

const drawPixel = (ctx, x, y, w = 1, h = 1, color = '#fff') => {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, w, h);
};

function moveInBezierCurve(object, startX, startY, targetX, targetY) {
	const start = { x: startX, y: startY };
	const end = { x: targetX, y: targetY };

	const midY = (start.y + end.y) / 2;
	const mid1Y = { x: start.x, y: midY };
	const mid2Y = { x: end.x, y: midY };
	const setY = [start, mid1Y, mid2Y, end];

	const midX = (start.x + end.x) / 2;
	const mid1X = { x: midX, y: start.y };
	const mid2X = { x: midX, y: end.y };
	const setX = [start, mid1X, mid2X, end];

	const [p0, p1, p2, p3] = Math.floor(Math.random() * 2) ? setY : setY;

	//Calculate the coefficients based on where the object currently is in the animation
	const cx = 3 * (p1.x - p0.x);
	const bx = 3 * (p2.x - p1.x) - cx;
	const ax = p3.x - p0.x - cx - bx;

	const cy = 3 * (p1.y - p0.y);
	const by = 3 * (p2.y - p1.y) - cy;
	const ay = p3.y - p0.y - cy - by;

	//Increment t value by speed
	object.t += object.speed * 3;
	if (object.t > 1) {
		object.t = 1;
	}

	const t = object.t;

	//Calculate new X & Y positions of object
	const xt = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
	const yt = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;

	for (let _t = 0; _t <= 1.0 + object.speed + 0.1; _t += object.speed + 0.1) {
		if (_t >= 1.0) _t = 1.0;
		const _xt = ax * Math.pow(_t, 3) + bx * Math.pow(_t, 2) + cx * _t + p0.x;
		const _yt = ay * Math.pow(_t, 3) + by * Math.pow(_t, 2) + cy * _t + p0.y;
		if (_t === 0) drawPixel(context, _xt, _yt, 10, 10, '#000');
		else if (_t >= 1.0) drawPixel(context, end.x, end.y, 10, 10, '#0f0');
		else drawPixel(context, _xt, _yt, 10, 10, '#fff');
		if (_t >= 1.0) break;
	}

	object.x = xt;
	object.y = yt;
	drawPixel(context, xt, yt, 10, 10, '#f00');

	return object;
}

export { moveInBezierCurve };
