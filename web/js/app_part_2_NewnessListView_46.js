var NewnessListView = Backbone.View.extend({
    
	newnessContainer: null,
	profileId: null,
	input: null,
	page: 1,
	linkEnabled: false,
    events: {
    //	"keypress #new-share":  "createOnEnter",
    		"focus #fakeContent input": "toogleRealContent",
    		"click .closeAllowed": "removeAllowed",
    		//"click #addLink": "addLink",
    		"click #closeUpdate": "toogleRealContent",
    		"click #shareUpdate": "shareUpdate",
    		"click #more-newness":  "loadMoreNewness"
    },
    
    
    initialize: function() {
      this.collection.bind('add',   this.addOne, this);
      this.collection.bind('reset', this.addAll, this);
      this.profileId = this.options.profileId;
      //this.options.collection.bind('all',   this.render, this);

    },
    
    render: function(){
    	$(this.el).html(template.newnessView.newnessList(this.options));
    	this.newnessContainer = $(this.el).find("#newness-container");
    	
    	this.loadMoreNewness();
    	this.input = $(this.el).find("#new-share");
    	//REMOVE WHEN ADD EVENTS
    	this.$el.find(".updateAction").css({ 'opacity' : 0.25 });

    	
    	return this;
    },
    loadMoreNewness: function(){
    	var self = this;
    	if(!this.$el.find("#more-newness").hasClass("disabled")){
	    	this.collection.fetch({ data:{page: this.page, id: this.profileId}, success: function(){
	    		if(self.collection.size() == 0){
	    			self.$el.find("#more-newness").addClass("disabled");
	    		}
	    	}});
	    	this.page = this.page + 1;
    	}
    },
    shareUpdate: function(e) {
    	var allowedGroups = new Array()
    	
    	var text = $.trim(this.input.val());
    	if(text.length > 0){
    		this.permissions.each(function(permission){
        		allowedGroups.push(permission.get("object_id"));
            });
    		
	      var newness = new Newness();
	      var collection = this.collection;
	      newness.save({body: text, groups: allowedGroups},{success: function(){
	    	  collection.add(newness);
	      }
	      });
	
	      this.input.val('');
	      this.toogleRealContent();
      }
    },
    
    addAll: function() {
      var cont = this.newnessContainer;
      this.collection.each(function(newness){
    	  var view = new NewnessView({model: newness});
          cont.prepend(view.render().el);
      });
    },
    
    addOne: function(newness) {
      var view = new NewnessView({model: newness});
      this.newnessContainer.prepend(view.render().el);
    },
    
    removeAllowed: function(event){
		$(event.target).parent().parent().remove();
		
	},
	
	/* Add default permissions */
    addAllPermissions: function(){
    	this.permissionContainer = this.$el.find("#allowedToUpdates");
    	var self = this;
    	this.permissions.each(function(permission){
		  if(permission.get("type")=="group")
			  self.addOnePermission(permission,self);
        });
    },
    
    addOnePermission: function(permission){
    	if(permission.get("read_granted") == 1 && permission.get("read_denied") == 0)
    		this.permissionContainer.append(new AlertPermissionView({model: permission}).render().el)
    },
    ////////////////////////
    
	toogleRealContent: function(){
		if(this.permissions == null){
	    	this.permissions = new PermissionList();
	    	this.permissions.url = this.permissions.url+"ItemContainer/"+getViewer().get("updatesAlbumId");
	    	//
	    	this.permissions.bind('add',   this.addOnePermission, this);
	        this.permissions.bind('reset', this.addAllPermissions, this);
	        this.permissions.fetch();
	        
	        var self = this;
	        //Autocomplete
	    	this.$el.find("#allowedToInput").typeahead({
				source: "/autocomplete/groups",
				onSelect: function(item){
					self.permissions.add(new Permission({object_id: item.id, name: item.value, read_granted: 1, read_denied: 0}))
					
				}

	    	});
		}
		
		var fakeContent = this.$el.find("#fakeContent");
		
		if(fakeContent.is(":visible")){
					this.$el.find("#fakeContent").hide();
					this.$el.find("#content").show().find("textarea").focus();
		}else{
				this.$el.find("#fakeContent").show();
				this.$el.find("#content").hide();
		}
	},
	
	addLink: function(){
			var form = this.$el.find("#addLinkForm");
			if(form.is(":visible")){
				form.hide()
				this.$el.find(".updateAction").css({ 'opacity' : 1 });
			}else{
				form.show().find("input").focus();
				this.$el.find(".updateAction").css({ 'opacity' : 0.25 });
				this.$el.find("#addLink").css({ 'opacity' : 1 });
			}
	}
});

