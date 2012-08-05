var Photo = Backbone.Model.extend({
	url: function(){
		return "/multimedia/photo?id="+this.get('id'); 
	}
});