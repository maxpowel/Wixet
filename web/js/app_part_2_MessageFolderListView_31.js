var MessageFolderListView = Backbone.View.extend({
    className:"inputs-list",
    tagName:"ul",
    initialize: function() {
    	this.messageContainer = this.options.messageContainer;
    	this.newMessageButton = this.options.newMessageButton;
    	this.newFolderButton = this.options.newFolderButton;
    	this.optionsButtonContainer = this.options.optionsButtonContainer;
        this.options.collection.bind('add',   this.addOne, this);
        this.options.collection.bind('reset', this.addAll, this);
        this.options.collection.bind('remove', this.removeOne, this);
        //this.options.collection.bind('all',   this.render, this);
      },
      
      render: function(){
    	  //this.menu = new MultimenuView({original:newnessList, subsections:[meetingList], el: this.messageContainer});
      	//this.menu = new MultimenuView({original:newnessList, subsections:['profile','search'], el: $(this.el).find("#meetings")});
      	//this.menu.render();
      	//this.newMessageButtonView = new NewMessageButtonView();
    	//$(this.el).find("#newButton-cont").html(this.newMessageButtonView.render().el);
    	
          this.options.collection.fetch();
    	  return this;
      },
      
      addAll: function() {
    	  var cont = $(this.el);
    	  cont.html("");
    	  var msgCon = this.messageContainer;
    	  var messageButton = this.newMessageButton;
    	  var folderButton = this.newFolderButton;
    	  var optCon = this.optionsButtonContainer;
    	  //Seguramente la siguinete linea se puede borrar
    	  //var messageFolders = this.messageFolders;
          this.options.collection.each(function(folder,i){
        	  var view = new MessageFolderView({model: folder, messageContainer: msgCon, newMessageButton: messageButton, newFolderButton: folderButton, optionsButtonContainer: optCon});
        	  if(i == 0)
        		  view.loadFolder();
        	  cont.append(view.render().el);
          });
        	  
      },
      
      addOne: function(folder){
    	  var view = new MessageFolderView({model: folder, messageContainer: this.messageContainer, newMessageButton: this.newMessageButton, newFolderButton: this.newFolderButton, optionsButtonContainer: this.optionsButtonContainer});
          $(this.el).append(view.render().el);
          view.loadFolder();
      },
      removeOne: function(folder) {
    	  this.addAll();
      }
});
