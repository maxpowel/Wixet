var Album = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != null)
			return "/multimedia/album?id="+this.get('id');
		else
			return "/multimedia/album";
	}
});