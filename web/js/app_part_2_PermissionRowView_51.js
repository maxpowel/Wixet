var PermissionRowView = Backbone.View.extend({
    tagName:"tr",

    
    
    initialize: function() {
    	

    },

    
    render: function(){
    	$(this.el).html(template.preferencesView.permissionRow( {permission: this.model.toJSON()} ));
    	return this;
    }
});
