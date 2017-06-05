var app = angular.module("myApp" , ["ui.router","ngIdle","ngAnimate","colorpicker.module","rzModule","angularTreeview","angularModalService"]);
app.constant("MIN" , 15);	//Min is specified in seconds
app.constant("T" , 60);		//T specified in minutes

app.run(['$rootScope','idleObserverService' , 'Idle','$templateCache','ModalService', function($rootScope,idleObserverService,Idle,$templateCache,ModalService) {
	$rootScope.$on('IdleStart', function() {
        idleObserverService.checkUserLoggedStatus();
    });

    $rootScope.$on('IdleEnd', function() {
	    idleObserverService.stop();
	});

	$rootScope.$on('IdleTimeout', function() {
		idleObserverService.stop();
        idleObserverService.idleTimeout();
    });

	$rootScope.$on("$stateChangeStart" , function (event, toState, toParams, fromState, fromParams) {
    	$templateCache.remove(fromState.templateUrl);
    });

	$rootScope.$on("$stateChangeSuccess" , function (event, toState, toParams, fromState, fromParams) {
    	idleObserverService.start();
    });

	$rootScope.$on("loggedOut" , function(event,args){
		var modalInstance = ModalService.showModal({
			templateUrl: 'reLoginModal.html',
			controller:function($scope, $element){
				$rootScope.reLoginTriggered = true;			
			},
			preClose: (modal) => { modal.element.modal('hide'); }
		}).then(function(modal) {
            modal.element.modal();
        });
	});

  	Idle.watch();
}]);

app.config(['idleObserverServiceProvider','T','MIN','IdleProvider','KeepaliveProvider' , function (idleObserverServiceProvider,T,MIN,IdleProvider,KeepaliveProvider) {
	idleObserverServiceProvider.setTimeout(T);
	IdleProvider.idle(T*MIN);
	IdleProvider.timeout(T*MIN);
	KeepaliveProvider.interval(2*T*MIN);
}]);

