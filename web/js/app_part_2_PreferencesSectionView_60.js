var PreferencesSectionView = Backbone.View.extend({
	className: "container-fluid",
	selected: null,
    events: {
    	"click #personal-lnk":  "loadPersonal",
    	"click #aboutMe-lnk":  "loadAboutMe",
    	"click #favourites-lnk": "loadFavourites",
    	"click #security-lnk": "loadSecurity",
    	"click #customize-lnk": "loadCustomize"
    },
    
    initialize: function() {
      
    },
    
    render: function(){
    	$(this.el).html(template.section.preferences());
    	this.content = $(this.el).find("#bodyContent");
    	this.selected = $(this.el).find("#personal-lnk").parent();
    	this.loadPersonal();
		return this;
    },
    
    loadPersonal: function(e){
    	
    	this.selected.removeClass("active");
    	this.selected = $(this.el).find("#personal-lnk").parent();
    	this.selected.addClass("active");
    	var view = new PersonalInformationView();
    	this.content.html(view.render().el);
    },
    
    loadAboutMe: function(){
    	this.selected.removeClass("active");
    	this.selected = $(this.el).find("#aboutMe-lnk").parent();
    	this.selected.addClass("active");
    	var view = new AboutMeEditView();
    	this.content.html(view.render().el);
    },
    
    loadFavourites: function(){
    	alert("Not available");
    },
    
    loadSecurity: function(){
    	this.selected.removeClass("active");
    	this.selected = $(this.el).find("#security-lnk").parent();
    	this.selected.addClass("active");
    	var view = new SecurityView();
    	this.content.html(view.render().el);
    },
    
    loadCustomize: function(){
    	alert("Not available");
    }
});
