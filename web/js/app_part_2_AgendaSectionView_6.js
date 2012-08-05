var AgendaSectionView = Backbone.View.extend({
    
    el: '#content',
    
    initialize: function() {
    	
      this.render();
    },
    
    render: function(){
    	$(this.el).html(template.section.agenda( this.options));
		
    	var calendarView = new CalendarView({ collection: new CalendarEventList()});

    	}
});
