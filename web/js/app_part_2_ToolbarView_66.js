var ToolbarView = Backbone.View.extend({

	
	events: {
		//"submit form": "cancelSubmit",
		//"keypress #quick-search-input": "quickSearch"
	},
	
	
	initialize: function() {

	},
  
	quickSearch: function ( event ){
		text = $(event.currentTarget).val();
		
		if(event.keyCode == 13){
			this.options.router.navigate("search/"+text,true);
			return false;
		}
		
	},
	
	
	cancelSubmit: function(){
		console.log("asd")
		return false;
	},
	
	render: function(){
		var self = this;
		$(this.el).find("#uploadBut-cont").html(new UploaderView().render().$el);
		this.$el.find("#quick-search-input").typeahead({
			source: "/autocomplete/contacts",
			onSelect: function(item){
				self.options.router.navigate("profile/"+item.id,true);
			},
			
			onNotFound: function(text){
				self.options.router.navigate("search/"+text,true);
				return false;
			}
	});

	}
	
});