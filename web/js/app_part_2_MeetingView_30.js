var MeetingView = Backbone.View.extend({
    
    initialize: function() {
    	this.render();
    },
    
      
    render: function() {
    	
    	$(this.el).html(template.meetingView.meeting( this.model.toJSON()));
    	


      return this;
    }
});