app.config(['$stateProvider', '$urlRouterProvider','$locationProvider','$urlMatcherFactoryProvider','$httpProvider' , function($stateProvider, $urlRouterProvider,$locationProvider,$urlMatcherFactoryProvider,$httpProvider){
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

app.controller("mainController" , ['$scope','idleObserverService', function($scope,idleObserverService){    
    $scope.logout = function () {
    	idleObserverService.logout();
    };
}]);

app.controller("loginController" , ['$scope','$location','$window','$state','restDataService' ,function($scope,$location,$window,$state,restDataService){
	$scope.user = {};
	$scope.validUser = true;
	$scope.loginError = "Invalid Username/Password";

	$scope.login = function($event){
		$event.preventDefault();
		if($scope.loginForm.$valid){
			restDataService.postData("users/login",$scope.user,function (response) {
				if(response.data.status == "Success"){
					$scope.validUser = true;
					if(!$state.includes("authenticateUser") && !$state.includes("otherwise")){
						$window.location.reload();
					}
					else{
						$state.transitionTo("common.home");
					}
					//$window.sessionStorage.setItem("loggedInUser" , JSON.stringify($scope.user));
				}
				else if(response.data.status == "Failed"){
					$scope.validUser = false;
					if(response.data.info.lockUntil){
						$scope.loginError = response.data.info.message+ " "+ (new Date(response.data.info.lockUntil)).toLocaleString();	
					}
					else{
						$scope.loginError = response.data.info.message;
					}
				}
				$event.target.reset();
				$scope.user = {};
				$scope.loginForm.$setPristine();
				$scope.loginForm.$setUntouched();
			});
		}
	};
}]);

app.controller("signupController" , ['$scope','restDataService',function($scope,restDataService){
	$scope.newUser = {};
	$scope.submitted = false;
	$scope.phoneRegEx="/^[0-9]{10,10}$/;";
	$scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
	$scope.signUpSuccess = false;
	$scope.showSignUpError = false;
	$scope.signUpError = "Unknown Error";

	$scope.signUp = function($event){
		$event.preventDefault();
		$scope.submitted = true;
		var signUpData = angular.copy($scope.newUser);
		signUpData.dob =  (new Date($scope.newUser.dob)).toDateString();
		if($scope.signUpForm.$valid){
			restDataService.postData("users/signUp",signUpData,function(response){
				if(response.data.status == "Error"){
					$scope.showSignUpError = true;
					$scope.signUpSuccess = false;
					$scope.signUpError = response.data.error;
				}
				else if(response.data.status == "Success"){
					$scope.showSignUpError = false;
					$scope.signUpSuccess = true;
				}
				$event.target.reset();
				$scope.newUser = {};
				$scope.signUpForm.$setPristine();
				$scope.signUpForm.$setUntouched();
				$scope.submitted = false;
			});
		}
	};
}]);


app.controller("recoverUserController" ,['$scope','restDataService', function($scope,restDataService){
	$scope.checkUser = {};
	$scope.newPasswd = {};
	$scope.submitted = false;
	$scope.hidePasswdResetForm = true;
	$scope.validUserData = true;
	$scope.passwdResetSuccess = false;
	$scope.passwdResetFailed = false;
	$scope.getCredentials = function($event){
		$event.preventDefault();
		$scope.submitted = true;
		var recoverUserData = angular.copy($scope.checkUser);
		recoverUserData.dob = (new Date($scope.checkUser.dob)).toDateString();
		if($scope.recoverUserForm.$valid){
			restDataService.getData("users/recoverUser",recoverUserData,function(response){
				if(response.data){
					$scope.user = response.data;
					$scope.validUserData = true;
					$scope.hidePasswdResetForm = false;
				}
				else{
					$scope.validUserData = false;
					$scope.hidePasswdResetForm = true;
				}
				$event.target.reset();
				$scope.checkUser = {};
				$scope.recoverUserForm.$setPristine();
				$scope.recoverUserForm.$setUntouched();
				$scope.submitted = false;
			});
		}
	};

	$scope.setNewPassword = function($event){
		$event.preventDefault();
		if($scope.setNewPasswdForm.$valid){
			$scope.user.password = $scope.newPasswd.password;
			restDataService.postData("users/setNewPassword",$scope.user,function(response){
				if(response.data.status == "Success"){
					$scope.passwdResetSuccess = true;
				}
				else if(response.data.status == "Failed"){
					$scope.passwdResetFailed = true;
				}
				$event.target.reset();
				$scope.newPasswd = {};
				$scope.setNewPasswdForm.$setPristine();
				$scope.setNewPasswdForm.$setUntouched();
			});
		}
	};
}]);

app.controller("userProfileController" , ['$scope','restDataService',function($scope,restDataService) {
	$scope.updateUser = {};
	$scope.submitted = false;
	$scope.updateSuccess = false;
	$scope.updateError = "Unknown Error Please try again";
	$scope.showUpdateError = false;
    
    $scope.$on('$stateChangeSuccess', function() {
       	$scope.getProfileData();
    });
    
	$scope.getProfileData = function () {
		restDataService.getData("users/getUserProfile",'',function (response) {
	    	response.data.hasOwnProperty("__v") ? delete response.data['__v'] : null;
	    	response.data.altMobile = parseInt(response.data.altMobile,10);
	    	response.data.mobile = parseInt(response.data.mobile,10);
	    	response.data.dob = (new Date(response.data.dob)).toLocaleDateString();
	    	$scope.updateUser = response.data;
	    });
	};
    
    $scope.updateProfile = function ($event) {
   		$scope.submitted = true;
   		if($scope.updateProfileForm.$valid){
   			restDataService.postData("users/updateUserProfile",$scope.updateUser,function(response){
				if(response.data.status == "Success"){
					$event.target.reset();
					$scope.updateUser = {};
					$scope.updateProfileForm.$setPristine();
					$scope.updateProfileForm.$setUntouched();
					$scope.submitted = false;
					$scope.updateSuccess = true;
					$scope.showUpdateError = false;
				}
				else{
					$scope.updateError = response.data ? response.data : $scope.updateError;
					$scope.showUpdateError = true;
				}
			});
   		}
   	};
   	
   	$scope.updateProfileAgain = function () {
   		$scope.updateSuccess = false;
   		$scope.getProfileData();
   	};
}]);

app.controller("learnController" , ['$scope','getIndexData','$anchorScroll','$location','$state' , function ($scope,getIndexData,$anchorScroll,$location,$state) {
	$scope.indexTreeViewObject = getIndexData.data;	
	$scope.$watch( 'indexTree.currentNode', function( newObj, oldObj ) {
	    if( $scope.indexTree && angular.isObject($scope.indexTree.currentNode) ) {
	    	var newHash = $scope.indexTree.currentNode.id;
	    	if ($location.hash() !== newHash) {
	    		$location.hash($scope.indexTree.currentNode.id);
	    	}
	    	else{
	    		$anchorScroll($scope.indexTree.currentNode.id);
	    	}
	    }
	}, true);
}]);

app.controller("manageUserAccounts" , ['$scope','restDataService','$state','userToView' , function($scope,restDataService,$state,userToView){
	$scope.manageAccountList = {};
	$scope.submitted = false;
	$scope.accountsList = [];
	$scope.dataReadSuccess = false;
	$scope.accountsListHeaders = ['Sl.No' , 'Name' , 'Email' , 'Username' , 'Operational State' , 'Lock/Unlock'];
	$scope.userDataToview = userToView.data;
	console.log($scope.userDataToview)

	$scope.getAccountsList = function($event){
		$event.preventDefault();
		$scope.submitted = true;
		if($scope.searchAccountsForm.$valid){
			$scope.updateTableData($scope.manageAccountList);
		}
	};

	$scope.lockUnlockAccount = function(user){
		restDataService.postData("users/manageAccountLock",user,function(response){
			if(response.data.status == "Success"){
				if($state.is("adminOPs.manageUserAccounts")){
					$scope.updateTableData($scope.manageAccountList);
				}
				else if($state.is("adminOPs.userDetail")){
					$state.reload($state.current.name);
				}
			}
			else{
				alert("Something went wrong pls try again");
			}
		});		
	};

	$scope.updateUserProfile = function(user){
		console.log(user);
	};
	
	$scope.updateTableData = function(filterVal){
		restDataService.getData("users/getUserAccountsList" , filterVal , function(response){
			$scope.accountsList  = [];
			angular.forEach(response.data , function(item,index){
				if(item.opState == "ACTIVE" || item.opState == "INACTIVE")
					response.data[index].action = "Lock";
				else if(item.opState == "LOCKED")
					response.data[index].action = "Unlock";
				else
					response.data[index].action = "Lock";
			});
			[].push.apply($scope.accountsList , response.data);
			$scope.dataReadSuccess = true;
		});	
	};
}]);