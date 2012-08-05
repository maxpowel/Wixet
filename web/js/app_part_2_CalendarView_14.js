var CalendarView = Backbone.View.extend({
    
    el: '#calendar',
    
    /*events: {
    	"keypress #new-share":  "createOnEnter",
    	"click #more-newness":  "loadMoreNewness"
    },*/
    
    
    initialize: function() {
    	
   // 	$(this.el).fullCalendar();
    	$('#calendar').fullCalendar({
    	    
    	});
      /*this.page = 1;
      this.input    = this.$("#new-share");
      this.moreButton = this.$("#more-newness");
      
      this.options.collection.bind('add',   this.addOne, this);
      this.options.collection.bind('reset', this.addAll, this);
      //this.options.collection.bind('all',   this.render, this);

      this.options.collection.fetch({data:{page:1}});*/
    }
});
