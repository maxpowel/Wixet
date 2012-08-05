var MessageFolderOptionsFormView = Backbone.View.extend({
    removeWindow: null,
    events: {
    	"click #save-folder-btn":  "saveFolder",
    	"click #remove-folder-btn": "removeFolder",
    },
    initialize: function() {

    	
    },
    
    saveFolder: function(){
    	var name = $.trim($(this.el).find("#folderName-input").val());
    	console.log(name);
    	if(name.length > 0){
    		this.options.folder.set({name:name});
    		this.options.folder.save();
    		this.options.context.backToMain();
    	}
    },
    removeFolder: function(){
    	
    	if(this.removeWindow == null){
    		var modalTemplate = template.messagesView.removeFolderAsk( {folder:this.options.folder.get('name')});
    		var folder = this.options.folder;
	    	this.removeWindow = $(modalTemplate);
	    	var remWin = this.removeWindow;
	    	this.removeWindow.modal({backdrop:true, keyboard: true});
	    	this.removeWindow.find(".remove").click(function(){
	    		folder.destroy({wait: true, error: function(){
	    			alert("Folder cannot be remove because is not empty or is your main folder")
	    		}});
	    		remWin.modal('hide');
	    	});
	    	this.removeWindow.find(".cancel").click(function(){
	    		remWin.modal('hide');
	    	});
    	}
	    this.removeWindow.modal('show');

    },
    render: function() {
    	$(this.el).html(template.messagesView.folderOptions({name:this.options.folder.get('name')}));
		
    	

      return this;
    }
});