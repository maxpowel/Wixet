var AgendaNearbyTaskList = Backbone.Collection.extend({
  model: AgendaNearbyTask,
  
  url: '/agendaNearbyTasks'
});