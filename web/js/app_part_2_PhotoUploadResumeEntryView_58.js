var PhotoUploadResumeEntryView = Backbone.View.extend({
	
	tagName: "li",
    initialize: function() {
    
    },
    
    render: function() {
    	$(this.el).html(template.appView.resumeEntry( {id: this.options.itemId} ));

      return this;
    }
    
});