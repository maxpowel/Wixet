var MeetingInvitedPeopleEntryView = Backbone.View.extend({
    tagName: "li",
    
    events: {
    	"click .close":  "close",
    },
    
	initialize: function() {
		this.type = this.options.type;
	},
    
    render: function() {
    	
    	if(this.type == "person"){
    		if(this.model.get("type") == "external"){
    			//External person
    			$(this.el).html(template.meetingView.invitedPeopleEntryExternal({name: this.model.get("name")}));
    		}else{
    			$(this.el).html("<li>hola</li>");
    		}
    	}else if(this.type == "group"){
    		//Do group things
    	}

   
    	
      return this;
    },
	
	close: function(){
		this.model.destroy();
		this.remove();
	}
});