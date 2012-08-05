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