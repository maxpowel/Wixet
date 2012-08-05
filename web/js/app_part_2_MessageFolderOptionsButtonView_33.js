var MessageFolderOptionsButtonView = Backbone.View.extend({
    tagName: "span",
	subSectionId: "options-sub",
	buttonClass: "primary",
    events: {
    	"click button":  "doOptionsForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.messagesView.folderOptionsButton( ));
    	return this;
    },
    
    doOptionsForm: function( event ){
    	this.changeTo(this.subSectionId,new MessageFolderOptionsFormView({folder: this.options.folder, context: this}));
    }
});
