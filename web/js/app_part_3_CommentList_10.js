var CommentList = PaginatedCollection.extend({
  model: Comment,
  baseUrl:"/photo/comment",
  
  initialize: function(models,options) {
	    this.page = 1;
	    this.photoId = options.photoId;
  },
  
  url: function() {
	     return this.baseUrl + '?' + $.param({page: this.page}) + '&' + $.param({photo: this.photoId});
  }

});