var AlbumView = Backbone.View.extend({
    
	tagName: "li",
	
	events: {
		"click .load": "loadAlbum"
	},
	
    initialize: function() {
    	//this.render();
    	this.photoContainer = this.options.photoContainer;
    	this.model.bind('change', this.modelChanged, this);
    	this.model.bind('destroy', this.removeAlbum, this);
    },
    
    modelChanged: function(){
    	$(this.el).find("a").text(this.model.get('name'));
    	this.photoContainer.find("#folderName").text(this.model.get('name'));
    },
    render: function() {
    	$(this.el).html(template.multimediaView.album( {name: this.model.get('name')} ) );

      return this;
    },
    
    removeAlbum: function(){
    	$(this.el).unbind().remove();
    },
    loadAlbum: function(){
    	if(this.options.newAlbumButton != null){ //Viewer is the owner
    		var albumOptions = new AlbumOptionsButtonView({album: this.model});
        	var photoList = new PhotoListView({album:this.model, optionsBut: albumOptions});
        	
        	
        	var menu = new MultimenuView({original:photoList, subsections:[albumOptions,this.options.newAlbumButton], el: this.photoContainer});
    	}else{
    		var photoList = new PhotoListView({album:this.model, optionsBut: null});
        	var menu = new MultimenuView({original:photoList, subsections:[], el: this.photoContainer});
    	}
    	
    	menu.render();
    	this.trigger("loaded",this.el);
    }
});