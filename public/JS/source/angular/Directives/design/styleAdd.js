define(['../module'] , function(app){
	app.directive("styleAdd" , function () {
		return{
			restrict:"EA",
			scope: false,
			replace: true,
			templateUrl: "/users/styleAdd",
			compile:function (tElement,tAttrs) {
				var linkFunction = function (scope,iElement,iAttrs) {
					
				};
				return linkFunction;
			},
			controller:function ($scope,$element,$attrs) {
				$scope.updateChangedStyleVal = function (styleVal) {
					if(styleVal == "" || styleVal == undefined || styleVal == " "){
						delete $scope.curElemAppliedStyles[$scope.style.name];
						return;
					}
					$scope.curElemAppliedStyles[$scope.style.name] = styleVal;
				};
				
				$scope.openSelectedStyleHelper = function () {
					if($scope.styleSelected){
						$scope.showHelperPopover($scope.style);
					}
				};
				
				$scope.showSelectedStyleInfo = function ($event) {
					if($event.target.tagName == "SPAN"){
						$($event.target).tooltip({
							selector:$event.target,
							placement:"bottom",
							container: $element,
							title:$scope.style.about
						}).tooltip("show");   
					}
				};
			}
			
		};
	});
});