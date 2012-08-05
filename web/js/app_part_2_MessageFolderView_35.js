var MessageFolderView = Backbone.View.extend({
    
	tagName: "li",
	
	events: {
		//"click #destroy":  "destroyFolder",
		"click .load": "loadFolder"
	},
	
    initialize: function() {
    	//this.render();
    	this.messageContainer = this.options.messageContainer;
    	this.optionsButtonContainer = this.options.optionsButtonContainer;
    	this.model.bind('change', this.modelChanged, this);
    	this.model.bind('destroy', this.removeFolder, this);
    },
    
    modelChanged: function(){
    	$(this.el).find("a").text(this.model.get('name'));
    	this.messageContainer.find("#folderName").text(this.model.get('name'));
    },
    render: function() {
    	$(this.el).html(template.messagesView.messageFolder( this.model.toJSON()) );

      return this;
    },
    
    removeFolder: function(){


    	$(this.el).unbind().remove();
    },
    loadFolder: function(){
    	
    	var messageOptions = new MessageFolderOptionsButtonView({folder: this.model});
    	var messageList = new MessageListView({folder:this.model, messageOptionsBut: messageOptions});
    	
    	var menu = new MultimenuView({original:messageList, subsections:[this.options.newMessageButton,messageOptions,this.options.newFolderButton], el: this.messageContainer});
    	menu.render();
    	//Modifi this.optionsButtonContainer.html(messageOptions.render().el);
    	/*if(this.options.context.messageListView != null){
    		this.options.context.messageListView.trigger("reset","an event");
    	}*/
    	//this.options.context.messageListView.trigger("reset","an event");
    	//this.options.context.messageListView.remove();
    	/*if(this.options.context.messageListView != null)
    		this.options.context.messageListView.unbind();
    	this.options.context.messageListView = new MessageListView({folder:this.model, context: this.options.context});
    	console.log("load "+this.model.get("name"))*/
    	//this.options.context.messageListView.trigger("reset",this.model);
    }
});