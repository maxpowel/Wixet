var AboutMe = Backbone.Model.extend({
	url: function(){
		  if(this.get("id") != null)
			  return '/profile/extension?id='+this.get("id");
		  else
			  return '/profile/extension';
	  }
});