var NotificationListView = ListView.extend({
    
    addOne: function(notification){
    	this.list.append(new NotificationView({model:notification}).render().el);
    	
    },
    
    render: function(){
    	$(this.el).html(template.notificationView.list());
    	this.list = $(this.el).find("#notificationList");
    	this.options.collection.fetch();
    	return this;
    }
});
