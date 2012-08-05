var AgendaNearbyTaskView = Backbone.View.extend({
      
    render: function() {
    	
    	$(this.el).html(template.agendaView.nearbyTask( this.model.toJSON()));

      return this;
    }
});