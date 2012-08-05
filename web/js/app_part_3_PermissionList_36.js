var PermissionList = Backbone.Collection.extend({
  model: Permission,
  url: "/permission/",
  parse: function(response) {
	  //TODO hacer que sea homogeneo ya que en los permisos de fotos se envia una cosa y desde security otra
	  if(response.profile == null)
		  return response;
	  
	  var profile = response.profile;
	  for(i = 0; i < profile.length; i++){
		  profile[i]['type'] = "profile";
		  profile[i]['name'] = profile[i]['first_name']+" "+profile[i]['last_name'];
		  
		  var type = profile[i]['object_type'].split("\\");
		  if(type.length > 1)
			  profile[i]['object_type'] = type[type.length-1] 
	  }
	  
	  var group = response.group;
	  for(i = 0; i < group.length; i++){
		  group[i]['type'] = "group";
	  }
	  
	  return profile.concat(group);
  }

});