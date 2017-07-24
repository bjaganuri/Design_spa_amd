define(['../module'] , function(app){
	app.service('viewUserLastSearchParams', [function () {
		var lastSearchParams = {
			searchParam:"",
			pageNo:1,
			pageSize:10
		};

		this.setLastFilterParam = function(searchData){
			lastSearchParams.searchParam = searchData.searchParam;
			lastSearchParams.pageNo = searchData.pageNo;
			lastSearchParams.pageSize = searchData.pageSize;
		};

		this.getLastSearchParam = function(){
			return lastSearchParams;
		};
	}]);
});