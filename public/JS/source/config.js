define (['../app'] , function(app){
	return app.config(['$stateProvider', '$urlRouterProvider','$locationProvider','$urlMatcherFactoryProvider','$httpProvider','idleObserverServiceProvider','T','MIN','IdleProvider','KeepaliveProvider' , 
		function($stateProvider, $urlRouterProvider,$locationProvider,$urlMatcherFactoryProvider,$httpProvider,idleObserverServiceProvider,T,MIN,IdleProvider,KeepaliveProvider){
		idleObserverServiceProvider.setTimeout(T);
		IdleProvider.idle(T*MIN);
		IdleProvider.timeout(T*MIN);
		KeepaliveProvider.interval(2*T*MIN);
		
		$urlMatcherFactoryProvider.caseInsensitive(true);
		$urlMatcherFactoryProvider.strictMode(false);
		$httpProvider.interceptors.push('restDataInterceptor');
		$urlRouterProvider.when("/" , '/authenticateUser/login');
		$urlRouterProvider.when("" , '/authenticateUser/login');
		$stateProvider
		.state("authenticateUser",{
			abstract:true,
			url:'/authenticateUser',
			views:{
				"@":{
					template:"<div ui-view></div>"	
				}
			}
		})
		.state('authenticateUser.login',{
			url:'/login',
			templateUrl:"users/login",
			controller:"loginController"
		})
		.state('authenticateUser.signUp',{
			url:"/signUp",
			templateUrl:"users/signUp",
			controller:"signupController"
		})
		.state('authenticateUser.recoverCredentials',{
			url:"/recoverCredentials",
			templateUrl:"users/forgotCredentials",
			controller:"recoverUserController"
		})
		.state('authenticateUser.logout',{
			url:"/logout",
			templateUrl:"users/logout",
			controller:["$scope" , "$window", function($scope,$window){
				//$window.sessionStorage.clear();
			}]
		})
		.state("common",{
			abstract:true,
			url:'/common',
			views:{
				"header":{
					templateUrl:"users/header"
				},
				"hContentPanel":{
					template:"<div ui-view='content'></div>"
				},
				"footer":{
					templateUrl:"users/footer"
				}
			}
		})
		.state("common.home" , {
			url:'/home',
			views:{
				"content@common":{
					templateUrl:"users/home"
				}
			}
		})
		.state("common.about" , {
			url:'/about',
			views:{
				"content@common":{
					templateUrl:"users/about"
				}
			}
		})
		.state("common.query" , {
			url:'/query',
			views:{
				"content@common":{
					templateUrl:"users/query"
				}
			}
		})
		.state("learn" , {
			abstract:true,
			url:'/learn',
			views:{
				"header":{
					templateUrl:"users/header"
				},
				"hContentPanel":{
					template:"<div ui-view='content'></div>"
				},
				"footer":{
					templateUrl:"users/footer"
				}
			}
		})
		.state("learn.html" , {
			url:'/html',
			views:{
				"content@learn":{
					templateUrl:"users/HTML",
					controller:"learnController"
				}
			},
			resolve:{
				getIndexData:function (restDataService) {
					return restDataService.get('users/getIndexJson' , {pageName:'html'});
				}
			}
		})
		.state("learn.css" , {
			url:'/css',
			views:{
				"content@learn":{
					templateUrl:"users/CSS",
					controller:"learnController"
				}
			},
			resolve:{
				getIndexData:function (restDataService) {
					return restDataService.get('users/getIndexJson' , {pageName:'css'});
				}
			}
		})
		.state("learn.js" , {
			url:'/js',
			views:{
				"content@learn":{
					templateUrl:"users/JS",
					controller:"learnController"
				}
			},
			resolve:{
				getIndexData:function (restDataService) {
					return restDataService.get('users/getIndexJson' , {pageName:'js'});
				}
			}
		})
		.state("design" , {
			abstract:true,
			url:'/design',
			views:{
				"header":{
					templateUrl:"users/brand"	
				},
				"verticalMenu":{
					templateUrl:"/users/VerticalMenu"
				},
				"vContentPanel":{
					template:"<div ui-view='content'></div>"
				},
				"footer":{
					templateUrl:"users/footer"
				}
			}
		})
		.state("design.designElement" , {
			url:'/designElement',
			views:{
				"content@design":{
					templateUrl:"users/designElement",
					controller:"designElementController"
				}
			}
		})
		.state("design.designComponent" , {
			url:'/designComponent',
			views:{
				"content@design":{
					templateUrl:"users/designComponent"
				}
			}
		})
		.state("design.designLayout" , {
			url:'/designLayout',
			views:{
				"content@design":{
					templateUrl:"users/designLayout",
					controller:"designLayoutController"
				}
			}
		})
		.state("userProfile",{
			url:"/myProfile",
			views:{
				"header":{
					templateUrl:"users/brand"	
				},
				"verticalMenu":{
					templateUrl:"/users/VerticalMenu"
				},
				"vContentPanel":{
					templateUrl:'/users/userProfile',
					controller:"userProfileController"
				},
				"footer":{
					templateUrl:"users/footer"
				}
			}
		})
		.state("adminOPs",{
			abstract:true,
			url:"/adminOp",
			views:{
				"header":{
					templateUrl:"users/brand"	
				},
				"verticalMenu":{
					templateUrl:"/users/VerticalMenu"
				},
				"vContentPanel":{
					template:"<div ui-view='content'></div>"
				},
				"footer":{
					templateUrl:"users/footer"
				}
			}
		})
		.state("adminOPs.manageUserAccounts" , {
			url:"/manageUserAccounts",
			resolve : {
				userToView:function(restDataService,$stateParams){
					return {};
				}
			},
			views:{
				"content@adminOPs":{
					templateUrl:'/users/manageUserAccounts',
					controller:"manageUserAccounts"
				}
			}
		})
		.state("adminOPs.userDetail" , {
			url:"/viewUser/:userID",
			resolve : {
				userToView:function(restDataService,$stateParams){
					return restDataService.get("users/getUserProfile" , {username:$stateParams.userID});
				}
			},
			views:{
				"content@adminOPs":{
					templateUrl:function($stateParams){
						return '/users/viewUser/'+$stateParams.userID;
					},
					controller:"manageUserAccounts"
				}
			}
		})
		.state('otherwise',{
			url:'*path',
			templateUrl:'users/resourceNotFound'
		});
		
		$locationProvider.html5Mode(true);
	}]);
});