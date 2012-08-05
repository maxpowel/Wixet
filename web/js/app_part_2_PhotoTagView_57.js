var PhotoTagView = Backbone.View.extend({
    
	tagName: "li",
    events: {
    	"click .removeTag": "removeTag",
    },
    
    removeTag: function(){
    	this.model.destroy();
    	this.remove();
    	this.options.box.hide();
    },
    
    initialize: function(options) {
    	
    	var box = options.box;
    	var self = this;
    	var photo = options.photo;
    	
    	$(this.el).hover(function(){
    			//box.css({top: self.model.get("top") - (box.width()/2) + offset, left:  self.model.get("left") - (box.width()/2), position:"absolute"});
    			if($("#carouselContainer").is(":visible")){
	    			box.show();
	    			box.position({
	      			  my: "center",
	      			  at: "left top",
	      			  of: photo,
	      			  offset: self.model.get("left")+" "+self.model.get("top"),
	      			  collision: "fit"
	      			});
    			}
			},
			function(){
				box.hide();
			}
    	);
		
      
    },
    
    render: function(){
    	$(this.el).html("<a href='javascript:void(0)'>"+this.model.get("value")+" <span href='javascript:void(0)' class='removeTag'>(Remove)</span></a>")
        return this;
    }
    
});
