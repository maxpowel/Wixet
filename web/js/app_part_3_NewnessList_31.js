var NewnessList = Backbone.Collection.extend({
  model: Newness,
  
  url: '/newness'
});