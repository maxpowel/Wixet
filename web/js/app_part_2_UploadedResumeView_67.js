var UploadedResumeView = Backbone.View.extend({
    
	items: new Array(),
    className: "span2 popover fade bottom in",
    content: null,
    events: {
    	"click #resume-but":  "uploadStats",
    	"click .close":  "close"
    },
    
    
    initialize: function() {
    	

    },
	
    
    close: function(){
    	this.unbind();
    	this.remove();
    },
    
    addItem: function(itemId){
    	this.items.push(itemId);
    },
    uploadStats: function(){
    	if(this.content.is(":visible")){
    		this.content.hide();
    	}else{
    		this.content.show();
    	}
    	
    },
    
    render: function(){
    	
    	$(this.el).html(template.appView.uploadResume( ));
    	$(this.el).css({display: "block"})
    	this.content = $(this.el).find(".popover-content");
    	var list = this.content.find("ul");
    	while((item = this.items.shift())){
    		var view = new PhotoUploadResumeEntryView({itemId: item});
    		list.append(view.render().el);
    	}
    	
    	var button = this.options.element;
    	var pos = button.offset();
		var pop = $(this.el);
		$("#navbar").append(pop)
		var height = button.height();
		var width = button.width();
		
		var actualWidth =  pop.width();
        var actualHeight =  pop.height();
        
	    var offset = 25
	    
	    var tp = {top: pos.top + height +offset, left: pos.left + width / 2 - actualWidth / 2}
	    
	    pop.css(tp);
	    $(pop).find("#resume-but").button('toggle');
	    
    	
    }
});
