var ConversationEntryView = Backbone.View.extend({
    
	tagName: "tr",
      
	render: function(){
		$(this.el).html(template.messagesView.conversationEntry( this.model.toJSON() ));

		return this;
	}
});
