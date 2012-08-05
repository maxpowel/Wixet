var QueryResult = Backbone.Model.extend({
	
});


var QueryResultView = Backbone.View.extend({
	
	events: {
		"click #addGroup": "addGroupDialog"
	},
    render: function(){
    	var html = template.searchView.queryResult( this.model.toJSON() );
    	
    	//TODO mejorar esto para eliminar los tag script
    	// si se quiere poner html
    		html = html.replace(/\[b\]/g, '<strong>')
    		html = html.replace(/\[\/b\]/g, '</strong>')
    	//
		$(this.el).html(html);
		$(this.el).css("min-height", "48px");
    	
		//$(this.el).find("button").
		return this;
    },
    
    addGroupDialog: function(){
    	if(this.dialog == null){
    		var self = this;
    		this.dialog = $(template.searchView.addGroupDialog());
    		var dialog = this.dialog;
    		dialog.modal();
    		
    		dialog.find(".cancel").click(function(){
    			dialog.modal('hide');
    		});
    		
    		dialog.find(".add").click(function(){
    			dialog.modal('hide');
    			self.$el.find("#addGroup").remove();
    			$.getJSON('/permission/addGroup/'+self.model.get('id')+'/'+dialog.find("#groupList").val(), function(data){
    				if(data.error)
    					alert("Error while inserting user into the group")
    				else
    					self.$el.find("#groupName").text(dialog.find("#groupList").text()).show();
    			})
    			
    			
    		});
    		
    		core.getGroups(function(groups){
    			var select = dialog.find("#groupList");
    			$.each(groups,function(i,group){
    					select.append("<option value='"+ group.get('id') +"'>"+ group.get('name') +"</option>")
    			})
    			
    		});
    	}else{
    		this.dialog.modal('show');
    	}
        
    }
});



var SearchQuery = PaginatedCollection.extend({
  model: QueryResult,
  baseUrl:"/search/",
  page: null,
  
  url: function() {
	return this.baseUrl + '?' + $.param({q: this.query});
  },
  
  initialize: function(models,options) {
	this.page = 1;
	this.query = options.query;
  }
		  
});


//TODO Hacer pagination view para esto, mensajes y fotos (de momento)
var SearchSectionView = Backbone.View.extend({
    
	query: null,
	searchQuery: null,
	
	className: "container-fluid",
    events: {
    	"click #but-search": "doSearch",
    },

    /*initialize: function() {
    	
    },*/
    
    doSearch: function(){
    	
    	var query = $.trim(this.searchQuery.val());
    	
    	if(query.length){
	    	this.query = new SearchQuery(null, {
	    				query: query 
	    	});
	    	this.query.bind('reset', this.addAll, this);
	    	this.query.fetch();
	    	
	    	$(this.el).find("#resultContainer").show().find("#resultsFor").text(query);
    	}
    	//Avoid redirection on click
    	return false;
    },
    
    addAll: function(){
    	
    	var self = this;
    	self.resultList.html("");
    	
        this.totalPages = this.query.getTotalPages();
        if(this.totalPages > 0 && this.query.size() == 0){
        	this.previousPage();
        }else{
        	this.lastPageContainer.text(this.totalPages);
        	this.startPageContainer.text(this.query.getPage());
        	this.checkNavButtons();
        	
        	self.query.each(function(result){
        		var view = new QueryResultView({model: result});
        		self.resultList.append(view.render().el);
        	});	
        }
        

    	
    },
    
    checkNavButtons: function(){
    	var page = this.query.getPage();
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
    
    render: function(){
		$(this.el).html(template.section.search( this.options ));
    	this.searchQuery = $(this.el).find("#search-query");
    	this.resultList = $(this.el).find("#results");
    	
        this.startPageContainer = $(this.el).find("#start-page");
        this.lastPageContainer = $(this.el).find("#last-page");
        
        this.nextButton = $(this.el).find("#nextPage-btn").parent();
        this.previousButton = $(this.el).find("#previousPage-btn").parent();
        
        if(this.options.query != null){
        	this.searchQuery.val(this.options.query)
        	this.doSearch();
        }
		return this;
    },
    nextPage: function(){
    	if(this.query.getPage() < this.totalPages){
    		this.query.nextPage();
    		this.startPageContainer.text(this.query.getPage());
    	}
    },
    previousPage: function(){
    	if(this.query.getPage() > 1){
    		this.query.previousPage();
    		this.startPageContainer.text(this.query.getPage());
    	}
    }
    

});
