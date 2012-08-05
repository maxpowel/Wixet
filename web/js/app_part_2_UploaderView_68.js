var UploaderView = Backbone.View.extend({
	tagName: "span",
	
	events:{
		"click #uploadPhotos-but": "openModal",
		"click #uploaded-lbl": "recoverButtons" //Return to normal state the upload button
	},
	
	initialize: function(){
		
	},
	
	render: function(){
		$(this.el).html(template.appView.uploader());
		this.totalPercentCont = this.$el.find("#totalPercent"); 
    	
		return this;
	},
	
	recoverButtons: function(){
		this.$el.find("#uploaded-lbl").hide();
		this.$el.find("#uploadPhotos-but").show();
	},
	openModal: function(){
		var self = this;
		var dialog = new UploadDialogView({callback: function(files, albumId){
			self.uploadFiles(files, albumId);
			}
		});
		dialog.render();

		
		return false;//Avoid button click in the form
	},
    
    uploadFiles: function(files,albumId){
    		//files = document.getElementById('files').files;
    		//
    		
    		this.totalFileSize = 0;
    		this.totalUploaded = 0;
    		
    		for(i=0; i<files.length; i++){
    			this.totalFileSize += files[i].size;
    		}
    		
    		this.$el.find("#uploadPhotos-but").hide();
    		this.$el.find("#uploading-lbl").show();
    		
    		
    		//Upload files
    		this.filesRemaining = files.length;
    		for(i=0; i<files.length; i++){
    			this.uploadFile(files[i],albumId);
    		}

    	
    	return false;
    },
    
    
    updateProgress: function(newSize){
    	//TODO parece que se muestra mal....
    	this.totalPercentCont.text(Math.round((this.totalUploaded + newSize) * 100 / this.totalFileSize));
    	
    }, 
    
    uploadFailed: function(){
    	alert("Error while uploading file");
    },
    
    uploadFinished: function(albumId){
		//Return to normal upload button
		this.$el.find("#uploading-lbl").hide();
		this.$el.find("#uploaded-lbl").find("#albumLink").attr({href:"#multimedia/"+getViewer().get("id")+"/album/"+albumId})
		this.$el.find("#uploaded-lbl").show();
		//TODO edit link albumLink from uploaded-lbl to aim the album instead multimedia
    },
    uploadFile: function(file, albumId){
    	
    	 var fd = new FormData();
	     var localThis = this;
	     var aId = albumId;
	     var fileCounter = 0;
	     
	     this.button = $(localThis.el).find("#uploadPhotos-but");
	     this.resume = new UploadedResumeView({element: this.button});
	     fd.append("file", file);
	     fd.append("albumId", albumId);
	     
	     var xhr = new XMLHttpRequest();
	     xhr.upload.addEventListener("progress", function(evt){localThis.updateProgress(evt.loaded)}, false);
	     
	     xhr.addEventListener("load", function(evt){
	    	 		//localthis.addChisme
	    	        localThis.filesRemaining--;
	    	        localThis.totalUploaded += file.size;
					if(localThis.filesRemaining == 0)
						//Finished all photos
						localThis.uploadFinished(albumId);
	     }, false);
	     xhr.addEventListener("error", this.uploadFailed, false);
	     //xhr.addEventListener("abort", uploadCanceled, false);
	     xhr.open("POST", "/photo/upload");
	     xhr.send(fd); 
    }
	
});


