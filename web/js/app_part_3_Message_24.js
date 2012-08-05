var Message = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != undefined)
			return "/privateMessage/message?id="+this.get('id');
		else
			return "/privateMessage/message";
	}
});