var PermissionManagerSimpleView = Backbone.View.extend({

	
    initialize: function() {
    	this.permissionList = new PermissionList();
    	this.permissionList.bind('add', this.addPermission, this);
    	//this.render();
    /*	this.photoContainer = this.options.photoContainer;
    	this.model.bind('change', this.modelChanged, this);
    	this.model.bind('destroy', this.removeAlbum, this);*/
    },
    
    addPermission:function(permission){
    	this.$el.find("#permissionList").append(new PermissionSimpleEntryView({model: permission}).render().el);
    },
    
    render: function() {
    	var self = this;
    	//TODO me llego por aquí, estandarizar lo de los permisos
    	$(this.el).html( template.permission.simple() );
    	this.$el.find("#contactSearch").typeahead({
    		source: "/autocomplete/contactsGroups",
    		onSelect: function(item){
    			var permission = new Permission({objectId: self.model.get('id'), objectType:"TIPO", identity_id: item.id, type: item.data, name: item.value})
    			self.permissionList.add(permission)
		
    		}

    	});

      return this;
    }
});