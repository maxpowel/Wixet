var ListView = Backbone.View.extend({
    
    initialize: function() {
        this.options.collection.bind('add',   this.addOne, this);
        this.options.collection.bind('reset', this.addAll, this);
        this.options.collection.bind('remove', this.removeOne, this);
      },
      
      addAll: function() {
    	  var self = this;
    	  this.options.collection.each(function(element,i){
    		  self.addOne(element,self);
          });    	  
      },
      
      addOne: function(element){

      },
      removeOne: function(folder) {
    	  
      }
});
