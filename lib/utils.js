"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.filterObjByKeys = filterObjByKeys;
function filterObjByKeys(values, filterKeys) {
	return Object.keys(values).filter(function (id) {
		return filterKeys.includes(id);
	}).reduce(function (p, c) {
		var d = _extends({}, p);
		d[c] = values[c];
		return d;
	}, {});
}