window.viewer = null;

window.getViewer = function() {
	return core._viewer;
}

core = {}
core._groupCollection = new GroupList();
core.getGroups = function(callback){
	if (core._groupCollection.length == 0){
		core._groupCollection.fetch({success: function(){
			callback(core._groupCollection.toArray())
		}})
	}else{
		callback(core._groupCollection.toArray())
	} 
	
}

function startUp(){
	var app = new AppView();
	$("#app").html(app.el);
	var loadTimeout = null;//Used to avoid disturb when fast loadings 
	$("#loading").hide().ajaxStart(function(){
		var e = $(this);
		loadTimeout = setTimeout(function(){
			e.show();
		},1200);
		   
	}).ajaxStop(function(){
		clearTimeout(loadTimeout);
		$(this).hide();
	});
} 

$(document).ready(function(){
	//Starts the magic	
	//window.viewer = new User({id:57, thumbnail:"http://placehold.it/90x90"});
	core._viewer = new User();
	core._viewer.fetch({success:function(){
		startUp();
	}});
	
	//window.viewer.fetch({url:"/whoAmI"});
	
});
