var NewnessView = Backbone.View.extend({
	events:{
		"keypress #comment": "commentOnEnter",
		"click #doComment": "showCommentForm",
		"click #like": "doLike",
		"click #dlike": "doDlike",
		"click #cancelLike" : "cancelLike",
		"click #cancelDlike" : "cancelDlike",
		"click #updateOptions": "toogleOptions",
		"click #updateRemove": "updateRemove",
	},
    initialize: function() {
    	//this.model.bind('destroy', this.remove, this);
    	this.commentList = new NewnessCommentList();
    	
    	this.commentList.bind('add',   this.addOne, this);
        this.commentList.bind('reset', this.addAll, this);
    },
    
    
    addAll: function() {
        var cont = this.commentListContainer;
        this.commentList.each(function(comment){
      	  var view = new NewnessCommentView({model: comment});
            cont.prepend(view.render().el);
        });
      },
      
      addOne: function(comment) {
        var view = new NewnessCommentView({model: comment});
        this.commentListContainer.prepend(view.render().el);
      },
      
      
    updateRemove: function() {
    	var self = this;
    	
        $(this.el).fadeOut(function(){
        	self.$el.find('#updateRemove').tooltip('hide')
        	self.$el.remove()
        });
        this.model.destroy()
     },
     
     toogleOptions: function(){
    	 
     },
      
    render: function() {
    	$(this.el).html(template.newnessView.newness(this.model.toJSON()));
    	this.commentInput = $(this.el).find("#comment");
    	
    	//Like buttons
    	this.likeForm = $(this.el).find("#likeForm");
    	this.likeit = $(this.el).find("#likeit");
    	this.dlikeit = $(this.el).find("#dlikeit");
    	this.totalLikes = $(this.el).find("#totalLikes");
    	this.totalDlikes = $(this.el).find("#totalDlikes");
    	/////////////
    	
    	//this.commentList.fetch({data:{id: this.model.get('id') }});
    	this.commentListContainer = $(this.el).find("#comments");
    	this.commentList.reset( this.model.get("comments") );
    	/*var cont = commentListContainer = $(this.el).find("#comments");
    	this.commentList.each(function(comment){
    		var view = new NewnessCommentView({model: comment});
            cont.append(view.render().el);
    	});*/
    	
    	/***** Hover ******/
    	if(this.model.get('owner')){
	    	var options = this.$el.find("#newnessOptions");
	    	this.$el.hover(function(){
	    		
	    		options.show();
	    	},
	    	function(){
	    		options.hide();
	    	});
	    	//Tooltips
	    	this.$el.find('#updateOptions').tooltip()
	    	this.$el.find('#updateRemove').tooltip()
    	}
    	
    	
    	
      return this;
    },
    
    showCommentForm: function(){
    	if(this.commentInput.is(":visible"))
    		this.commentInput.hide();
    	else
    		this.commentInput.show();
    },
    commentOnEnter: function(e) {
        var text = this.commentInput.val();
        if (!text || e.keyCode != 13) return;

        
        var comment = new NewnessComment({updateId:this.model.get("id"), body: this.commentInput.val(), owner: true});
        var localThis = this;
        comment.save({},
        {success: function(){
        		localThis.addOne(comment);
        	}
        });
        
        this.commentInput.val('');
        this.commentInput.hide();
      },
      
      doLike: function(){
    	  var vote = new Vote();
    	  var self = this;
    	  vote.save({vote:1, objectType:"ProfileUpdate", object_id:this.model.get("id")},{
    		  wait: true,
    		  success: function(){
    			  self.likeForm.hide();
    			  self.likeit.show();
    			  var nLikes = parseInt(self.totalLikes.find("span").text()) + 1;
    			  self.totalLikes.find("span").text(nLikes);
    			  self.totalLikes.show();
    			  
    		  },error: function(){
    			  alert("Error");
    		  }
    		  
    	  });
      },
      
      doDlike: function(){
    	  var vote = new Vote();
    	  var self = this;
    	  vote.save({vote:0, objectType:"ProfileUpdate", object_id:this.model.get("id")},{
    		  wait: true,
    		  success: function(){
    			  self.likeForm.hide();
    			  self.dlikeit.show();
    			  var nDlikes = parseInt(self.totalDlikes.find("span").text()) + 1;
    			  self.totalDlikes.find("span").text(nDlikes);
    			  self.totalDlikes.show();
    		  },error: function(){
    			  alert("Error");
    		  }
    		  
    	  });
      },
      
      cancelLike: function(){
    	  var vote = new Vote({id: 1, vote:1, objectType:"ProfileUpdate", object_id:this.model.get("id")});
    	  var self = this;
    	  //Assign and id to make delete request
    	  vote.destroy({
    		  wait: true,
    		  success: function(){
    			  self.likeForm.show();
    			  self.likeit.hide();
    			  var nLikes = parseInt(self.totalLikes.find("span").text()) - 1;
    			  self.totalLikes.find("span").text(nLikes);
    			  if(nLikes == 0)
    				  self.totalLikes.hide();
    		  },error: function(){
    			  alert("Error");
    		  }
    		  
    	  });
      },
      
      cancelDlike: function(){
    	  var vote = new Vote({id: 0, vote:0, objectType:"ProfileUpdate", object_id:this.model.get("id")});
    	  var self = this;
    	  //Assign and id to make delete request
    	  vote.destroy({
    		  wait: true,
    		  success: function(){
    			  self.likeForm.show();
    			  self.dlikeit.hide();
    			  var nDlikes = parseInt(self.totalDlikes.find("span").text()) - 1;
    			  self.totalDlikes.find("span").text(nDlikes);
    			  if(nDlikes == 0)
    				  self.totalDlikes.hide();
    		  },error: function(){
    			  alert("Error");
    		  }
    		  
    	  });
      }
      
});