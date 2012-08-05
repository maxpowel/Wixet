var DoMeetingView = Backbone.View.extend({
    
	invitedPeopleView: null,
    events: {
    	"click #addField-but":  "addFieldForm",
    	"click #create-but":  "createMeeting",
    },
    initialize: function() {

    	this.fieldCollection = new MeetingFieldList();
    	
    	this.fieldListView = new MeetingFieldListView({ collection: this.fieldCollection});
    	

    },
    
    addFieldForm: function(){
    	
    	this.addFieldModal.modal('show');
    	
    },
   
    createMeeting: function(){
    	/*console.log(this.fieldListView.getFields());
    	console.log($(this.el).find("#title").val());
    	console.log($(this.el).find("#date").val());
    	console.log($(this.el).find("#description").text());*/
    	alert("Not available")
    },
    render: function() {
    	
    	$(this.el).html(template.meetingView.doMeeting( this.options));
    	//Invite people
    	this.invitedPeople = new MeetingInvitedPeopleListView();
    	$(this.el).find("#invitePeople-form").html(this.invitedPeople.render().el);
    	
    	
		if($("#doAddField").length == 0){
			var modalTemplate = template.meetingView.doMeetingAddField( this.options );

		    this.addFieldModal = $(modalTemplate);
		    this.addFieldModal.attr({id: "doAddField"});
		    this.addFieldModal.modal({backdrop:true, keyboard: true, show:false});
		    
		    var form = this.addFieldModal;

		    var fieldCollection = this.fieldCollection;
		    //Insert the new field
		    this.addFieldModal.find(".primary").click(function(){
		    	//Only insert if text is written
		    	var val = $.trim(form.find("input").val());
		    	if(val.length)
		    		fieldCollection.add(new MeetingField({text: val}));
		    	
		    	form.modal('hide');
		    	form.find("input").val("");
		    });
		    
		    //Cancel butotn
		    this.addFieldModal.find(".secondary").click(function(){
		    	form.modal('hide');
		    	form.find("input").val("");
		    });
		    
		}else this.addFieldModal = $("#doAddField");
    	

      return this;
    }
});