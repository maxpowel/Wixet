var Group = Backbone.Model.extend({

	getMemberList: function(callback){
		if(this.memberList == null){
			this.memberList = new GroupMemberList();
			this.memberList.fetch({data:{id: this.get("id")}, success: callback});
		}else callback(this.memberList)
		
	}
});