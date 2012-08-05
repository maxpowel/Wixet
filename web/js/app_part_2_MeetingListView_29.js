var MeetingListView = Backbone.View.extend({
    
	subSectionId: "meeting-sub",
	buttonClass: "success",
    events: {
    	"click #allMeetings-but":  "showAllMeetings",
    	"click #doMeeting-but":  "doMeeting"
    },
    
    
    initialize: function() {
      this.options.collection.bind('add',   this.addOne, this);
      this.options.collection.bind('reset', this.addAll, this);
      //this.options.collection.bind('all',   this.render, this);
      
      this.options.collection.fetch();
    },
    
    
    addAll: function() {
      this.options.collection.each(this.addOne);
    },
    
    addOne: function(meeting) {
      var view = new MeetingView({model: meeting });
      this.$("#meeting-list").append(view.render().el);
    },
    
    showAllMeetings: function( event ){
    	//this.changeTo(new DoMeetingView({collection: this.options.collection}));
    	//this.changeTo("allMeetings");
    	
    },
    
    doMeeting: function( event ){
    	this.changeTo(this.subSectionId,new DoMeetingView({collection: this.options.collection}));
    }
});
