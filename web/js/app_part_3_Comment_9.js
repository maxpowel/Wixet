var Comment = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != undefined)
			return "/photo/comment?id="+this.get('id');
		else
			return "/photo/comment";
	}
});