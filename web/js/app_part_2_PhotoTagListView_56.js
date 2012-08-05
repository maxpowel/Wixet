var PhotoTagListView = Backbone.View.extend({
    
    initialize: function(options) {

    	//Lista de etiquetas
    	this.tagList = new PhotoTagList();
    	
        this.tagList.bind('add',   this.addOne, this);
        this.tagList.bind('reset', this.addAll, this);

        this.photo = this.options.photo;
      
    },
    
    render: function(){
    	
    	var posicion = null;
    	this.tagListContainer = $(this.el);
    	var photo = this.options.photo;

    	var tagList = this.tagList;
    	var selector = $("<div><div style='border:4px solid rgba(255, 255, 255, 0.8); width:92px; height:92px; border-radius:4px 4px 4px 4px;'></div></div>"); //Cuadrado
    	var autocomplete = $('<input type="text" data-provide="typeahead" style="margin: 0 auto;" class="span3">'); //Input
    	
    	var form = $("<div class='well span'>"); //Input decorado
    	form.append(autocomplete);
    	var tagger =$("<div id='tagger' align='center'>");//Objeto completo
    	
    	tagger.css({
    			position:"absolute"
    			
    		});
    		
    	
    	selector.css({

    			width: "100px",
    			height: "100px",
    			border: "1px solid #000000",
    			"border-radius": "4px 4px 4px 4px"
    	});
    	
    	
    	var indicador = selector.clone();
    	indicador.hide();
    	this.indicator = indicador;

    	
    	
    	
    	tagger.append(selector);
    	tagger.append(form);
    	/*photo.before(tagger);
    	photo.before(indicador);
    	*/
    	$("#content").append(tagger);
    	$("#content").append(indicador);

    	
    	
    	photo.click(reallocate);
    	tagger.click(function(e){
    		
    		if(!$(e.target).hasClass("span3"))
    			reallocate(e);
    	});
    	
    		
    		
    	function reallocate(e){
    		
    		var x = e.pageX - photo.offset().left;
    		var y = e.pageY - photo.offset().top;
    		
    		tagger.show();
    		tagger.position({
    			  my: "center top",
    			  at: "left top",
    			  of: photo,
    			  offset: x+" "+(y - (selector.height()/2)),
    			  collision: "fit"
    			});
    		
    		

    		
    		posicion = {x: x, y: y};
    		autocomplete.focus();
    		

    	}
    	var photo = this.photo;
    	autocomplete.typeahead({
    			source: "/autocomplete/contacts",
    			onSelect: function(item){
    				tagger.hide();
    				var posicionLocal = {x: posicion.x, y: posicion.y};
    				var tag = new PhotoTag();

    				tag.save({mediaItemId: photo.attr("mediaItemId"),profileId: item.id, value:item.value, left: posicionLocal.x, top: posicionLocal.y},{
    						success:function(){
    							tagList.add(tag);    							
    						}
    				});
    				indicador.hide();
    			},
    			onBlur: function(){
    				tagger.hide();
    			}
    	});
    	tagger.hide();
    	///End tagger
    	this.tagList.reset(this.options.tags);
    },
    addAll: function() {
    	var cont = $(this.el); 
    	var box = this.indicator;
    	var photo = this.photo;
    	this.tagList.each(function(tag,i){
    	  var view = new PhotoTagView({model: tag, box: box, photo: photo});
          cont.append(view.render().el);
      });  
    },
    
    addOne: function(tag) {
    	
    	var view = new PhotoTagView({model: tag, box: this.indicator, photo:this.photo});

    	$(this.el).append(view.render().el);
    }
   
});
