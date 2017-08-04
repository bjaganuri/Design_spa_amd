define(['../module'] , function(app){
	app.service('viewUserLastSearchParams', [function () {
		var lastSearchParams = {
			searchParam:"",
			pageNo:1,
			pageSize:10
		};
		
		var originalCopy = {};
		angular.copy(lastSearchParams,originalCopy);

		this.setLastFilterParam = function(searchData){
			lastSearchParams.searchParam = searchData.searchParam;
			lastSearchParams.pageNo = searchData.pageNo;
			lastSearchParams.pageSize = searchData.pageSize;
		};

		this.getLastSearchParam = function(){
			return lastSearchParams;
		};

		this.resetLastFilterParam = function(){
			angular.copy(originalCopy,lastSearchParams);
		};
	}]);
});