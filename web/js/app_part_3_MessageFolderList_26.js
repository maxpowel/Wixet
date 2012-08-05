var MessageFolderList = Backbone.Collection.extend({
  model: MessageFolder,
  url:"/privateMessage/messageFolder"
});