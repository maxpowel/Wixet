var NewnessCommentList = Backbone.Collection.extend({
  model: NewnessComment,
  url:"/newness/comment"
});