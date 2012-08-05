
var MultimenuView = Backbone.View.extend({
    
    lastView: null,
    initialize: function() {
    	
  
      for(i=0; i < this.options.subsections.length; i++){
    	  this.options.subsections[i].changeTo = this.changeTo;
    	  this.options.subsections[i].backToMain = this.backToMain;
      }
      this.options.original.changeTo = this.changeTo;
	  this.options.original.backToMain = this.backToMain;
    },
	
    render: function(){
    	this.options.original.render();
    	$(this.el).html(template.appView.multimenu( {subsections:this.options.subsections} ));
    	$(this.el).find("#original").html(this.options.original.el);
    	return this;
    },
    
    backToMain: function(){
    	$(".submenu:visible").fadeOut();
		$("#original").slideDown();
		if(this.lastView != null){
    		this.lastView.unbind();
			this.lastView.remove();
    	}
    },
    changeTo: function( subsectionId, view ){
    	var subsection = $("#" + subsectionId);
    	
    	var isVisible =  subsection.is(":visible");
    	//Hide the visible subsection
    	$(".submenu:visible").hide();

    	if( isVisible ){
    		//Show because it was hidden before
    		subsection.show();
    		
    	}else{
    		//New load of this section
    		subsection.find(".subSection-content").html(view.render().el);
    		subsection.fadeIn(function(){
    			if(this.lastView != null){
    				this.lastView.unbind();
    				this.lastView.remove();
    			}
    			this.lastView = view;
    		});
    		
    		$("#" + subsectionId + " .back-but").click(function(){
        		subsection.fadeOut();
        		$("#original").slideDown();
        	});
    		
    	}
    	
    		
    	
    	$("#original:visible").slideUp();
    	
    }
});
