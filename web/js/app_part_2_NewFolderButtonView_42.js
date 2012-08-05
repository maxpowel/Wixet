var NewFolderButtonView = Backbone.View.extend({
    
	subSectionId: "newFolder-sub",
	buttonClass: "info",
    events: {
    	"click button":  "doShowNewFolderForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.messagesView.newFolderButton( ));
    	return this;
    },
    
    doShowNewFolderForm: function( event ){
    	this.changeTo(this.subSectionId,new MessageFolderNewFormView({collection: this.options.collection}));
    }
});