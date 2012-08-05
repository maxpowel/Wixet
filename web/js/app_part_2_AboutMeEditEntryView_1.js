var AboutMeEditEntryView = Backbone.View.extend({
    
    events: {
    	"click #save": "saveEntry",
    	"click #delete": "deleteEntry",
    	"click #close-success": "closeSuccess"
    },
	
      
    render: function() {
    			
    	$(this.el).html(template.preferencesView.aboutMeEditEntry({title: this.model.get("title"), body:this.model.get("body")}));
    	this.notificationSuccess = $(this.el).find("#notif-success");
    
      return this;
    },
    
    deleteEntry: function(){
    	this.model.destroy();
    	$(this.el).fadeOut(function(){
    		$(this).remove();
    	});
    	
    },
    
    saveEntry: function(){
    	var html = $(this.el);
    	var notif = this.notificationSuccess;
    	this.model.save({title: html.find("#title").val(), body: html.find("#body").val()},{
    		success:function(){
    			notif.show();
    		}
    	});
    },
    
    closeSuccess: function(){
    	this.notificationSuccess.hide();
    }
});