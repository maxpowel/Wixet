var MessageView = Backbone.View.extend({
    
	tagName: "tr",
	conversationLoaded: false,
	events: {
		"click #message":  "showConversation",
		"change input": "checkState",
		"removeIfChecked .ckbox": "removeIfChecked"
	},
	
    initialize: function() {
    	this.render();
    },
    
      
    render: function() {
    	$(this.el).html(template.messagesView.message( this.model.toJSON()) );

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
    	var conversation = $(this.el).find("#conversation");
    	if(!$(event.target).hasClass("ckbox")){
    		if(conversation.is(":visible")){
    			conversation.hide();
    		}else{
    			conversation.show();
    			if(!this.conversationLoaded){
    				var conversationView = new ConversationView({model: this.model});
    				conversation.html(conversationView.render().el);
    				this.conversationLoaded = true;
    			}
    				
    			
    		}
    			
    	}
    		
    	
    },
    
    removeIfChecked: function(){
    	if(this.$(".ckbox:checked").length > 0){
    		//Not necessary because list is reloaded
    		//this.remove();
    		
    		this.model.destroy();
    	}
    }
});