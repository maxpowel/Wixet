var MeetingFieldListView = Backbone.View.extend({
    
    el: '#meetingInformation',

    views: [],
    
    initialize: function() {
      this.options.collection.bind('add',   this.addOne, this);
      this.options.collection.bind('reset', this.addAll, this);
      this.options.collection.bind('remove', this.removeOne, this);
      //this.options.collection.bind('all',   this.render, this);
      
      //this.options.collection.fetch();
    },
    
    getFields: function(){
    	var views = this.views;
    	var fields = [];
    	this.options.collection.each(function(element){
    		var view = views[element];
    		if(view != null)
    			fields.push({title: element.get('text'), value: $.trim($(view.el).find("input").val())});
    		
    	});
    	return fields;
    },
    
    addAll: function() {
      this.options.collection.each(this.addOne);
    },
    
    addOne: function(meetingField) {
    	
      var view = new MeetingFieldView({collection: this.options.collection, model: meetingField });
      $("#meetingInformation").append(view.el);
      this.views[meetingField] = view;
    },
    removeOne: function(meetingField) {
        meetingField.destroy();
        this.views[meetingField] = null;
      }
    
});
