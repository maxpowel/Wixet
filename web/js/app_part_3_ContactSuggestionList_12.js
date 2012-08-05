var ContactSuggestionList = Backbone.Collection.extend({
  model: ContactSuggestion,
  
  url: '/contactSuggestion'
});