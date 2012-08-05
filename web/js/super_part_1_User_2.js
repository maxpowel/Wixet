var User = Backbone.Model.extend({
	"url":function(){
		if(this.get("id") == null)
			return "user";
		else
			return "user?id="+this.get("id");
	}

});