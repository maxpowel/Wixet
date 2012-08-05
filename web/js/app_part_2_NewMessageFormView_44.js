var NewMessageFormView = Backbone.View.extend({
    
	/*subSection: "new-message-form",//Subsection name inside central column
	el: "#new-message-form .subSection-content",
    */
    events: {
    	"click #attachFile-btn":  "attachFileForm",
    	"click #sendMessage-btn":  "sendMessage",
    	"click #success-close": "successClose"
    },
    initialize: function() {
    	
    	
    },
    
    render: function() {
    	
    	var self = this;
    	$(this.el).html(template.messagesView.newMessage(this.options));
    	var to = $(this.el).find("#toList");
    	
    	var text = $(this.el).find("#toText");
    	var hiddenInput = $(this.el).find("#to");
    	to.typeahead({
    		//TODO support for groups
			source: "/autocomplete/contacts",
			onSelect: function(item){
				text.text(item.value);
				hiddenInput.val(item.id);
				hiddenInput.attr({rtype: item.data});
				$(self.el).find("#sendMessage-btn").removeClass("disabled");
				
			}

    	});
    	
    	

      return this;
    },
    
    successClose: function(){
    	$(this.el).find("#sentSuccess").hide();
    },
    sendMessage: function(){
    	if(!$(this.el).find("#sendMessage-btn").hasClass("disabled")){
	    	var data = {body: $(this.el).find("#body").val(), receiver_id: $(this.el).find("#to").val(), receiver_type:$(this.el).find("#to").attr("rType"),  subject: $(this.el).find("#subject").val()};
	    	var message = new Message();
	    	var localThis = this;
	    	message.save(data,{success:function(){
	    		$(localThis.el).find("#sentSuccess").show();
	    		$(localThis.el).find("#body").val("");
	    		$(localThis.el).find("#subject").val("");
	    	}});
    	}
    },
    
    attachFileForm: function(){
    	alert("N/A");
    	//alert($(this.el).find("#body").val());
    }
});