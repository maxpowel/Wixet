var Permission = Backbone.Model.extend({
	url: function(){
		/*if(this.get("id"))
			return "/permission/"+this.get("type")+"/"+this.get("id");
		else
			return "/permission/"+this.get("type");*/
		
		return "/permission/"+this.get("type")+"/"+this.get("entity_id")+"/"+this.get("object_type")+"/"+this.get("object_id");
	}
	
});