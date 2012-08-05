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