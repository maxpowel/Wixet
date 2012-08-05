var NotificationList = Backbone.Collection.extend({
  model: Notification,
  
  url: '/notification'
});