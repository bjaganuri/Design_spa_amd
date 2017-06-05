require.config({

  // alias libraries paths
    paths: {
        'domReady': './lib/requirejs-domready/domReady',
        'angular': './lib/angular/angular',
		'ngAnimate':'./lib/angular/angularAnimate',
		'ngIdleService':'./lib/angular/angularIdle',
		'uiRouter':'./lib/angular/ui-router',
		'angularSlider':'./lib/angular/Slider/angular-slider',
		'angularModalService':'./lib/angular/modal_service/angular-modal-service',
		'angularColorPicker':'./lib/angular/colorPicker/bootstrap-color-picker',
		'angularTreeView':'./lib/angular/angular.treeview/angular.treeview',
		'jquery':'./lib/jquery/jquery',
		'bootstrapJS':'./lib/Bootstrap/js/bootstrap'
    },

    // angular does not support AMD out of the box, put it in a shim
    shim: {
        'angular': {
            exports: 'angular', deps: ['jquery']
        },
		'ngAnimate':{
            deps: ['angular']
        },
		'ngIdleService':{
            deps: ['angular']
        },
		'uiRouter':{
            deps: ['angular']
        },
		'angularSlider':{
            deps: ['angular']
        },
		'angularModalService':{
            deps: ['angular','bootstrapJS']
        },
		'angularColorPicker':{
            deps: ['angular']
        },
		'angularTreeView':{
            deps: ['angular']
        },
		'jquery':{
            exports: '$'
        },		
		'bootstrapJS':{
            deps: ['jquery']
        }
    },

    // kick start application
    deps: ['./bootstrap']
});