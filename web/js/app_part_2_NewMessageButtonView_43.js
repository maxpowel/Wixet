var NewMessageButtonView = Backbone.View.extend({
    
	subSectionId: "new-sub",
	buttonClass: "success",
    events: {
    	"click button":  "doShowNewMessageForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.messagesView.newMessageButton( ));
    	return this;
    },
    
    doShowNewMessageForm: function( event ){
    	this.changeTo(this.subSectionId,new NewMessageFormView());
    }
});