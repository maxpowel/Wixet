var AlbumOptionsFormView = Backbone.View.extend({
    removeWindow: null,
    events: {
    	"click #save-folder-btn":  "saveAlbum",
    	"click #remove-folder-btn": "removeAlbum",
    },
    initialize: function() {
    	this.folder = this.options.folder;
    	this.permissions = new PermissionList();
    	this.permissions.url = this.permissions.url+"ItemContainer/"+this.folder.get("id");
    	this.permissions.bind('add',   this.addOnePermission, this);
        this.permissions.bind('reset', this.addAllPermissions, this);
    	
    },
    addAllPermissions: function(){
    	this.permissionContainer = this.$el.find("#permissionsBody");
    	var self = this;
    	this.permissions.each(function(permission){
      	  self.addOnePermission(permission,self);
        });
    },
    
    addOnePermission: function(permission){
    	this.permissionContainer.append(new PermissionSimpleEntryView({model: permission}).render().el)
    },
    
    saveAlbum: function(){
    	var name = $.trim($(this.el).find("#folderName-input").val());
    	if(name.length > 0){
    		this.options.folder.set({name:name});
    		this.options.folder.save();
    		this.options.context.backToMain();
    	}
    },
    removeAlbum: function(){
    	
    	if(this.removeWindow == null){
    		var modalTemplate = template.multimediaView.removeAlbumAsk( {folder:this.options.folder.get('name')});
    		var folder = this.options.folder;
	    	this.removeWindow = $(modalTemplate);
	    	var remWin = this.removeWindow;
	    	this.removeWindow.modal({backdrop:true, keyboard: true});
	    	this.removeWindow.find(".remove").click(function(){
	    		folder.destroy({wait: true, error: function(){
	    			alert("Album cannot be removed because is not empty");
	    		}});
	    		remWin.modal('hide');
	    	});
	    	this.removeWindow.find(".cancel").click(function(){
	    		remWin.modal('hide');
	    	});
    	}
	    this.removeWindow.modal('show');

    },
    render: function() {
    	$(this.el).html(template.multimediaView.albumOptions({name:this.options.folder.get('name')}));
    	this.$el.append(new PermissionManagerSimpleView({model: this.options.folder}).render().el)
    	//Permissions
		this.permissions.fetch();
    	var self = this
    	this.$el.find("#newPermissionEntity").typeahead({
			source: "/autocomplete/contactsGroups",
			onSelect: function(item){
				self.permissions.add(new Permission({isNew: true, read_granted:1, read_denied:0, write_granted:1, write_denied:0, object_id: self.folder.get("id") ,type: item.data, object_type: "ItemContainer", entity_id: item.id, name: item.value}));
				
			}

    	});
    	///
    	

      return this;
    }
});