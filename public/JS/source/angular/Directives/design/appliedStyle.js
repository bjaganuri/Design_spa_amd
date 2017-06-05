define(['../module'] , function(app){
	app.directive("appliedStyle" , function () {
		return{
			restrict:"EA",
			scope: false,
			replace: true,
			template: "<div class='form-group pull-left col-sm-12'>"+
					"<label class='control-label col-sm-5' >{{key}}</label>"+
					"<span class='col-sm-1'>:</span>"+
					"<div class='col-sm-6'><input type='text' class='form-control' value={{value}} ng-model=value ng-change='updateStyle($event)' ng-blur='updateStyle($event)' ng-keyup='updateStyle($event)'></div>"+
					"</div>",
			compile:function (element,attrs) {
				var linkFunction = function (scope,element,attrs) {
				   
				};
				return linkFunction;
			},
			controller:function ($scope,$element,$attrs) {
				$scope.updateStyle = function ($event) {
					if($event != undefined){
						$event = $event || window.event;
						if($event.type == "blur" && ($scope.value == "" || $scope.value == undefined || $scope.value == " ")){
							$scope.curElemAppliedStyles[$scope.key] = $scope.getCurElemComputedStyles()[$scope.key];
							return;
						}
						else if($event.type == "keyup" && ($scope.value == "" || $scope.value == undefined || $scope.value == " ") && $event.keyCode == 13){
							delete $scope.curElemAppliedStyles[$scope.key];
							return;
						}
					}
					$scope.curElemAppliedStyles[$scope.key] = $scope.value;
				};
			}
		};
	});
});