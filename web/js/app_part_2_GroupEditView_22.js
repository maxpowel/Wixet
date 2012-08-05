var GroupEditView = Backbone.View.extend({
	subSectionId: "edit-sub",
	buttonClass: "primary",
	events: {
		"click #removeSelected-btn": "removeUsers"
	},
	
    initialize: function() {
    	this.memberList = new UserList();
    	this.memberList.bind("add", this.addToList, this);
    },
    
    addToList: function(user){
    	if(user.get("save") == true){
    		var self = this;
    		$.getJSON("/permission/addGroup/"+user.get('id')+"/"+this.model.get('id'),function(data){
    			if(data.error){
    				item.destroy();
    				alert("Error while saving group")
    			}
    		});
    	}
    	this.memberListContainer.append("<option value='"+ user.get('id') +"'>"+ user.get('name') +"</option>");

    },
    removeUsers: function(){
    	var self = this;
    	$.each(this.$el.find("#memberList option:selected"),function(i,element){
    		$.getJSON("/permission/removeGroup/"+$(element).val()+"/"+self.model.get("id"), function(data){
    			if(data.error)
    				alert("Error while removing user")
    			else
    				$(element).remove();
    		});
    	});
    },
    
    render: function() {
    	/*this.model.set({name:"jajajajaja"})
    	$(this.el).html(this.model.get("name"));
    	this.model.save();*/
    	var self = this;
    	$(this.el).html(template.preferencesView.editGroup({name: this.model.get("name")}));
    	this.memberListContainer = $(this.el).find("#memberList");
    	
    	this.memberListContainer.bind('change', function(){
    		if(self.memberListContainer.find("option:selected").length > 0)
    			self.$el.find("#removeSelected-btn").removeClass("disabled");
    		else
    			self.$el.find("#removeSelected-btn").addClass("disabled");
		})
		
    	this.model.getMemberList(function(list){
    		list.each(function(user){
    			self.memberList.add(user)
    		});
    		
    	});
    	
    	this.$el.find("#personName-txt").typeahead({
			source: "/autocomplete/contacts",
			onSelect: function(item){
				self.memberList.add(new User({id: item.id, name: item.value, save: true}))
				
			}

    	});
    	

      return this;
    }
});