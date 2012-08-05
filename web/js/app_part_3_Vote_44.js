var Vote = Backbone.Model.extend({

	url: function(){
		return "/vote/"+ this.get("vote") +"/"+ this.get("objectType") + "/" + this.get("object_id");
	}
});