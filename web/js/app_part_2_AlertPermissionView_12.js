var AlertPermissionView = Backbone.View.extend({
	
	className: "span4",
	
	events: {
		"click .close": "removePermission"
	},
	
    initialize: function() {
    	//Avoid destroy item in the server
    	this.model.set({id: null})

    },
    
    render: function() {
    	$(this.el).html(template.appView.alert( {text: this.model.get('name')} ) );

      return this;
    },
    
    removePermission: function(){
    	this.model.destroy();
    	$(this.el).unbind().remove();
    }
});