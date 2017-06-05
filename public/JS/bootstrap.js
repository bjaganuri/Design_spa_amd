/**
 * bootstraps angular onto the window.document node
 */
define([
    'require',
    'angular',
    'app',
	'./source/config',
	'./source/run',
], function (require, angular) {
    'use strict';

    require(['domReady!'], function (document) {
        angular.bootstrap(document, ['app']);
    });
});
