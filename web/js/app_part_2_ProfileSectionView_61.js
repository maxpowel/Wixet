var ProfileSectionView = Backbone.View.extend({
	className: "container-fluid",
	user: null,
    events: {
    	"click #newness-pill": "showNewness",
    	"click #aboutMe-pill": "showAboutMe",
    	"click #sendMessage-pill": "showSendMessage",
    	"click #albums-pill": "showAlbums"
    },
    
    initialize: function() {
    	this.userId = this.options.userId;
    	this.favouriteList = new FavouriteList();
    	this.personalInfo = new PersonalInfo();
    	this.favouriteList.bind('reset', this.renderFavourites, this);
    	this.personalInfo.bind('change', this.renderPersonalInfo, this);
    },
    
    renderFavourites: function(){
    	this.favourites.html(template.profileView.favourites( {favourites:this.favouriteList.toJSON() }));
    },
    renderPersonalInfo: function(){
    	this.personalInfoCont.html(template.profileView.personalInformation( this.personalInfo.toJSON() ));
    	

    },
    
    
    
    renderForUser: function(user){
    	
	      
		/*var favouritesList;
		var photos;
		var friends;
		var profileGadget;
		//
  	var newnessList = new NewnessListView({ collection: new NewnessList()});

  	var notificationList = new NotificationListView({ collection: new NotificationList()});

  	var contactSuggestionList = new ContactSuggestionListView({ collection: new ContactSuggestionList()});

  	var nearbyTaskList = new AgendaNearbyTaskListView({ collection: new AgendaNearbyTaskList()});
  	
  	var meetingList = new MeetingListView({ collection: new MeetingList()});
		*/
	      
    },
    
    
    renderProfile: function(user){
    	//Check if the user are allowed
    	if(this.user.get("id") == 0){
    		//Redirect to the user profile
    		location.href = "#profile";
    	}else{
	      this.subSections = this.$(".subSection");
	      this.newnessList = this.$("#newness-list");
	      this.aboutMe = this.$("#aboutMe");
	      this.sendMessage = this.$("#sendMessage");
	      this.albums = this.$("#albums");
	      this.activePill = this.$(".active");
	    
	      
	      this.favourites = $(this.el).find("#favourites-cont");
	      this.favouriteList.fetch({data:{id: this.user.get("id") }});
	      
	      
	      this.personalInfoCont = $(this.el).find("#personalInfo-cont");
	      this.personalInfo.fetch({data:{id: this.user.get("id")}});
	    
	      
	      //personalInfo.html(template.profileView.personalInformation( {name:"cosas"}));
	      
	      this.showNewness(null);
    	}
    },
    
    render: function(){
    	
    	var viewer = getViewer();
    	
    	
//		params.thumbnail = "http://placehold.it/170x150";
		/*params.firstName = user.get("firstName");
		params.lastName = user.get("lastName");
		params.id = user.get("id");
		*/

    	$(this.el).html(template.section.profile({id: viewer.get('id')}));
    	
    	var isOwner = viewer.get("id") == this.userId;

    	if(isOwner){
    		$(this.el).find(".thumbnail").attr({src: "photo/public/"+viewer.get("id")});
    		$(this.el).find("#profileTitle").text( viewer.get("firstName") +" "+ viewer.get("lastName") );
			this.user = viewer;
			this.renderProfile();
    	}else{
    		//Load user data
    		var user = new User({id: this.userId});
    		var localThis = this;
    		user.fetch({success:function(){
    			$(localThis.el).find(".thumbnail").attr({src: "photo/profile/"+viewer.get("id")});
        		$(localThis.el).find("#profileTitle").text( user.get("firstName") +" "+ user.get("lastName") );
    			localThis.user = user;
    			localThis.renderProfile();
    		}});
    		
    	}
    	
	      return this;

    	
    },
    
    changeToSimple: function(subSection,event){
    	//Se hace así (en vez de pasar un objeto nuevo) para sólo cargarlos una vez
    	this.subSections.filter(":visible").hide();
    	
    	subSection.show();
    	this.activePill.removeClass("active");
    	if(event != null)
    		this.activePill = $(event.currentTarget).parent();
    	
    	this.activePill.addClass("active");
    },
    showNewness: function(event){
    	this.changeToSimple(this.newnessList,event);
    	if(this.newness == null){
    		var newness = new NewnessListView({isOwner: this.user.get("isOwner"), name:this.user.get("firstName"), profileId: this.userId, collection: new NewnessList()});
    		this.newness = newness;
    		$(this.el).find("#newness-container").html(this.newness.render().el);
    	}
    	
    	
    },
    showAboutMe: function(event){
    	this.changeToSimple(this.aboutMe,event);
    	if(this.aboutMeView == null){
    		var aboutMeCollection = new AboutMeList();
    		var that = this;
    		
    		aboutMeCollection.fetch({data:{profile: this.user.get("id")},success: function(){
    				that.aboutMeView = new AboutMeView({collection: aboutMeCollection});
    			}
    		});
    		this.aboutMeView = "no null";
    	}
    },
    showSendMessage: function(event){
    	this.changeToSimple(this.sendMessage,event);
    	if(this.sendMessageView == null){
    		/*var aboutMe = new AboutMe();
    		aboutMe.fetch({data:{profile:1}});
    		this.aboutMeView = new AboutMeView({model: aboutMe});*/
    		this.sendMessageView = new NewMessageFormView({
    				to:{ 
    					name: this.user.get("firstName") +" "+this.user.get("lastName"),
    					id: this.user.get("id")
    				}
    		});
    		
    		$(this.el).find("#sendMessage-container").html(this.sendMessageView.render().el);
    		//.html();
    	}
    },
    showAlbums: function(){
    	
    }
});
