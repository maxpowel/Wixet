var ConversationView = Backbone.View.extend({
    
    
    events: {
    	"click #send-but":  "replyMessage"
    //	"focus #body": "bigTextarea",
    //	"blur #body": "normalTextarea",
    },
    
    
    initialize: function() {
    	this.collection = new ConversationEntryList();
    	this.collection.bind('add',   this.addOne, this);
        this.collection.bind('reset', this.addAll, this);
    },
    
    addAll: function() {
        var cont = this.conversationContainer;
        this.collection.each(function(message){
      	    var view = new ConversationEntryView({model: message});
            cont.append(view.render().el);
        });
     },
      
     addOne: function(message) {
        var view = new ConversationEntryView({model: message});
        this.conversationContainer.prepend(view.render().el);
     },
      
	render: function(){
		$(this.el).html(template.messagesView.conversation());
		this.conversationContainer = $(this.el).find("#message-list"); 
		this.messageBody = $(this.el).find("#body");
		this.collection.fetch({data:{id:this.model.get("id")}});
		return this;
	},
	
	/*bigTextarea: function(){
		this.messageBody.height("200px");
	},
	
	normalTextarea: function(){
		this.messageBody.height("50px");
	},*/
	
	replyMessage: function(){
		var message = new Message();
		var localThis = this;
		message.save({conversation_id: this.model.get("id"), body: this.messageBody.val()},{success:function(){
			localThis.collection.add(message);
			localThis.messageBody.html("");
		}});
	}
});
