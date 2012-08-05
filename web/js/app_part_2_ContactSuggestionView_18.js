var ContactSuggestionView = Backbone.View.extend({
    
    template: $('#contactSuggestion-template').html(),
    
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    	
    },
    
    remove: function() {
    	//Do not execute manually, use destroyModel
        $(this.el).remove();
     },
     
      
    render: function() {
    	var model = this.model;
    	$(this.el).html(template.contactSuggestionView.contactSuggestion( this.options));
		$(this.el).find(".add").click(function(){
			model.destroy();
		});
      return this;
    }
});