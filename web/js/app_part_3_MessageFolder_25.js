var MessageFolder = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != null)
			return "/privateMessage/messageFolder?id="+this.get('id');
		else
			return "/privateMessage/messageFolder";
	}
});