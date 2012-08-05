var AboutMeEditView = Backbone.View.extend({
    
    events: {
    	"click #newAboutMe-but": "addNew"
    },
	
    initialize: function() {
    	this.aboutMeCollection = new AboutMeList({id: getViewer("id")});
    	this.aboutMeCollection.bind('add',   this.addOne, this);
        this.aboutMeCollection.bind('reset', this.addAll, this);
    },
    
      
    render: function() {
    			
    			
    	$(this.el).html(template.preferencesView.aboutMe());
    	this.aboutMeCollection.fetch({data:{profile: getViewer().get("id")}});
    	this.aboutMeList = $(this.el).find("#aboutMeList");
    	
    	

      return this;
    },
    
    addAll: function() {
    	var cont =this.aboutMeList; 
    	this.aboutMeCollection.each(function(aboutMe,i){
    	  var view = new AboutMeEditEntryView({model: aboutMe});
          cont.append(view.render().el);
      });  
    },
    
    addOne: function(aboutMe){

  	  var view = new AboutMeEditEntryView({model: aboutMe});
        this.aboutMeList.append(view.render().el);
    },
    
    addNew: function(){
        this.addOne(new AboutMe({title:"",body:""}));
    }
});