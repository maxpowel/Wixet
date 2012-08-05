var AlbumListView = Backbone.View.extend({
	tagName:"ul",
    className:"nav nav-list",
    loadedAlbum: null,
    
    initialize: function() {
    	this.photoContainer = this.options.photoContainer;
    	this.newAlbumButton = this.options.newAlbumButton;
    	this.profileId = this.options.profileId;
    	this.optionsButtonContainer = this.options.optionsButtonContainer;
        this.options.collection.bind('add',   this.addOne, this);
        this.options.collection.bind('reset', this.addAll, this);
        this.options.collection.bind('remove', this.removeOne, this);
        //this.options.collection.bind('all',   this.render, this);
      },
      
      render: function(){
    	  //this.menu = new MultimenuView({original:newnessList, subsections:[meetingList], el: this.messageContainer});
      	//this.menu = new MultimenuView({original:newnessList, subsections:['profile','search'], el: $(this.el).find("#meetings")});
      	//this.menu.render();
      	//this.newMessageButtonView = new NewMessageButtonView();
    	//$(this.el).find("#newButton-cont").html(this.newMessageButtonView.render().el);
    	  
          this.options.collection.fetch({data:{profile: this.profileId}});
    	  return this;
      },
      
      addAll: function() {
    	  var cont = $(this.el);
    	  var self = this;
    	  cont.html("");
    	  cont.append('<li class="nav-header">Albums</li>');
    	  var photoCon = this.photoContainer;
    	  var albumButton = this.newAlbumButton;
    	  var profileId = this.profileId;
    	  var albumId = this.options.albumId;
          this.options.collection.each(function(folder,i){
        	  var view = new AlbumView({model: folder, photoContainer: photoCon, newAlbumButton: albumButton});
        	  
        	  cont.append(view.render().el);
        	  view.bind('loaded', self.albumLoaded, self);
        	  if(albumId != null){
        		  if(folder.get('id') == albumId)
            		  view.loadAlbum();
          	  }else if(i == 0){
        		  view.loadAlbum();
        	  }
          });    	  
      },
      
      albumLoaded: function(album){
    	  
    	  if(this.loadedAlbum != null)
    		  this.loadedAlbum.removeClass("active");
    	  
    	  this.loadedAlbum = $(album);
    	  this.loadedAlbum.addClass("active");
      },
      
      addOne: function(album){
    	  
    	  var view = new AlbumView({model: album, photoContainer: this.photoContainer, newAlbumButton: this.newAlbumButton});
          $(this.el).append(view.render().el);
          view.loadAlbum();
      },
      removeOne: function(folder) {
    	  this.addAll();
      }
});
