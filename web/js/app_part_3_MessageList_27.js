var MessageList = PaginatedCollection.extend({
  model: Message,
  baseUrl:"/privateMessage/message"
});