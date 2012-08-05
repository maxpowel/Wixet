var AboutMeView = Backbone.View.extend({
    
    el: '#aboutMe',
    
    /*events: {
    	"keypress #new-share":  "createOnEnter",
    	"click #more-newness":  "loadMoreNewness"
    },*/
    
    
    initialize: function() {
    	
      this.render();
  
      //this.options.collection.fetch({data:{page:1}});*/
    },
	
    render: function(){
		
		/*aboutMeCollection.each(function(aboutMe,i){
	    	  var view = new AboutMeEditEntryView({model: aboutMe});
	          cont.append(view.render().el);
	      });*/
    	$(this.el).html(template.profileView.aboutMe( {list: this.collection.toJSON()} ));
    }
});
