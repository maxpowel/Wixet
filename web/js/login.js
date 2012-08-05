$(document).ready(function(){

	new LoginApp({el: $("#content")});
	var loadTimeout = null;//Used to avoid disturb when fast loadings 
	$("#loading").hide().ajaxStart(function(){
		var e = $(this);
		loadTimeout = setTimeout(function(){
			e.show();
		},1200);
		   
	}).ajaxStop(function(){
		clearTimeout(loadTimeout);
		$(this).hide();
	});
	
	//Github updates
	//$.getJSON("https://api.github.com/networks/maxpowel/WixetBundle/events", function(data){
	$.getJSON("/changes?type=core", function(data){
		$("#coreDate").text(data[0].created_at);
		$("#coreDesc").text(data[0].payload.commits[0].message);
	});
	
	//$.getJSON("https://api.github.com/networks/maxpowel/UserInterfaceBundle/events", function(data){
	$.getJSON("/changes?type=ui", function(data){
		$("#uiDate").text(data[0].created_at);
		$("#uiDesc").text(data[0].payload.commits[0].message);
	});
	
});

var LoginApp = Backbone.View.extend({

	initialize: function() {
		var container = $(this.el).find("#section");
		var Controller = Backbone.Router.extend({
			  
			  routes: {
			    "":                 "showLogin",
			    "newAccount":       "showNewAccount",
			    "recoverPassword":  "showRecoverPassword",
			    "login":                 "showLogin",
			  },

			  
			  
			  showLogin: function() {
			     new LoginView({el: container});
			  },
			  showNewAccount: function() {
				  new NewAccountView({el: container});
			  },
			  showRecoverPassword: function() {
				  alert("No disponible");
				  //new RecoverPasswordView({el: container});
			  }

			});

			Backbone.emulateHTTP = true;
			new Controller();
			Backbone.history.start();
	}
	
});
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
var NewAccountView = Backbone.View.extend({

	csrfToken: null,
	
	events:{
		"click #createAccount-btn": "createAccount",
		"click .close": "closeNotice"
	},
	
	
	closeNotice: function(e){
		$(e.target).parent().hide();
	},
	
	initialize: function() {
		this.render();
	},
	
	render: function(){
		$(this.el).html(template.loginApp.newAccount());
	},
	
	createAccount: function(){
		//Check if passwords match
		var pass, rpass,email;
		var error = false;
		var html = $(this.el);
		
		html.find(".alert").hide();
		
		pass = $.trim(html.find("#password").val());
		rpass = $.trim(html.find("#rpassword").val());
		name = $.trim(html.find("#name").val());
		email = $.trim(html.find("#email").val());
		
		day = html.find("#day").val();
		month = html.find("#month").val();
		year = html.find("#year").val();
		
		
		if(pass.length == 0){
			html.find("#password").focus();
		}else{
		
			if(pass != rpass){
				html.find("#passError").show();
				error = true;
			}
			
			if(name.length == 0){
				html.find("#nameError").show();
				error = true;
			}
			
			if(email.length == 0){
				html.find("#emailError").show();
				error = true;
			}
			
			if(isNaN(day) || isNaN(month) || isNaN(year)){
				html.find("#dateError").show();
				error = true;
			}
			
			
			if(error == false){
				html.find("#allOk").show();
				var user = new UserRegistration();
				//fos_user_registration_form_email">Email:</label><input type="email" id="fos_user_registration_form_email" name="fos_user_registration_form[email]" required="required" value="" /></div><div><label for="fos_user_registration_form_plainPassword_first">Contraseña:</label><input type="password" id="fos_user_registration_form_plainPassword_first" name="fos_user_registration_form[plainPassword][first]" required="required" value="" /></div><div><label for="fos_user_registration_form_plainPassword_second">Verificación:</label><input type="password" id="fos_user_registration_form_plainPassword_second" name="fos_user_registration_form[plainPassword][second]" required="required" value="" />
				
				user.set({
					email: email,
					password: pass,
					name: name,
					birthday: {day: day, month: month, year: year}
				});
				
				user.save(null,{success: function(model,response){
					html.find(".alert").hide();
					if(response.error){
						html.find("#exist").show();
					}else{
						html.find("#finished").show();
					}
	    		},
	    		error: function(){
	    			alert("Ha sucedido un error");
	    		}});
				
				
			}
		}
	}
});
var UserAuthentication = Backbone.Model.extend({
	url:"/login"
});
var UserRegistration = Backbone.Model.extend({
	"url":"/account/new"

});