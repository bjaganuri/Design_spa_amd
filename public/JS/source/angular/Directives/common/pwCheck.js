define (['../module'] , function(app){
	//Directive to match password and confirm password
	app.directive('pwCheck', [function () {
		return {
			require: 'ngModel',
			link: function (scope, elem, attrs, ctrl) {
				var firstPassword = attrs.pwCheck;
				elem.add(firstPassword).on('keyup', function () {
					scope.$apply(function () {
						ctrl.$setValidity('pwmatch', elem.val() === $('[name='+firstPassword+']').val());
					});
				});
			}
		};
	}]);
});