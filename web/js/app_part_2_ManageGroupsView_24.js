var ManageGroupsView = Backbone.View.extend({
    
	events:{
		"click #createGroup-btn": "createGroup"
	},
	
	//changeTo and backtoMain provided by MultimenuView
	
    initialize: function() {
    	this.groupCollection = new GroupList();
        this.groupCollection.bind('add',   this.addOne, this);
        this.groupCollection.bind('reset', this.addAll, this);
      },
      
      render: function(){
    	  $(this.el).html(template.preferencesView.manageGroups());
    	  this.groupContainer = $(this.el).find("#groupList");
          this.groupCollection.fetch();
          this.newGroupName = $(this.el).find("#newGroupName");
    	  return this;
      },
      
      addAll: function() {
    	  var cont = this.groupContainer;
    	  var changeTo = this.changeTo;
          this.groupCollection.each(function(group){
        	  var view = new GroupListEntryView({model: group, call: changeTo});
        	  cont.append(view.render().el);
          });    	  
      },
      
      addOne: function(group){
    	  var view = new GroupListEntryView({model: group, call: this.changeTo});
    	  this.groupContainer.append(view.render().el);
    	  //TODO dont know why the "close" content in changed

    	  
    	  
      },
      
      
      createGroup: function(){
    	  var group = new Group();
    	  var groupName = $.trim(this.newGroupName.val());
    	  if(groupName.length > 0){
    		 group.set({name: groupName});
    		 this.groupCollection.add(group);
    		 group.save();
    		 this.newGroupName.val("");
    	  }
    	  
      }
});
