var PhotoListView = Backbone.View.extend({
    
    events: {
    	"click #check-all": "checkAll",
    	"click #check-none": "checkNone",
    	"click #remove-btn": "removePhotos",
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

      this.collection = new PhotoList(null,{folderId:this.options.album.get('id')});
      this.collection.bind('reset', this.addAll, this);
      this.optionsBut = this.options.optionsBut;
      this.isOwner = this.optionsBut != null;
    },
    
    render: function(){
    	$(this.el).html(template.multimediaView.photoList( {folder: this.options.album.get('name'), owner: this.isOwner}));
    	if(this.optionsBut != null){ //Viewer is the owner
    		$(this.el).find("#optButCont").html(this.optionsBut.render().el);
    	}

        this.startPageContainer = $(this.el).find("#start-page");
        
        this.nextButton = $(this.el).find("#nextPage-btn").parent();
        this.previousButton = $(this.el).find("#previousPage-btn").parent();
        this.collection.fetch();
        return this;
    },
    addAll: function() {
    	this.$("#photo-list").html("");
        this.totalPages = this.collection.getTotalPages();
        if(this.totalPages > 0 && this.collection.size() == 0){
        	this.previousPage();
        }else{
        	$(this.el).find("#last-page").text(this.totalPages);
        	this.startPageContainer.text(this.collection.getPage());
        	this.checkNavButtons();
        	this.collection.each(this.addOne, this);
        }
    },
    
    addOne: function(photo) {
      var view = new PhotoView({model: photo, actionButtons: [$("#move-btn"),$("#remove-btn")], isOwner: this.isOwner });
      //var view = new MessageView({model: message, actionButtons: [$("#move-btn"),$("#remove-btn")] });
      this.$("#photo-list").append(view.render().el);
    },
    
    checkAll: function(){
    	$(".ckbox:not(:checked)").click();
    },
    
    checkNone: function(){
    	$(".ckbox:checked").click();
    },
    removePhotos: function(){
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
