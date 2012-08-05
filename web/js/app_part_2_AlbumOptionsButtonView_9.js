var AlbumOptionsButtonView = Backbone.View.extend({
    tagName: "span",
	subSectionId: "options-sub",
	buttonClass: "primary",
    events: {
    	"click button":  "doOptionsForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.multimediaView.albumOptionsButton( ));
    	return this;
    },
    
    doOptionsForm: function( event ){
    	this.changeTo(this.subSectionId,new AlbumOptionsFormView({folder: this.options.album, context: this}));
    }
});
