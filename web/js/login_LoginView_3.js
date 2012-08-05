var LoginView = Backbone.View.extend({

	events:{
		"click #login-btn": "login",
		"click a.close:": "hideError"
	},
	
	initialize: function() {
		this.render();
		this.usernameInput = $(this.el).find("#usernameLogin");
		this.passwordInput = $(this.el).find("#passwordLogin");
		this.error = $(this.el).find(".error");
		if($("#loginError").length > 0){
			this.error.show();
		}
		
	},
	
	render: function(){
		$(this.el).html(template.loginApp.login());
	},
	
	login: function(){
		var loginForm = $('<form style="display:none" method="post" action="/login_check"><input type="text" name="_username" class="username"><input type="password" name="_password" class="password"></form>');
		$("body").append(loginForm);
		loginForm.find(".username").val(this.usernameInput.val());
		loginForm.find(".password").val(this.passwordInput.val());
		loginForm.submit();
		/*var auth = new UserAuthentication();
		auth.set({username: this.usernameInput.val(), password: this.passwordInput.val()});
		auth.save();
		auth.fetch();*/
	},
	
	hideError: function(){
		this.error.hide();
	}
});