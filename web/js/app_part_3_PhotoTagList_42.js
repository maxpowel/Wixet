var PhotoTagList = Backbone.Collection.extend({
  model: PhotoTag,
  baseUrl:"/photo/tag",
  
  /*url: function() {
	     return this.baseUrl + '?' + $.param({page: this.page}) + '&' + $.param({photo: this.photoId});
  }*/

});