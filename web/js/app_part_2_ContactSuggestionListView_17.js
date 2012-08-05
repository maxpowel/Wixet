var ContactSuggestionListView = Backbone.View.extend({
    
    el: '#contact-suggestion',
    
    initialize: function() {
      
      this.options.collection.bind('reset', this.addAll, this);

      this.options.collection.fetch();
    },
    
    addAll: function() {
      var container = $(this.el);
      
      this.options.collection.each(function(suggestion){
    	  var view = new ContactSuggestionView({model: suggestion, id: suggestion.id, name: suggestion.get("name") });
          container.append(view.render().el);
    	  
      });
    }
});
