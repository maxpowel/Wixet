var Newness = Backbone.Model.extend({
	url: function(){
		if(this.get('id') == null){
			return "/newness"
		}else{
			return "/newness/"+this.get('id')
		}
	}
});