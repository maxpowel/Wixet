var NewAlbumButtonView = Backbone.View.extend({
    
	subSectionId: "newFolder-sub",
	buttonClass: "info",
    events: {
    	"click button":  "doShowNewFolderForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.multimediaView.newAlbumButton( ));
    	return this;
    },
    
    doShowNewFolderForm: function( event ){
    	this.changeTo(this.subSectionId,new AlbumNewFormView({collection: this.options.collection}));
    }
});