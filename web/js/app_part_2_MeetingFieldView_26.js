var MeetingFieldView = Backbone.View.extend({
    
    tagName: 'tr',
    
    
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    	this.render();
    	var collection = this.options.collection;
    	var model = this.model;
    	$(this.el).find("a").click(function(){
    		collection.remove(model);
    	});
    },
    
      
    render: function() {
    	
    	$(this.el).html(template.meetingView.doMeetingRow( {text: this.model.get("text")}));

      return this;
    },
    remove: function() {
    	
        $(this.el).remove();
    }
});