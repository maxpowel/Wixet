var PhotoSectionView = Backbone.View.extend({
    className: "container-fluid",

    permissionsFetched: false,
    modalWindow: null,
    
    events: {

        "click .right": "nextPhoto",
        "click .left": "prevPhoto",
        "click #setTitle": "setTitle",
        "click #setPhoto": "setPhotoProfile",
        "click #saveModalChanges": "saveModalWindowData",
        "click #managePermission": "managePermission",
        "click #backToPhoto:": "managePermission"
    },
    
    managePermission: function(){
    	
    	if($("#carouselContainer").is(":visible")){
    		$("#carouselContainer").hide();
    		$("#permissionContainer").fadeIn();
    	}else{
    		$("#permissionContainer").hide();
    		$("#carouselContainer").fadeIn();
    		
    	}
    	
    	if(this.permissionsFetched == false){
	    	this.permissions.fetch();
	    	var self = this
	    	this.permissionsFetched = true
	    	this.$el.find("#newPermissionEntity").typeahead({
				source: "/autocomplete/contactsGroups",
				onSelect: function(item){
					self.permissions.add(new Permission({isNew: true, read_granted:1, read_denied:0, write_granted:1, write_denied:0, object_id: self.photoId ,type: item.data, object_type: "MediaItem", entity_id: item.id, name: item.value}));
					
				}

	    	});
    	}
    	
    },
    setPhotoProfile: function(){
    	var self = this
    	viewer = getViewer();
    	viewer.save({mainMediaItem: this.photoId},
    		{
    			success: function(){
    				self.$el.find("#photoSuccess").show();
    			},
    			error: function(){
    				alert("Error");
    			}
    		}
    	);
    },
    nextPhoto: function(){
    	if(this.nextPhoto != null)
    		location.href="#photo/"+this.nextPhoto;
    },
    prevPhoto: function(){
    	if(this.prevPhoto != null)
    		location.href="#photo/"+this.prevPhoto;
    },
    
    addAllPermissions: function(){
    	this.permissionContainer = this.$el.find("#permissionsBody");
    	var self = this;
    	this.permissions.each(function(permission){
      	  self.addOnePermission(permission,self);
        });
    	//console.log(permission.get('id'))
    },
    
    addOnePermission: function(permission){
    	this.permissionContainer.append(new PermissionSimpleEntryView({model: permission}).render().el)
    },
    
    initialize: function() {
    	this.photoId = this.options.photoId;
    	this.permissions = new PermissionList();
    	this.permissions.url = this.permissions.url+"MediaItem/"+this.photoId;
    	//
    	this.permissions.bind('add',   this.addOnePermission, this);
        this.permissions.bind('reset', this.addAllPermissions, this);
    	//
    	
    	
    },
    
    saveModalWindowData: function(){
    	this.photo.set({name: this.$el.find("#newTitle").val(),
    					description: this.$el.find("#newDescription").val()});
    	this.photo.save();
    },
    setTitle: function(){
    	if(this.modalWindow == null){
    		this.modalWindow = this.$el.find("#setTitleModal").modal();
    	}else
    		this.modalWindow.modal('show');
    },
    
    photoChanged: function(photo){
    	if(photo.get('description')!= null && photo.get('description').length > 0){
    		this.$el.find(".carousel-caption").show().find("p").text(photo.get('description'));
    	}else
    		this.$el.find(".carousel-caption").hide();
    	
    	if(photo.get('name')!= null && photo.get('name').length > 0){
    		this.$el.find("#photoTitleTop").text(photo.get('name')).show();
    	}else
    		this.$el.find("#photoTitleTop").hide();
    },
    
    
    render: function(){
    	
    	
    	var self = this;
    	
    	$.getJSON("photo/"+this.options.photoId,function(data){
    				
    		$(self.el).html(template.section.photo( data ));
    		
        	self.photo = new PhotoPreview({id: data.id});
        	self.photo.on('change', self.photoChanged, self)
        	
    		var commentList = new CommentListView({photoId: data.id});

    	
    		self.nextPhoto = data.next;
    		self.prevPhoto = data.prev;
    		$(self.el).find("#commentContainer").append(commentList.render().el);
    		
    		var photo = $(self.el).find("#photoContainer").find("img");
    		var photoTagger = new PhotoTagListView({tags: data.tags,photo: photo, el: $(self.el).find("#tagList")});
    		photoTagger.render();
        	

        	self.$el.find("#tagDesc").tooltip({placement: "bottom"});
        	
        	self.photo.set({description: data.description, name: data.name})
        	
    	});
    	
    	    
		return this;
    }
    

});
