var AboutMeList = Backbone.Collection.extend({
  model: AboutMe,
  
  url: function(){
	  if(this.get("profile") != null)
		  return '/profile/extension/profile='+this.get("profile");
	  else
		  return '/profile/extension';
  }
});