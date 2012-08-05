var FavouriteList = Backbone.Collection.extend({
  model: Favourite,
  
  url: '/favourite'
});