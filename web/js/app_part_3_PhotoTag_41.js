var PhotoTag = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != null)
			return "/photo/tag/"+this.get('id');
		else
			return "/photo/tag";
	}
});