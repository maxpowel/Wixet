var MeetingInvitedPeopleListView = Backbone.View.extend({
    input: null,	
    invitedList: null,
    events: {
    	"click #invite-but":  "invite"
    },
	
	
    initialize: function() {
    	this.invitedPeople = new PeopleList();
    	this.invitedGroups = new GroupList();
    	
        this.invitedPeople.bind('add',   this.addOnePerson, this);
        this.invitedPeople.bind('remove', this.removeOnePerson, this);
        this.invitedGroups.bind('add',   this.addOneGroup, this);
        this.invitedGroups.bind('remove', this.removeOneGroup, this);
        
    },
    
    
    invite: function(){
    	var entryType = this.input.attr("entrytype");
    	if( entryType == "person"){
    		//Do person things
    		var person = new User();
    		person.set({name: $.trim(this.input.val())});
    		this.invitedPeople.add(person);
    	}else if(entryType == "group"){
    		//Do group things
    		var group = new Group();
    		group.set({name: $.trim(this.input.val())});
    		this.invitedGroups.add(group);
    	}else{
    		//External person
    		var person = new User();
    		person.set({type:"external",  name: $.trim(this.input.val())});
    		this.invitedPeople.add(person);
    	}
    	this.input.attr({entrytype: null});
    	this.input.val("");
    },
    
    addOnePerson: function(person) {
      var view = new MeetingInvitedPeopleEntryView({type:"person", model: person });
      this.invitedList.append(view.render().el);
      
    },
    removeOnePerson: function(person) {
        person.destroy();
    },
    
    addOneGroup: function(group) {
    	
        var view = new MeetingInvitedPeopleEntryView({type:"group", model: group });
        this.invitedList.append(view.el);
      },
    removeOneGroup: function(group) {
          group.destroy();
      },
    
    
    render: function() {
    	
    	$(this.el).html(template.meetingView.invitedPeopleList());

    	this.invitedList = $(this.el).find("#invited-people");
    	//


		this.input = $(this.el).find("input");
		
    	this.$el.find("#invitedName-txt").typeahead({
			source: "/autocomplete/contactsGroups",
			onSelect: function(item){
				//self.permissions.add(new Permission({object_id: item.id, name: item.value, read_granted: 1, read_denied: 0}))
				console.log(item)
			}

    	});

    	
      return this;
    }
});
