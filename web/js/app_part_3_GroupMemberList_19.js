var GroupMemberList = Backbone.Collection.extend({
  model: User,
  url: "/groupProfiles"
});