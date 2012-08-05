$(document).ready(function(){

	new LoginApp({el: $("#content")});
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
	
	//Github updates
	//$.getJSON("https://api.github.com/networks/maxpowel/WixetBundle/events", function(data){
	$.getJSON("/changes?type=core", function(data){
		$("#coreDate").text(data[0].created_at);
		$("#coreDesc").text(data[0].payload.commits[0].message);
	});
	
	//$.getJSON("https://api.github.com/networks/maxpowel/UserInterfaceBundle/events", function(data){
	$.getJSON("/changes?type=ui", function(data){
		$("#uiDate").text(data[0].created_at);
		$("#uiDesc").text(data[0].payload.commits[0].message);
	});
	
});
