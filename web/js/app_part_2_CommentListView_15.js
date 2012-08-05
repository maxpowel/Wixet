var CommentListView = Backbone.View.extend({
    
    events: {
        "click #nextPage-btn": "nextPage",
        "click #previousPage-btn": "previousPage",
        "click #comment-send": "sendComment",
        
    },
    
    initialize: function() {

      this.collection = new CommentList(null,{photoId:this.options.photoId});
      this.collection.bind('reset', this.addAll, this);
      
    },
    
    render: function(){
    	$(this.el).html(template.commentView.commentList());

        this.pageContainer = $(this.el).find("#page-number");
        
        this.nextButton = $(this.el).find("#nextPage-btn").parent();
        this.previousButton = $(this.el).find("#previousPage-btn").parent();
        this.commentContainer = $(this.el).find("#comment-list");
        this.commentText = $(this.el).find("#comment-text");
        
        this.collection.fetch();
        return this;
    },
    
    sendComment: function(){
    	
    	var text = $.trim(this.commentText.val());
    	var self = this;
    	if(text.length > 0){
    		var comment = new Comment();
    		comment.save({photoId: this.options.photoId, body: text},
    				{
    					success: function(){
    						self.collection.reinit();
    						self.commentText.val("")
    						
    					}
    				});
    		
    		
    	}
    	
    },
    addAll: function() {
    	this.commentContainer.html("");
        this.totalPages = this.collection.getTotalPages();
        if(this.totalPages > 0 && this.collection.size() == 0){
        	this.previousPage();
        }else{
        	this.pageContainer.text(this.collection.getPage());
        	this.checkNavButtons();
        	this.collection.each(this.addOne);
        }
    },
    
    addOne: function(comment) {
        var view = new CommentView({model: comment });
        this.$("#comment-list").append(view.render().el);
    },
    
    
    checkNavButtons: function(){
    	var page = this.collection.getPage();
    	if(page >= this.totalPages){
    		this.nextButton.addClass("disabled");
    	}else{
    		this.nextButton.removeClass("disabled");
    	}
    	
    	if(page == 1){
    		this.previousButton.addClass("disabled");
    	}else{
    		this.previousButton.removeClass("disabled");
    	}
    	
    },
    nextPage: function(){
    	if(this.collection.getPage() < this.totalPages){
    		this.collection.nextPage();
    		this.pageContainer.text(this.collection.getPage());
    	}
    },
    previousPage: function(){
    	if(this.collection.getPage() > 1){
    		this.collection.previousPage();
    		this.pageContainer.text(this.collection.getPage());
    	}
    }
});
