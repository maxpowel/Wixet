var MessageFolderNewFormView = Backbone.View.extend({
    
    events: {
    	"click button":  "createFolder",
    },
    initialize: function() {
    	this.folderCollection = this.options.collection;
    	
    },
    
    createFolder: function(){
    	//Only insert if text is written
    	var val = $(this.el).find("#folderName-input").val().trim();
    	var collection = this.folderCollection;
    	if(val.length){
    		var folder = new MessageFolder({name: val});
    		folder.save(null,{success: function(){
    			collection.add(folder);
    		}});
    	}
    	
    	//TODO aqui estoy this.options.collection..destroy();
    },
    render: function() {
    	$(this.el).html(template.messagesView.newFolder());
		
    	

      return this;
    }
});