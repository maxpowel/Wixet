var AgendaNearbyTaskListView = Backbone.View.extend({
    
    el: '#agendaTask-list',
    
    
    initialize: function() {
      
      this.options.collection.bind('reset', this.addAll, this);

      this.options.collection.fetch();
    },
    
    addAll: function() {
      this.options.collection.each(this.addOne);
    },
    
    addOne: function(task) {
      var view = new AgendaNearbyTaskView({model: task });
      this.$("#agendaTask-list").append(view.render().el);
    },
});
