// includes bindings for fetching/fetched

PaginatedCollection = Backbone.Collection.extend({
  initialize: function(models,options) {
    this.page = 1;
    this.folderId = options.folderId;
  },
  fetch: function(options) {
    options || (options = {});
    //this.trigger("fetching");
    var self = this;
    var success = options.success;
    options.success = function(resp) {
      //self.trigger("fetched");
      if(success) { success(self, resp); }
    };
    try{
    Backbone.Collection.prototype.fetch.call(this, options);
    }catch(e){
    	console.log(e)
    }
  },
  parse: function(resp) {
	this.totalRes = resp.total;
	this.totalPages = Math.ceil(resp.total/resp.psize);

    return resp.models;
  },
  url: function() {
     return this.baseUrl + '?' + $.param({page: this.page}) + '&' + $.param({folder: this.folderId});
  },
  getTotalPages: function() {
    return this.totalPages;
  },
  getPage: function() {
	    return this.page;
  },
  nextPage: function() {
    this.page = this.page + 1;
    this.fetch();
  },
  previousPage: function() {
    this.page = this.page - 1;
    this.fetch();
  },
  reinit: function(){
	this.page = 1;
	this.fetch();  
  }
});