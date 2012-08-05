var NewnessCommentView = Backbone.View.extend({
	tagName:"tr",
	events:{
		"click #commentRemove": "destroyModel"
	},
	
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    },
    
    remove: function() {
     },
     
     destroyModel: function(){
    	 var self = this;
    	 this.model.destroy({
    		 wait: true,
    		 success: function(model, response) {
    			 self.$el.find('#commentRemove').tooltip('hide')
    			 self.$el.remove();
    		 },
    		 error: function(model, response) {
    			  alert("Error while deleting comment")
    		 }
    	 });
    	 
    	 
     },
      
    render: function() {
    	//TODO hacer que esto cambie
    	$(this.el).html(template.newnessView.newnessComment( this.model.toJSON() ));
    	if(this.model.get("owner")){
    		/***** Hover ******/
        	if(this.model.get('owner')){
        		this.$el.unbind('hover');
    	    	var options = this.$el.find("#newnessCommentOptions");
    	    	this.$el.hover(function(){
    	    		
    	    		options.show();
    	    	},
    	    	function(){
    	    		options.hide();
    	    	});
    	    	//Tooltip
    	    	this.$el.find('#commentRemove').tooltip()
        	}
        	
    		
    	}
    	
      return this;
    }
      
});