var CommentView = Backbone.View.extend({
	tagName:"li",
	events:{
		"click .close": "destroyModel"
	},
	
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    },
    
    remove: function() {
        $(this.el).remove();
     },
     
     destroyModel: function(){
    	 this.model.destroy();
     },
      
    render: function() {
    	//TODO hacer que esto cambie
    	$(this.el).html(template.commentView.comment( {authorName: this.model.get("firstName")+" "+this.model.get("lastName"), date:this.model.get("date"), body:this.model.get("body")} ));
    	
      return this;
    }
      
});