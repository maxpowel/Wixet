var ConversationEntryList = Backbone.Collection.extend({
  model: ConversationEntry,
  url:"/privateMessage/conversation"
});