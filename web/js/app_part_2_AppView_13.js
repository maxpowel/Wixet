var AppView = Backbone.View.extend({
	actualSection: null,
	navbar: null,
	toolbar: null,
	sectionContainer: null,
	activeMenuSection: function( section ){
		//Activate the menu toolbar button
		this.navbar.find(".active").removeClass("active");
		this.navbar.find("#menu-"+section).addClass("active");
	},
	  
	clean: function(){
		if(this.actualSection != null){
			  this.actualSection.unbind();
			  this.actualSection.remove();
		}
	},
    loadView: function(view){
	    this.clean();
        this.actualSection = view;
	    this.sectionContainer.html(view.render().el);
    },
	initialize: function() {
		this.render();
		
		
		$(this.el).find(".dropdown-toggle").dropdown();
		
		
		this.navbar = $(this.el).find("#navbar");
		var navbar = this.navbar;
		this.sectionContainer = $(this.el).find("#content"); 
		var app = this;
		var Controller = Backbone.Router.extend({
			  navbar: navbar,
			  
			  routes: {
			    "start":                 "loadStart",
			    "photo/:id":					"loadPhoto",
			    "search/:query":                 "loadSearchQuery",
			    "search":                 "loadSearch",
			    "messages":                 "loadMessages",
			    "agenda/:year/:month":   "loadAgenda",
			    "agenda":   "loadAgenda",
			    "profile/:id":           "loadProfile",
			    "profile":           "toProfile",
			    "multimedia/:id":             "loadMultimedia",
			    "multimedia/:id/album/:albumId": "loadAlbum",
			    "multimedia":                 "toMultimedia",
			    "preferences":             "loadPreferences",
			    "" :"goToStart"
			  },
			  goToStart: function(){
				  this.navigate("start", true);
			  },
			  
			  loadStart: function() {
				  app.activeMenuSection("start");
				  app.loadView(new StartSectionView());
			  },

			  loadProfile: function(id) {
				  app.activeMenuSection("profile");
				  app.loadView(new ProfileSectionView({userId:id}));
			  },
			  
			  toProfile: function() {
				  this.navigate("profile/"+getViewer().get('id'),true);
			  },
			  
			  loadPreferences: function() {
				  app.activeMenuSection("preferences");
				  app.loadView(new PreferencesSectionView());

			  },
			  
			  loadAlbum: function(id, albumId) {
				  app.activeMenuSection("multimedia");
				  app.loadView(new MultimediaSectionView({profileId:id, albumId: albumId}));
			  },
			  
			  loadMultimedia: function(id) {
				  app.activeMenuSection("multimedia");
				  app.loadView(new MultimediaSectionView({profileId:id}));

			  },
			  
			  toMultimedia: function() {
				  this.navigate("multimedia/"+getViewer().get('id'),true);
			  },
			  
			  loadPhoto: function(id) {
				  app.activeMenuSection("multimedia");
				  app.loadView(new PhotoSectionView({photoId:id}));
			  },
			  
			  loadAgenda: function(year, month) {
				  alert("Not available")
				  return;
				  app.activeMenuSection("agenda");
				  if(app.sections.agenda == null)
					  app.sections.agenda = new AgendaSectionView();
				  app.sectionContainer.html(app.sections.agenda.el);
			  },
			  
			  loadSearch: function() {
				  app.activeMenuSection("search");
				  app.loadView(new SearchSectionView());
			  },
			  
			  loadSearchQuery: function(query) {
				  app.activeMenuSection("search");
				  app.loadView(new SearchSectionView({query: query}));
			  },
			  
			  loadMessages: function() {
				  app.activeMenuSection("messages");
				  app.loadView(new MessagesSectionView());
			  }

			});

			Backbone.emulateHTTP = true;
			var controller = new Controller();
			this.toolbar = new ToolbarView({router: controller, el: $(this.el).find("#navbar")});
			this.toolbar.render();
			Backbone.history.start();
	},

	
	render: function(){
		$(this.el).html(template.appView.app());
		return this;
	}
	
});
