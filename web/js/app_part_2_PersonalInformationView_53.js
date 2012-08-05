var PersonalInformationView = Backbone.View.extend({
    
	events: {
    	"click #save-but": "saveChanges",
    	"click #close-success": "closeSuccess"
    },
	
    initialize: function() {
    	this.user = getViewer();
    },
    
      
    render: function() {
    	var user = this.user;
    	$(this.el).html(template.preferencesView.personalInformation({firstName: user.get("firstName"), lastName:user.get("lastName"), email: user.get("email")} ));
    	this.notificationSuccess = $(this.el).find("#notif-success");

      return this;
    },
    
    saveChanges: function(){
    	var body = $(this.el);
    	var notif = this.notificationSuccess;
    	this.user.save({firstName: body.find("#firstName").val(), lastName: body.find("#lastName").val()},{
    		success:function(){
    			notif.show();
    		}
    	});
    },
    
    closeSuccess: function(){
    	this.notificationSuccess.hide();
    }
});