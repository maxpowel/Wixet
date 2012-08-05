var MessageListView = Backbone.View.extend({
    
    events: {
    	"click #check-all": "checkAll",
    	"click #check-none": "checkNone",
    	"click #remove-btn": "removeMessages",
        "click #nextPage-btn": "nextPage",
        "click #previousPage-btn": "previousPage",
    },
    
    /*resetView: function(folder){
    	//this.options.model = folder;
    	console.log("Unbind" +this.options.folder.get('name'));
    	this.unbind("click");
    	//this.collection.unbind('reset');
    	//this.initialize();
    },*/
    initialize: function() {

      this.bind("reset", this.resetView);

      this.collection = new MessageList(null,{folderId:this.options.folder.get('id')});
      this.collection.bind('reset', this.addAll, this);
      this.messageOptionsBut = this.options.messageOptionsBut;
      
    },
    
    render: function(){
    	$(this.el).html(template.messagesView.messageList( {folder: this.options.folder.get('name')}));
    	$(this.el).find("#optButCont").html(this.messageOptionsBut.render().el);

        this.startPageContainer = $(this.el).find("#start-page");
        
        this.nextButton = $(this.el).find("#nextPage-btn").parent();
        this.previousButton = $(this.el).find("#previousPage-btn").parent();
        
        this.collection.fetch();
        return this;
    },
    addAll: function() {
    	this.$("#message-table").html("");
        this.totalPages = this.collection.getTotalPages();
        if(this.totalPages > 0 && this.collection.size() == 0){
        	this.previousPage();
        }else{
        	$(this.el).find("#last-page").text(this.totalPages);
        	this.startPageContainer.text(this.collection.getPage());
        	this.checkNavButtons();
        	this.collection.each(this.addOne);
        }
    },
    
    addOne: function(message) {
      var view = new MessageView({model: message, actionButtons: [$("#move-btn"),$("#remove-btn")] });
      this.$("#message-table").append(view.render().el);
    },
    
    checkAll: function(){
    	$(".ckbox:not(:checked)").click();
    },
    
    checkNone: function(){
    	$(".ckbox:checked").click();
    },
    removeMessages: function(){
    	$(".ckbox").trigger("removeIfChecked", "an event");
    	this.checkNone();
    	//TODO Puede fallar si se tarda mucho en borrar
    	this.collection.fetch();
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
    		this.startPageContainer.text(this.collection.getPage());
    	}
    },
    previousPage: function(){
    	if(this.collection.getPage() > 1){
    		this.collection.previousPage();
    		this.startPageContainer.text(this.collection.getPage());
    	}
    }
});
