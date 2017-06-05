define([
    'angular',
	'ngAnimate',
	'ngIdleService',
	'uiRouter',
	'angularSlider',
	'angularModalService',
	'angularColorPicker',
	'angularTreeView',
    './source/angular/Controllers/index',
    './source/angular/Directives/index',
    './source/angular/Services/index'
], function (ng) {
    'use strict';

    return ng.module('app', [
        'app.services',
        'app.controllers',
        'app.directives',
		'ui.router',
		'ngIdle',
		'ngAnimate',
		'colorpicker.module',
		'rzModule',
		'angularTreeview',
		'angularModalService'
    ]);
});