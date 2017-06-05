define (['../module'] , function(app){
	app.constant("MIN" , 15);	//Min is specified in seconds
	app.constant("T" , 60);		//T specified in minutes

	//Service defined to observe idle state od user
	app.provider("idleObserverService" , function () {
		var timeout = 15;
		var count = 15;
		var warning = false;
		var timedout = false;
		this.setTimeout = function (T) {
			timeout = T;
			count = T;
		};
		
		this.$get = ['Idle','$http','restDataService','$state','$interval' , function (Idle,$http,restDataService,$state,$interval) {
			return{
				checkUserLoggedStatus: function () {
					restDataService.get("/users/sessionData" , '').then(function(response){
						if(response.data.status === "AUTHORIZED" && !$state.includes("authenticateUser") && !$state.includes("otherwise")){
							$("#warningModal").modal("show");
							warning = true;
							this.idletimer = $interval(function(){
								count--;
							} , 1000);
						}
						else{
							Idle.unwatch();
						}
					});
				},
				start:function() {
					this.stop();
					Idle.watch();
				},
				idleTimeout:function () {
					$("#timeOutModal").modal("show");
					timedout = true;	
				},
				stop:function() {
					if (warning) {
						$("#warningModal").modal("hide");
						warning = false;
					}
					if (timedout) {
						$("#timeOutModal").modal("hide");
						timedout = false;
					}
					$interval.cancel(this.idletimer);
					count = timeout;
				},
				logout:function($event){
					this.stop();
					$http.get("/users/logout");
					$state.transitionTo('authenticateUser.login');
				}
			};
		}];
	});
});