var UploadDialogView = Backbone.View.extend({
	
	events:{
		"click #newAlbumA": "newAlbumForm",
		"click #createAlbum-but": "createAlbum",
		"click .upload": "sendCallback",
		"change input":  "updateFileInfo"
	},
	
	
	
	initialize: function(){
		this.albumList = new AlbumList();
		this.albumList.on("reset", this.addAll, this);
		this.albumList.on("add", this.addOne, this);
		this.albumList.fetch();
		this.append = true;
	},
	
	sendCallback: function(){
    	if(this.$el.find(".upload").hasClass("disabled") == false){
    		this.options.callback(document.getElementById('files').files, this.$el.find("#albumList").val());
			this.$el.unbind();
    	}
		return false;
	},
	
	addAll: function(){
		var self = this;
		this.albumList.each(function(album,i){
    		self.addOne(album)
    	});  
		this.append = false;
	},
	
	addOne: function(element, selected){
		var option = $("<option value='"+ element.get("id")+"'>"+ element.get("name")+"</option>");
		if(this.append)
			this.$el.find("#albumList").append(option)
		else{
			//Select the new album in the combo box
			var selected = $("#albumList:selected");
			if(selected.length)
				selected.attr("selected", null);
			
			option.attr("selected","selected")
			this.$el.find("#albumList").prepend(option)
		}
			
	},
	
	render: function(){
		var diag = $("#uploadDialog");
		if(diag.length > 0){
			this.setElement(diag);
			diag.find("#fileInfo").hide();
			diag.find("#files").val("");
			diag.find("tbody").html("");
			diag.modal('show')
			
		}else{
			html = $(template.appView.uploadDialog());
			this.setElement(html);
			html.modal();
		}


		
		return this;
	},
	
	newAlbumForm: function(){
		var form = $(this.el).find("#newAlbumCont");
		this.$el.find("#albumName-txt").val("");
		if(form.is(":visible"))
			form.hide();
		else{
			form.show();
			form.find("#albumName-txt").focus();
		}
	},
	
	createAlbum: function() {
		var album = new Album()
		var self = this;
		album.save({name: this.$el.find("#albumName-txt").val()},
					{
						success: function(){
							self.albumList.add(album);
						}
					});
		this.newAlbumForm();
		
	},
	
	//When user select files
    updateFileInfo: function(){
    	var fInfo = $(this.el).find("#fileInfo");
    	var files = document.getElementById('files').files;
    	
        
        var tbody = $(this.el).find("tbody");
        tbody.html("");
        
        for(i=0; i <files.length; i++ ){
        	var file = files[i];
        	var fileSize = 0;
            if (file.size > 1024 * 1024)
              fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
            else
              fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
            
            tbody.append(template.appView.uploadEntry({filename: file.name, size: fileSize}));
        }
        
        $(this.el).find(".upload").removeClass("disabled").attr("data-dismiss","modal");
        
        
    	//fInfo.find("#filename").text(file.name);
    	//fInfo.find("#size").text(fileSize);
    	fInfo.show();
    }
	
	
});


/*var UploaderView = Backbone.View.extend({
	className:"modal hide fade",
    
	events:{
		"click .cancel": "closeWindow",
		"click .upload": "uploadFiles",
		"change input":  "updateFileInfo"
		
	},
    initialize: function() {
    	//this.model.bind('destroy', this.remove, this);
    	this.reset();
    	
    	this.albumList = new AlbumList();
    	this.albumList.bind('reset', this.render, this);
    	
    },
    
    remove: function() {
        //$(this.el).remove();
     },
     
     destroyModel: function(){
    	 this.model.destroy();
     },
      
    render: function() {
    	
    	if(this.albumList.isEmpty()){
    		//Infinite loop if the user does not have any alubm!
    		this.albumList.fetch();
    	}else{
	    	//TODO hacer que esto cambie
	    	$(this.el).css({display: "none"});
	    	$(this.el).html(template.appView.uploadPhoto({albumList: this.albumList.toJSON()}));
    	}
    	

      return this;
    },
     
    updateFileInfo: function(){
    	var fInfo = $(this.el).find("#fileInfo");
    	var files = document.getElementById('files').files;
    	
        
        var tbody = $(this.el).find("tbody");
        tbody.html("");
        
        for(i=0; i <files.length; i++ ){
        	var file = files[i];
        	var fileSize = 0;
            if (file.size > 1024 * 1024)
              fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
            else
              fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
            
            tbody.append(template.appView.uploadEntry({filename: file.name, size: fileSize}));
        }
        
        $(this.el).find(".upload").removeClass("disabled");
        
    	//fInfo.find("#filename").text(file.name);
    	//fInfo.find("#size").text(fileSize);
    	fInfo.show();
    },
    
    uploadFiles: function(){
    	if($(this).hasClass("disabled") == false){
    		this.closeWindow();
    		this.options.context.trigger('uploading',document.getElementById('files').files);
		}
    },
    reset: function(){
    	$(this.el).find(".file").val("");
		$(this.el).find(".upload").addClass("disabled");
		var tbody = $(this.el).find("tbody");
		tbody.html("");
		$(this.el).find("#fileInfo").hide();
		
    },
    
    closeWindow: function(){
    	$(this.el).modal('hide');
    }
});*/