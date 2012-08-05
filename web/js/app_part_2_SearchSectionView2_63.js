/*var RawData = Backbone.Model.extend({
	
});

var CommonThingList = Backbone.Collection.extend({
  model: CommonThing
});

var CityList = Backbone.Collection.extend({
	  model: City
});

var FriendList = Backbone.Collection.extend({
	  model: Friend
});


///Search results
var SearchResult = Backbone.Model.extend({
	
});

var SearchResultList = Backbone.Collection.extend({
	  url: "/search",
	  model: SearchResult
});

var SearchResultListView = Backbone.View.extend({
    
	
    //el: '#search-result',
    
    events: {
    	"click #more-results":  "loadMoreResults"
    },
    
    
    render: function(){
    	$(this.el).html(template.searchView.resultList());
    	this.options.collection.fetch({data:this.options.params});

        return this;
    
    },
    initialize: function() {
      //this.render();
      this.page = 1;
      
      this.options.collection.bind('add',   this.addOne, this);
      this.options.collection.bind('reset', this.addAll, this);
      //this.options.collection.bind('all',   this.render, this);

      var data = this.options.params;
      data.page = 1;
      
    },
    
    loadMoreResults: function(){
    	var data = this.options.params;
    	this.page = this.page + 1;
        data.page = this.page;
        
    	this.options.collection.fetch({ data:data });
    	
    },
    
    addAll: function() {
      this.options.collection.each(this.addOne);
    },
    
    addOne: function(result) {
      var view = new SearchResultView({model: result});
      this.$("#result-container").append(view.render().el);
    }
});

var SearchResultView = Backbone.View.extend({
    
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    	
    },
    
    remove: function() {
        $(this.el).remove();
     },
     
     destroyModel: function(){
    	 this.model.destroy();
     },
      
    render: function() {

    	$(this.el).html(template.searchView.searchResult({name: this.model.get("name"), 
    													  city: this.model.get("city"),
    													  thumbnail: this.model.get("thumbnail"),
    													  things: this.model.get("thingsInCommon"),
    													  friends: this.model.get("commonFriends"),
    													  other: this.model.get("other")
    													  }));

      return this;
    }
});

//Form views
var SimpleFormView = Backbone.View.extend({
	
    events: {
    	"click .close": "removeElement"
    },

	removeElement: function(){
		this.remove();
		this.model.destroy();
		
	}
});

var CommonThingFormView = SimpleFormView.extend({
	render: function(){
		$(this.el).html(template.searchView.commonThingRow({name:this.model.get("name") }));
		return this;
	}
});

var FriendFormView = SimpleFormView.extend({
	render: function(){
		$(this.el).html(template.searchView.friendRow({name:this.model.get("name") }));
		return this;
	}
});

var CityFormView = SimpleFormView.extend({
	render: function(){
		$(this.el).html(template.searchView.cityRow({name:this.model.get("name") }));
		return this;
	}
});
////////////
var City = Backbone.Model.extend({
	
});

var Friend = Backbone.Model.extend({
	
});

var CommonThing = Backbone.Model.extend({
	
});

//Used to pack all collections
var SearchQuery = Backbone.Model.extend({
	toJSON: function(){
		var data = {};
		for (i in this.attributes){
			data[i] = this.attributes[i].toJSON();
		}
		return data;
	}
});

var SearchSectionView = Backbone.View.extend({
    
	className: "container-fluid",
    events: {
    	"click #but-search": "clickSearch",
    	"keypress #query": "checkEnter",
    	"change #years": "setAge",
    	"change #other": "setOther",
    	"change #query": "setQuery"
    },

    resultsView: null,
    initialize: function() {
    	//console.log(($("#but-search").length));
      //this.render();
      this.thingList = new CommonThingList();
      this.friendList = new FriendList();
      this.cityList = new CityList();
      
      this.searchQuery = new SearchQuery({thingList: this.thingList, friendList: this.friendList, cityList: this.cityList});
      
      //Thing list
      this.thingList.bind('add',   this.addCommonThing, this);
      this.thingList.bind('remove',   this.doSearch, this);
      //
      //Friend list
      this.friendList.bind('add',   this.addFriend, this);
      this.friendList.bind('remove',   this.doSearch, this);
      //
      //City list
      this.cityList.bind('add',   this.setCity, this);
      this.cityList.bind('remove',   this.doSearch, this);
      //
      
    	
    	//this.doSearch();
    },
    
    
    setCity: function(city){
    	var view =  new CityFormView({model: city });
        $("#city-container").append(view.render().el);
        this.doSearch();
    },
    
    addCommonThing: function(thing){
    	var view =  new CommonThingFormView({model: thing });
        $("#thing-container").append(view.render().el);
        this.doSearch();
    },
    
    addFriend: function(friend){
    	var view =  new FriendFormView({model: friend });
        $("#friend-container").append(view.render().el);
        this.doSearch();
    },
    
    clickSearch: function(context){
    	this.doSearch();
    },
    
    setAge: function(event){
    	this.searchQuery.set({age: new RawData({data:$(event.currentTarget).val()})});
    },
    setQuery: function(event){
    	this.searchQuery.set({query: new RawData({data:$(event.currentTarget).val()})});
    },
    
    setOther: function(event){
    	this.searchQuery.set({other: new RawData({data:$(event.currentTarget).val()})});
    },
    doSearch: function(){
    	//console.log("esto va "+this.mensaje);
    	//console.log(JSON.stringify(this.searchQuery.toJSON()));
    	if(this.resultsView != null)
    		this.resultsView.remove();
    	
    	this.resultsView = new SearchResultListView({collection: new SearchResultList(), params: this.searchQuery.toJSON()});
    	
    	$('#search-result').html(this.resultsView.render().el);
    },
    
    checkEnter: function(event){
    	if(event.keyCode == 13)
    		this.doSearch();
    },
    
    render: function(){
		$(this.el).html(template.section.search( this.options));
		
		//Age filter (only numbers)
		$(this.el).find("#years").keydown(function(e)
        {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
            return (
                key == 8 || 
                key == 9 ||
                key == 46 ||
                (key >= 37 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    	
		//City autocomplete
		/*Para usar con jquery ui
		var setCityCallback = this.setCity;
    	$(this.el).find("#city").autocomplete(
    			{   
    				 source: "/autocomplete/city",
    				 minLength: 2,
    				 //mustMatch: true,
	            	 
    				 select: function( event, ui ) {
    						console.log(ui.item);
    					}
    			}).data("autocomplete")._renderMenu= function( ul, items ) {
    				//var cosa = '<div class="popover fade in below" style="z-index: 1; top: -358px; left: 15px; display: block; width:50px; position: relative"><div class="arrow"></div><div class="inner"><div class="content"></div></div></div>';
    				var cosa = '<div class="popover fade in below"><div class="arrow"></div><div class="inner"><div class="content"></div></div></div>';
    				var self = this;
    				$(ul).append(cosa);
    				//var style = $(ul).attr("style");
    				//$(ul).attr("style","");
    				//$(cosa).attr("style",style);
    				$(cosa).position( {
    					of: $("#city").element
    					});
    				var content = $(cosa).find(".content");
    				//console.log(ul);
    				//console.log($(ul).attr("style"));
    				//cosa.find(".content").append(ul);
    				$.each( items, function( index, item ) {
    					content.append("<div>"+item.label+"</div>");
    					self._renderItem( ul, item );
    				});
    			};
    				/*_renderItem = function( ul, item ) {
    				return $( "<li></li>" )
    				.data( "item.autocomplete", item )
    				.append( "<a>" + item.label + "asfd<br>" + item.desc + "</a>" )
    				.appendTo( ul );
    		};
    				 
    				 
    		
		 //City autocomplete
		var cityList = this.cityList;
    	$(this.el).find("#city").autocomplete("/autocomplete/city",
    			{    minChars: 2,
    				 mustMatch: true,
	            	 formatItem: function(data, i, n) {
	                     return "<div style='height:40px'><a style='margin-left: 10px' href='javascript:void(0)'>" + data[0]+"</a></div>";
	             }

    			}).result(function(event, item) {
    				cityList.add(new City({name: item[0], id: item[1]}));
    				$(this).val("");
    	});   
    	
		
    	/*
        //Common thing autocomplete
    	$(this.el).find("#thing").autocomplete("/datos",
    			{    minChars: 2,
    				 mustMatch: true,
	            	 formatItem: function(data, i, n) {
	            		 
	            		 //return "hola";
	            		 
	            		 
	                     return "<div style='height:40px'><img style='float:left' src='" + data[2] + "'/> <a style='margin-left: 10px' href='javascript:void(0)'>" + data[0]+"</a></div>";
	             }

    			}).result(function(event, item) {
    				thingList.add(new CommonThing({name: item[0], thingId: item[0]}));
    	});   
    	//Common friends autocomplete
    	$(this.el).find("#friend").autocomplete("/datos",
    			{    minChars: 2,
    				 mustMatch: true,
	            	 formatItem: function(data, i, n) {
	            		 
	            		 //return "hola";
	            		 
	            		 
	                     return "<div style='height:40px'><img style='float:left' src='" + data[2] + "'/> <a style='margin-left: 10px' href='javascript:void(0)'>" + data[0]+"</a></div>";
	             }

    			}).result(function(event, item) {
    				friendList.add(new Friend({name: item[0], friendId: item[0]}));
    	});
      //
      
		return this;
    }
});
*/