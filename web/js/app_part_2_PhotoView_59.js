var PhotoView = Backbone.View.extend({
    
	tagName: "li",
	
	events: {
		"click #message":  "showConversation",
		"change input": "checkState",
		"removeIfChecked .ckbox": "removeIfChecked"
	},
	
    initialize: function() {
    	//this.render();
    	this.isOwner = this.options.isOwner;
    	
    },
    
      
    render: function() {
    	$(this.el).html(template.multimediaView.photo( {id: this.model.get("id"), isOwner: this.isOwner}) );
    	//$(this.el).css("padding-top","65px");
      return this;
    },
    
    checkState: function(){
    	if($(".ckbox:checked").length > 0){
	    	$.each(this.options.actionButtons, function(i,button){
	    		$(button).removeClass("disabled");
	    		
	    	});
    	}else{
    		$.each(this.options.actionButtons, function(i,button){
    			$(button).addClass("disabled");
	    	});
    	}
    	
    },
    showConversation: function(event){
    	if(!$(event.target).hasClass("ckbox"))
    		console.log(event.target);
    },
    
    removeIfChecked: function(){
    	if(this.$(".ckbox:checked").length > 0){
    		//Not necessary because list is reloaded
    		//this.remove();
    		
    		this.model.destroy();
    	}
    }
});