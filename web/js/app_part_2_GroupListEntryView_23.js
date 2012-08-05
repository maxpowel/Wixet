var GroupListEntryView = Backbone.View.extend({
    
	tagName: "li",
	
	events: {
		"click a": "loadSubsection",
		"click .close": "removeGroup"
	},
	
    initialize: function() {
    	this.model.bind('change', this.modelChanged, this);
    	
    	
    },
    
    modelChanged: function(){
    	
    	$(this.el).find("a").text(this.model.get("name"));
    },
    
    removeGroup: function(){
    	var self = this;
    	this.model.destroy();
    },

    loadSubsection: function(e){
    	if($(e.target).hasClass("load")){
    		var edit = new GroupEditView({model: this.model});
    		this.options.call(edit.subSectionId, edit);
    	}
    	/*$(this.el).find("a").text(this.model.get('name'));
    	this.messageContainer.find("#folderName").text(this.model.get('name'));*/
    },
    render: function() {
    	
    	$(this.el).html( template.preferencesView.groupListEntry({name:this.model.get("name")}) );
    	
    	$(this.el).hover(function(){
    		$(this).find(".close").show();
    	},
    	function(){
    		$(this).find(".close").hide();
    	});
    	
      return this;
    },
    
    
});