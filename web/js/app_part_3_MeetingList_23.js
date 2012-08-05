var MeetingList = Backbone.Collection.extend({
  model: Meeting,
  
  url: '/meeting'
});