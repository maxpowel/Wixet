var PermissionSimpleEntryView = Backbone.View.extend({
    tagName: "tr",
    events:{
    	"click #remove-btn":"removePermission",
    	"click #save-btn":"savePermission",
    	"change .perm": "updatePermission",
    },
    
    updatePermission: function(event){
    	var target = $(event.target);
    	if(target.hasClass("rg")){
    		this.model.set({read_granted: this.model.get('read_granted')==1?0:1})
    	}else if(target.hasClass("rd")){
    		this.model.set({read_denied: this.model.get('read_denied')==1?0:1})
    	}else if(target.hasClass("wg")){
    		this.model.set({write_granted: this.model.get('write_granted')==1?0:1})
    	}else if(target.hasClass("wd")){
    		this.model.set({write_denied: this.model.get('write_denied')==1?0:1})
    	}
    },
    removePermission: function(){
    	var self = this;
    	
    	this.model.set({read_granted: 0})
		this.model.set({read_denied: 0})
		this.model.set({write_granted: 0})
		this.model.set({write_denied: 0})
		
    	this.model.save(null,{success:function(){
    		self.remove();
    	},error: function(){
    		alert("Error while removing permission")
    	}});
    },

    savePermission: function(){
    	
    	
    	//this.model.set({read_granted:})
    	var btn = this.$el.find("#save-btn");
    	var self = this;
    	this.model.save(null,{success: function(){
    		btn.tooltip('show')
        	setTimeout(function(){btn.tooltip('hide')},2000);
			self.$el.find("#remove-btn").removeClass("disabled");
    	}, error: function(){
    		alert("Error while changing permissions")
    	}});
    },
    
    render: function() {
    	$(this.el).html(template.permission.simpleEntry(this.model.toJSON()));

    	var btn = this.$el.find("#save-btn");
    	btn.tooltip({trigger: "manual"})
    	btn.tooltip('hide')
    	
      return this;
    }
});