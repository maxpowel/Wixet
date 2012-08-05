var MultimediaSectionView = Backbone.View.extend({
	className: "container-fluid",
    
    initialize: function() {
      this.albumCollection = new AlbumList();
      
      
    },
    
    render: function(){
    	$(this.el).html(template.section.multimedia( this.options ));
    	
    	//Use a view because later we will pass the buttonView to the multimenu
    	/*var newMessageButtonView = new NewMessageButtonView();
    	$(this.el).find("#newButton-cont").html(newMessageButtonView.render().el);
    	*/
    	var newAlbumButtonView = null;
    	if(this.options.profileId == getViewer().get('id')){
    		var newAlbumButtonView = new NewAlbumButtonView({collection: this.albumCollection});
    		$(this.el).find("#newFolder-cont").html(newAlbumButtonView.render().el);
    	}
    	//Folder list view will create the multimenu that contains messagelist, newmessageform and folderoptions
    	
    	
    	var albumListView = new AlbumListView({collection: this.albumCollection, photoContainer: $(this.el).find("#multimenu"), newAlbumButton: newAlbumButtonView, optionsButtonContainer:$(this.el).find("#optionsButton-cont"), profileId:this.options.profileId, albumId: this.options.albumId});
    	$(this.el).find(".well").prepend(albumListView.render().el);
    	
    	/*
    	var newMessageFormView = new NewMessageFormView();
    	var folderOptionsView = new FolderOptionsFormView({folder:folder, context: this});
    	
    	
    	
    	//folderList
    	
    	return this;
    	this.menu = new MultimenuView({original:folderListView, subsections:[messageFormView,folderOptionsView], el: $(this.el).find("#multimenu")});
    	this.menu.render();
    	
		
		//FolderListView will init the messages
		
		
		//Create new folder form
		//TODO corregir esto de la ventana modal
		if($("#newFolderForm").length == 0){
			var modalTemplate = template.messagesView.newFolder();

		    this.newFolderFormModal = $(modalTemplate);
		    this.newFolderFormModal.attr({id: "newFolderForm"});
		    this.newFolderFormModal.modal({backdrop:true, keyboard: true});
		    
		    var form = this.newFolderFormModal;

		    var folderCollection = this.folderCollection;
		    //Insert the new field
		    this.newFolderFormModal.find(".primary").click(function(){
		    	//Only insert if text is written
		    	var val = form.find("input").val().trim();
		    	if(val.length){
		    		var folder = new MessageFolder({name: val});
		    		folder.save();
		    		folderCollection.add(folder);
		    		
		    	}
		    	
		    	form.modal('hide');
		    	form.find("input").val("");
		    });
		    
		    //Cancel button
		    this.newFolderFormModal.find(".secondary").click(function(){
		    	form.modal('hide');
		    	form.find("input").val("");
		    });
		    
		}else this.newFolderFormModal = $("#newFolderForm");
		///////*/
		return this;
    },
    
    showNewMessage: function(){
    	console.log("hola");
    	if(this.messageFormView != null)
    		this.messageFormView.unbind();
    	this.messageFormView = new NewMessageFormView();
    	this.changeTo(this.messageFormView);
    },
    
    showFolderOptions: function(folder){
    	console.log(this.folderOptionsView);
    	if(this.folderOptionsView != null){
    		this.folderOptionsView.unbind();
    		this.folderOptionsView.remove();
    	}
    	this.folderOptionsView = new FolderOptionsFormView({folder:folder, context: this});
    	this.changeTo(this.folderOptionsView);
    	/*console.log("change to "+folder.get("name"))
    	if(this.folderOptionsView[folder.get("name")] == null)
    		this.folderOptionsView[folder.get("name")] = new FolderOptionsFormView({folder:folder, context: this})
    	this.changeTo(this.folderOptionsView[folder.get("name")]);*/
    },
    
    showNewFolder: function(){
    	this.newFolderFormModal.modal('show');
    }
});
