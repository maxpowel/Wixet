var NotificationView = Backbone.View.extend({
    
	tagName: "li",
    render: function() {
    	
    	$(this.el).html(template.notificationView.notification( this.model.toJSON()));

      return this;
    }
});