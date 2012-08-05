// This file was automatically generated from agendaSectionView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.section == 'undefined') { template.section = {}; }


template.section.agenda = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="sidebar"><div class="well"><div align="center"><input type="text" placeholder="Search..." class="span3"></div><br><br><h5>Show</h5><ul class="inputs-list"><li><label><input type="checkbox" value="option1" name="optionsCheckboxes"><span style="margin-left: 4px">Meetings</span></label></li><li><label><input type="checkbox" value="option2" name="optionsCheckboxes"><span style="margin-left: 4px">Tasks</span></label></li><li><label><input type="checkbox" value="option2" name="optionsCheckboxes"><span style="margin-left: 4px">Birthdays</span></label></li><li><label class="disabled"><input type="checkbox" value="option2" name="optionsCheckboxes"><span style="margin-left: 4px">Other</span></label></li></ul><br><br><button class="btn primary">New task</button></div></div><div class="content-big"><div id="calendar" /></div></div>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from agendaView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.agendaView == 'undefined') { template.agendaView = {}; }


template.agendaView.nearbyTask = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li><span class="label ', soy.$$escapeHtml(opt_data.type), '"><a href="#', soy.$$escapeHtml(opt_data.endUrl), '">', soy.$$escapeHtml(opt_data.text), '</a></span> ', soy.$$escapeHtml(opt_data.date), '</li>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from appView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.appView == 'undefined') { template.appView = {}; }


template.appView.app = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="navbar" class="navbar navbar-fixed-top"><div class="navbar-inner"><div class="container"><ul class="nav"><li id="menu-start"><a href="#start">Start</a></li><li id="menu-profile"><a href="#profile">Profile</a></li><li id="menu-search"><a href="#search">Search</a></li><li id="menu-multimedia"><a href="#multimedia">Multimedia</a></li><li id="menu-messages"><a href="#messages">Messages</a></li><li id="menu-agenda"><a href="#agenda">Agenda</a></li><li id="menu-settings"><a href="#preferences">Preferences</a></li></ul><form class="navbar-search pull-left" id="quick-search-form"><input type="text" class="search-query" id="quick-search-input" placeholder="Quick search"><span id="uploadBut-cont"></span></form><ul class="nav" id="chat-dropdown"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">Chat<b class="caret"></b></a><ul class="dropdown-menu"><li><a href="javascript:void(0)">Disconnected</a></li></ul></li></ul></div></div></div><div id="content"></div>');
  return opt_sb ? '' : output.toString();
};


template.appView.multimenu = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<div id="original"></div>');
  var subsectionList71 = opt_data.subsections;
  var subsectionListLen71 = subsectionList71.length;
  for (var subsectionIndex71 = 0; subsectionIndex71 < subsectionListLen71; subsectionIndex71++) {
    var subsectionData71 = subsectionList71[subsectionIndex71];
    output.append('<div style="display:none" id="', soy.$$escapeHtml(subsectionData71.subSectionId), '" class="submenu"><button style="margin-left:11px" class="btn span btn-', soy.$$escapeHtml(subsectionData71.buttonClass), ' back-but">Back</button><br><br><div class="subSection-content"></div></div>');
  }
  return opt_sb ? '' : output.toString();
};


template.appView.alert = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="alert alert-info"><button class="close closeAllowed">&times;</button>', soy.$$escapeHtml(opt_data.text), '</div>');
  return opt_sb ? '' : output.toString();
};


template.appView.uploadEntry = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<tr><td>', soy.$$escapeHtml(opt_data.filename), '</td><td>', soy.$$escapeHtml(opt_data.size), '</td></tr>');
  return opt_sb ? '' : output.toString();
};


template.appView.uploadPhoto2 = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="modal-header"><h3>Upload photos</h3></div><div class="modal-body" align="center"><h4>Save photos in the album</h4><select id="albumDes" name="mediumSelect" class="medium">');
  var albumList99 = opt_data.albumList;
  var albumListLen99 = albumList99.length;
  for (var albumIndex99 = 0; albumIndex99 < albumListLen99; albumIndex99++) {
    var albumData99 = albumList99[albumIndex99];
    output.append('<option value="', soy.$$escapeHtml(albumData99.id), '">', soy.$$escapeHtml(albumData99.name), '</option>');
  }
  output.append('</select><h4>Select your photos</h4><div>You can select multiple files</div><form id="photoForm" enctype="multipart/form-data" method="post" action="/upload"><input type="file" id="files" multiple="multiple"/><div id="fileInfo" style="display:none; overflow: auto; max-height:400px"><table class="bordered-table zebra-striped"><thead><tr><th>Filename</th><th>Size</th></tr></thead><tbody></tbody></table></div></form></div><div class="modal-footer"><button class="btn upload btn-secondary secondary disabled">Upload</button><button class="btn cancel btn-primary primary">Cancel</button></div>');
  return opt_sb ? '' : output.toString();
};


template.appView.uploadDialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="modal fade" id="uploadDialog"><div class="modal-header"><h3>Photo upload</h3></div><div class="modal-body" align="center"><h4>Save photos in the album</h4><select id="albumList" name="mediumSelect" class="medium"></select><div><a href="javascript:void(0)" id="newAlbumA">Or in a new album</a></div><div style="display:none" id="newAlbumCont"><input type="text" id="albumName-txt" placeholder="Album name" class="span"><button id="createAlbum-but" class="btn btn-small">Create</button></div><br><h4>Select your photos</h4><div>You can select multiple files</div><form id="photoForm" enctype="multipart/form-data" method="post" action="/upload"><input type="file" id="files" multiple="multiple"/><div id="fileInfo" style="display:none; overflow: auto; max-height:400px"><table class="bordered-table zebra-striped"><thead><tr><th>Filename</th><th>Size</th></tr></thead><tbody></tbody></table></div></form></div><div class="modal-footer"><button class="btn" class="close" data-dismiss="modal">Cancel</button><a href="#" class="btn btn-primary disabled upload">Upload</a></div></div>');
  return opt_sb ? '' : output.toString();
};


template.appView.uploadResume = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"><button id="resume-but" class="btn" data-toggle="toggle" >Check uploaded photos</button><a href="javascript:void(0)" class="close">×</a></h3><div style="display:none" class="popover-content"><p><ul class="nav-list nav"></ul></p></div></div>');
  return opt_sb ? '' : output.toString();
};


template.appView.resumeEntry = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a href="#photo/', soy.$$escapeHtml(opt_data.id), '"><img alt="" src="/photo/thumbnail/', soy.$$escapeHtml(opt_data.id), '" class="thumbnail"></a>');
  return opt_sb ? '' : output.toString();
};


template.appView.uploader = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<button id="uploadPhotos-but" style="margin-left:15px; margin-top:0px" class="btn btn-success btn-small">Upload photos</button><span id="uploading-lbl" class="alert alert-info" style="padding:10px; display:none">Uploading <span id="totalPercent"></span>%</span><span id="uploaded-lbl" class="alert alert-success" style="padding:10px; display:none"><strong><a href="#multimedia" id="albumLink">See photos</a></strong> </span></span></button>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from commentView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.commentView == 'undefined') { template.commentView = {}; }


template.commentView.commentList = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="well"><textarea class="span9" id="comment-text"></textarea><button class="btn btn-success" id="comment-send">Comment</button></div><ul id="comment-list" class="nav nav-list"></ul><div class="pagination" style="width:205px"><span id="page-number"></span><ul><li class="prev disabled"><a href="javascript:void(0)" id="previousPage-btn">← Previous</a></li><li class="next disabled"><a href="javascript:void(0)" id="nextPage-btn">Next page →</a></li></ul></div>');
  return opt_sb ? '' : output.toString();
};


template.commentView.comment = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div><a href="#">', soy.$$escapeHtml(opt_data.authorName), '</a> - ', soy.$$escapeHtml(opt_data.date), '</div><div>', soy.$$escapeHtml(opt_data.body), '</div><hr>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from contactSuggestionView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.contactSuggestionView == 'undefined') { template.contactSuggestionView = {}; }


template.contactSuggestionView.contactSuggestion = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<br><div><div style="float:left"><a href="#profile/<%= id %>"><img alt="" src="', soy.$$escapeHtml(opt_data.thumbnail), '" class="thumbnail"></a></div><div style="margin-left: 52px"><div><a href="#profile/', soy.$$escapeHtml(opt_data.id), '">', soy.$$escapeHtml(opt_data.name), '</a></div><div style="font-size:10px"><button class="btn add" style="padding:3px 6px; font-size:10px">Invite</button>&nbsp;&nbsp;<a href="javascript:void(0)" class="reject">Omit</a></div></div></div>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from login.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.loginApp == 'undefined') { template.loginApp = {}; }


template.loginApp.login = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table style="width:150px; padding: 5px;" class="well table table-bordered"><tbody><tr><td colspan="2"><div align="center"><b>Access to my account</b></div></td></tr><tr><td>Username</td><td><input type="text" id="usernameLogin"></td></tr><tr><td>Password</td><td><input type="password" id="passwordLogin"></td></tr><tr><td colspan="2"><div align="center" class="alert block-message alert-error error" style="display:none"><a href="javascript:void(0)" class="close">×</a>The data entered are incorrect</div><div align="center"><button class="btn btn-success" id="login-btn">Login</button></div></td></tr></tbody></table><a href="#newAccount" id="newAccount-btn"><span class="label label-warning">New account</span></a>&nbsp;&nbsp;<a href="#recoverPassword" id="recoverPassword-btn"><span class="label label-important">Recover password</span></a><br><br><div class="alert alert-info"><div><h3>Last changes</h3></div><div><strong>Wixet core</strong>: <span id="coreDesc"> </span> at <span id="coreDate"> </span></div><div><strong>User interface</strong>: <span id="uiDesc"> </span> at <span id="uiDate"> </span></div></div>');
  return opt_sb ? '' : output.toString();
};


template.loginApp.newAccount = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table style="width:150px" class="well table table-bordered"><tbody><tr><td colspan="2"><div align="center"><b>Please complete the form</b></div></td></tr><tr><td>Name</td><td><input type="text" id="name"></td></tr><tr><td>Email</td><td><input type="text" id="email"></td></tr><tr><td>Password</td><td><input type="password" id="password"></td></tr><tr><td>Repeat password</td><td><input type="password" id="rpassword"></td></tr><tr><td>Birthdate</td><td><select id="day" class="tinySelect"><option>Day</option>');
  for (var i261 = 1; i261 < 32; i261++) {
    output.append('<option value="', soy.$$escapeHtml(i261), '">', soy.$$escapeHtml(i261), '</option>');
  }
  output.append('</select><select id="month" name="tinySelect" class="tinySelect"><option>Month</option><option value="1">Jaunary</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select><select id="year" name="tinySelect" class="tinySelect"><option>Year</option>');
  for (var year304 = -2010; year304 < -1900; year304++) {
    output.append('<option>', soy.$$escapeHtml(-year304), '</option>');
  }
  output.append('</select></td></tr><tr><td colspan="2"><div id="nameError" style="display:none" align="center" class="alert block-message alert-error"><a href="javascript:void(0)" class="close">×</a>Please write your name</div><div id="passError" style="display:none" align="center" class="alert block-message alert-error"><a href="javascript:void(0)" class="close">×</a>The passwords does not match</div><div id="dateError" style="display:none" align="center" class="alert block-message alert-error"><a href="javascript:void(0)" class="close">×</a>Please select your birthdate</div><div id="emailError" style="display:none" align="center" class="alert block-message alert-error"><a href="javascript:void(0)" class="close">×</a>Please write a valid email address</div><div id="allOk" style="display:none" align="center" class="alert block-message">Creating account...</div><div id="exist" style="display:none" align="center" class="alert block-message alert-error">Sorry but this email is already registered. Please choose other email address</div><div id="finished" style="display:none" align="center" class="alert block-message alert-success">Account created, now you can log in using your account</div></td></tr><tr><td colspan="2"><div align="center"><button class="btn btn-primary" id="createAccount-btn">Create account</button></div></td></tr></tbody></table><a href="#login" id="goLogin-btn"><span class="label label-success">Login</span></a>&nbsp;&nbsp;<a href="#recoverPassword" id="recoverPassword-btn"><span class="label label-important">Recover password</span></a>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from meeting.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.meetingView == 'undefined') { template.meetingView = {}; }


template.meetingView.meeting = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li><a href="#', soy.$$escapeHtml(opt_data.endUrl), '">', soy.$$escapeHtml(opt_data.text), '</a></li>');
  return opt_sb ? '' : output.toString();
};


template.meetingView.doMeeting = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<h3>Main information</h3><table class="table table-bordered"><tbody id="meetingInformation"><tr><td>Title</td><td><input type="text" id="title" class="xlarge"/></td></tr><tr><td>Date</td><td><input type="text" id="date" class="xlarge" /></td></tr><tr><td>Description</td><td><textarea id="description" class="xlarge" ></textarea></td></tr><tbody></table><button class="btn" id="addField-but">Add field</button><div id="invitePeople-form"></div><br><br></div><button class="btn btn-success" id="create-but">Create meeting</button></div>');
  return opt_sb ? '' : output.toString();
};


template.meetingView.doMeetingRow = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<td>', soy.$$escapeHtml(opt_data.text), '</td><td><input type="text" class="xlarge"/><a href="javascript:void(0)" class="close">×</a></td>');
  return opt_sb ? '' : output.toString();
};


template.meetingView.invitedPeopleList = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<h3 style="margin-top:17px">Participants</h3><div>Invite people to your meeting</div><br><div><span class="span7"><input id="invitedName-txt" type="text" placeholder="Name of the person or group"></span></div><br><br><div style="max-height: 300px; overflow:auto"><ul id="invited-people"></ul></div>');
  return opt_sb ? '' : output.toString();
};


template.meetingView.doMeetingAddField = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="modal hide fade" style="display: none;"><div class="modal-header"><a class="close" href="#">×</a><h3>New field</h3></div><div class="modal-body">Field name:&nbsp;&nbsp;<input type="text"></div><div class="modal-footer"><button class="btn btn-secondary secondary">Cancel</button><button class="btn btn-primary primary">Accept</button></div></div>');
  return opt_sb ? '' : output.toString();
};


template.meetingView.invitedPeopleEntryExternal = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a href="javascript:void(0)" class="close">×</a></td><div class="row"><div class="span3">', soy.$$escapeHtml(opt_data.name), '</div><div class="span5">Email: <input type="text" class="email"/></div></div>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from messagesSectionView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.section == 'undefined') { template.section = {}; }


template.section.messages = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="row-fluid"><div class="span3"><div class="well"><h5>Folders</h5><div id="folderList"></div><br><br><div id="newButton-cont"></div><br><br><div id="newFolder-cont"></div></div></div><div class="span9"><div id="multimenu" class="content-big"></div></div></div>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from messagesView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.messagesView == 'undefined') { template.messagesView = {}; }


template.messagesView.messageList = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t\t\t<div><h3 id="folderName">', soy.$$escapeHtml(opt_data.folder), '</h3></div><div align="right" class="breadcrumb"><div style="float:left; margin-top:20px; margin-left:20px">Check <a id="check-all" href="javascript:void(0)">All</a> <a id="check-none" href="javascript:void(0)">None</a>&nbsp;&nbsp;&nbsp;<button class="btn btn-error btn-small disabled" id="remove-btn">Remove checked</button>&nbsp;&nbsp;&nbsp;<button class="btn btn-info btn-small disabled" id="move-btn">Move checked</button>&nbsp;&nbsp;&nbsp;<span id="optButCont"></span></div><div style="width:200px;float:right;">Page <span id="start-page"></span> of <span id="last-page"></span></div><div class="pagination" style="width:205px"><ul><li class="prev disabled"><a href="javascript:void(0)" id="previousPage-btn">← Previous</a></li><li class="next disabled"><a href="javascript:void(0)" id="nextPage-btn">Next page →</a></li></ul></div></div><div id="message-list"><table class="table table-bordered table-striped"><tbody id="message-table"></tboby></table></div>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.message = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<td><div style="cursor:pointer;cursor:hand" id="message" class="row-fluid"><span class="span"><input type="checkbox" class="ckbox"></span><span class="span3">', (opt_data.isRead) ? soy.$$escapeHtml(opt_data.author.firstName) + ' ' + soy.$$escapeHtml(opt_data.author.lastName) : '<strong>' + soy.$$escapeHtml(opt_data.author.firstName) + ' ' + soy.$$escapeHtml(opt_data.author.lastName) + '</strong>', '</span><span class="span5">', (opt_data.isRead) ? soy.$$escapeHtml(opt_data.subject) : '<strong>' + soy.$$escapeHtml(opt_data.subject) + '</strong>', '</span><span style="text-align:right" class="span3">', soy.$$escapeHtml(opt_data.date), '</span></div><div style="display:none; clear: left" id="conversation"></div></td>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.conversation = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div><textarea id="body" class="span9" style="height: 50px"></textarea><br><br><button class="btn btn-primary" id="send-but">Send</button><br><br></div><table width="100%" class="table table-bordered table-striped" style="border:0"><tbody id="message-list"></table>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.conversationEntry = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<td><div><a href="#">', soy.$$escapeHtml(opt_data.author.firstName), ' ', soy.$$escapeHtml(opt_data.author.lastName), '</a> - ', soy.$$escapeHtml(opt_data.date), '</div><div>', soy.$$escapeHtml(opt_data.body), '</div></td>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.newMessage = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<br><br>', (opt_data.to == null) ? '<h3>New message</h3>' : '', '<div class="block-message alert-success" id="sentSuccess" style="display:none"><a href="javascript:void(0)" id="success-close" class="close">×</a><p>Message succesfully sent</p></div><table class="table table-bordered"><tbody><tr>', (opt_data.to == null) ? '<td>Send to</td><td><input value="" type="hidden" id="to" class="xlarge"/><div id="toText"></div><input type="text" id="toList" class="xlarge"/></td>' : '<td>Send to</td><td>' + soy.$$escapeHtml(opt_data.to.name) + '<input value="' + soy.$$escapeHtml(opt_data.to.id) + '" type="hidden" id="to" class="xlarge"/></td>', '</tr><tr><td>Subject</td><td><input type="text" class="xlarge" id="subject"/></td></tr><tr><td>Body</td><td><textarea class="xlarge" id="body"></textarea></td></tr><tbody></table><div class="row-fluid"><div class="span2"><button class="btn" id="attachFile-btn">Attach file</button></div><div class="span2"><button class="btn btn-primary ', (opt_data.to == null) ? 'disabled' : '', '" id="sendMessage-btn">Send</button></div></div>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.folderOptions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<br><br><h3>Options</h3><table class="table table-bordered"><tbody><tr><td>Folder name</td><td><input value="', soy.$$escapeHtml(opt_data.name), '" type="text" id="folderName-input" class="xlarge"/></td></tr><tbody></table><div class="row-fluid"><div class="span2"><button class="btn" id="save-folder-btn">Save changes</button></div><div class="span2"><button id="remove-folder-btn" class="btn btn-danger">Remove folder</button></div></div>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.newFolder = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<br><br><h3>New folder</h3><table class="table table-bordered"><tbody><tr><td>Folder name</td><td><input type="text" id="folderName-input" class="xlarge"/></td></tr><tbody></table><div class="row show-grid"><div class="span"><button class="btn btn-primary" id="save-folder-btn">Create</button></div></div>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.removeFolderAsk = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="modal hide fade" style="display: none;"><div class="modal-header"><h3>Remove folder</h3></div><div class="modal-body">Are you really sure you want to delete the folder ', soy.$$escapeHtml(opt_data.folder), '?</div><div class="modal-footer"><button class="btn remove btn-danger">Remove</button><button class="btn cancel btn-primary">Cancel</button></div></div>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.messageFolder = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<label><span style="margin-left: 4px"><a href="javascript:void(0)" class="load">', soy.$$escapeHtml(opt_data.name), '</a></span></label>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.newMessageButton = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<button id="new-message-btn" class="btn btn-success">New message</button>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.folderOptionsButton = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<button class="btn btn-primary btn-small" id="options-btn">Options</button>');
  return opt_sb ? '' : output.toString();
};


template.messagesView.newFolderButton = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<button id="new-folder-btn" class="btn btn-info">New folder</button>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from multimediaSectionView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.section == 'undefined') { template.section = {}; }


template.section.multimedia = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="row-fluid"><div class="span3"><div class="well" style="padding: 8px 0;"><br><br><br><br><div id="newFolder-cont"></div></div></div><div class="span9"><div id="multimenu" class="content-big"></div></div></div>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from multimediaView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.multimediaView == 'undefined') { template.multimediaView = {}; }


template.multimediaView.photoList = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t\t\t<div><h3 id="folderName">', soy.$$escapeHtml(opt_data.folder), '</h3></div><div align="right" class="breadcrumb">', (opt_data.owner == true) ? '<div style="float:left; margin-top:20px; margin-left:20px">Check <a id="check-all" href="javascript:void(0)">All</a> <a id="check-none" href="javascript:void(0)">None</a>&nbsp;&nbsp;&nbsp;<button class="btn btn-danger btn-small disabled" id="remove-btn">Remove checked</button>&nbsp;&nbsp;&nbsp;<button class="btn btn-info btn-small disabled" id="move-btn">Move checked</button>&nbsp;&nbsp;&nbsp;<span id="optButCont"></span></div>' : '', '<div style="width:200px;float:right;">Page <span id="start-page"></span> of <span id="last-page"></span></div><div class="pagination" style="width:205px"><ul><li class="prev disabled"><a href="javascript:void(0)" id="previousPage-btn">← Previous</a></li><li class="next disabled"><a href="javascript:void(0)" id="nextPage-btn">Next page →</a></li></ul></div></div><div><ul class="thumbnails" id="photo-list"></ul></div>');
  return opt_sb ? '' : output.toString();
};


template.multimediaView.photo = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a class="thumbnail" href="#photo/', soy.$$escapeHtml(opt_data.id), '"><img alt="" src="/photo/thumbnail/', soy.$$escapeHtml(opt_data.id), '"></a><span class="span" style="margin-left:0px;">', (opt_data.isOwner == true) ? '<input type="checkbox" class="ckbox"></span>' : '');
  return opt_sb ? '' : output.toString();
};


template.multimediaView.albumOptions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<h3>Options</h3><table><tbody><tr><td>Album name</td><td><input value="', soy.$$escapeHtml(opt_data.name), '" type="text" id="folderName-input" class="xlarge"/></td></tr><tbody></table><div class="row-fluid"><div class="span2"><button class="btn" id="save-folder-btn">Save changes</button></div><div class="span2"><button id="remove-folder-btn" class="btn btn-danger">Remove album</button></div></div>');
  return opt_sb ? '' : output.toString();
};


template.multimediaView.newAlbum = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<h3>New album</h3><table><tbody><tr><td>Album name</td><td><input type="text" id="folderName-input" class="xlarge"/></td></tr><tbody></table><div class="row show-grid"><div class="span"><button class="btn btn-primary primary" id="save-folder-btn">Create</button></div></div>');
  return opt_sb ? '' : output.toString();
};


template.multimediaView.removeAlbumAsk = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="modal hide fade" style="display: none;"><div class="modal-header"><h3>Remove album</h3></div><div class="modal-body">Are you really sure you want to delete the album ', soy.$$escapeHtml(opt_data.folder), '?</div><div class="modal-footer"><button class="btn remove btn-danger">Remove</button><button class="btn cancel btn-primary">Cancel</button></div></div>');
  return opt_sb ? '' : output.toString();
};


template.multimediaView.album = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a href="javascript:void(0)" class="load">', soy.$$escapeHtml(opt_data.name), '</a>');
  return opt_sb ? '' : output.toString();
};


template.multimediaView.newMessageButton = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<button id="new-message-btn" class="btn btn-success">New message</button>');
  return opt_sb ? '' : output.toString();
};


template.multimediaView.albumOptionsButton = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<button class="btn btn-primary primary btn-small" id="options-btn">Options</button>');
  return opt_sb ? '' : output.toString();
};


template.multimediaView.newAlbumButton = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<button style="margin-left:10px" id="new-folder-btn" class="btn btn-info">New album</button>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from newnessView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.newnessView == 'undefined') { template.newnessView = {}; }


template.newnessView.newness = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div style="min-height: 48px"><div style="float:left; position:relative"><a href="#as"><img alt="" src="photo/profile/', soy.$$escapeHtml(opt_data.authorId), '" class="thumbnail"></a></div>', (opt_data.owner) ? '<div id="newnessOptions" style="float:right; display:none"><a href="javascript:void(0)" id="updateOptions" class="icon-list-alt" rel="tooltip" title="Options"></a>&nbsp;<a href="javascript:void(0)" id="updateRemove" class="icon-remove" rel="tooltip" title="Remove"></a></div>' : '', '<div style="margin-left:60px"><div><a href="#">', soy.$$escapeHtml(opt_data.authorName), '</a> - ', soy.$$escapeHtml(opt_data.date), '</div><div>', soy.$$escapeHtml(opt_data.body), '</div><div style="padding:10px"><a href="javascript:void(0)" id="doComment">Comment</a><span id="likeForm" ', (opt_data.likeit > 0 || opt_data.dlikeit > 0) ? 'style="display: none"' : '', '>- <a href="javascript:void(0)" id="like">I like it</a> - <a href="javascript:void(0)" id="dlike">I don\'t like it</a></span></div><div><div id="likeit" class="alert alert-success" ', (opt_data.likeit == 0 || opt_data.likeit == null) ? 'style="display: none"' : '', '><button id="cancelLike"  data-dismiss="alert" class="close" type="button">×</button>I like it</div><div id="dlikeit" class="alert alert-error"  ', (opt_data.dlikeit == 0 || opt_data.likeit == null) ? 'style="display: none"' : '', '><button id="cancelDlike" data-dismiss="alert" class="close" type="button">×</button>I don\'t like it</div><div id="totalLikes" ', (opt_data.likes == 0 || opt_data.likes == null) ? 'style="display:none"' : '', '><span>', (opt_data.likes == null) ? '0' : soy.$$escapeHtml(opt_data.likes), '</span> people like this</div><div id="totalDlikes" ', (opt_data.dlikes == 0 || opt_data.dlikes == null) ? 'style="display:none"' : '', '><span>', (opt_data.dlikes == null) ? '0' : soy.$$escapeHtml(opt_data.dlikes), '</span> people don\'t like this</div></div><input style="display: none;" type="text" id="comment" class="span10" placeholder="Write your comment and push enter"><table style="margin-left:10px" width="100%" style="border:0" class="table table-striped"><tbody id="comments"></tbody></table></div></div><hr>');
  return opt_sb ? '' : output.toString();
};


template.newnessView.newnessComment = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<td>', (opt_data.owner) ? '<div id="newnessCommentOptions" style="float:right; display:none"><a href="javascript:void(0)" id="commentRemove" class="icon-remove" rel="tooltip" title="Remove"></a></div>' : '', '<div><a href="#">', soy.$$escapeHtml(opt_data.authorName), '</a> - ', soy.$$escapeHtml(opt_data.date), '</div><div>', soy.$$escapeHtml(opt_data.body), '</div></td>');
  return opt_sb ? '' : output.toString();
};


template.newnessView.newnessList = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="well span12" id="update">', (opt_data.isOwner == true) ? '<h3>Share something</h3>' : '<h3>Share something with ' + soy.$$escapeHtml(opt_data.name) + '</h3>', '<br><div id="fakeContent"><input class="span12" type="text" /></div><div id="content" style="display:none"><button class="close" id="closeUpdate" style="margin-top: -25px;">&times;</button><textarea class="span12" rows="10" cols="20" id="new-share"></textarea><table class="table table-bordered table-striped"><tbody><tr><td><div id="addLinkForm" style="display:none; float:left" class="span7"><input type="text" placeholder="Write here your link" class="span"> <button class="btn btn-success">Add</button></div><span style="float:right"><a class="updateAction" href="javascript:void(0)" id="addPhoto" style="padding:5px"><img src="img/glyphicons/png/glyphicons_011_camera.png"></a><a class="updateAction" href="javascript:void(0)" id="addVideo" style="padding:5px"><img src="img/glyphicons/png/glyphicons_008_film.png"></a><a class="updateAction" href="javascript:void(0)" id="addMusic" style="padding:5px"><img src="img/glyphicons/png/glyphicons_017_music.png"></a><a class="updateAction" href="javascript:void(0)" id="addLink" style="padding:5px"><img src="img/glyphicons/png/glyphicons_050_link.png"></a><a class="updateAction" href="javascript:void(0)" id="addEvent" style="padding:5px"><img src="img/glyphicons/png/glyphicons_045_calendar.png"></a></span></td></tr><tr><td><p>Can view this update</p><input type="text" class="span7" id="allowedToInput"><div class="row-fluid" id="allowedToUpdates"></div></td></tr></tbody></table><button class="btn btn-success" style="float:right" id="shareUpdate">Share</button></div></div><div id="newness-container"></div><button class="btn span12" style="margin-left:10px" id="more-newness">More</button>');
  return opt_sb ? '' : output.toString();
};


template.newnessView.newnessList2 = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="hero-unit" style="padding: 20px 40px 40px">', (opt_data.isOwner == true) ? '<h3>Share something</h3>' : '<h3>Share something with ' + soy.$$escapeHtml(opt_data.name) + '</h3>', '<div class="span5" id="update"><div id="fakeContent"><input class="span7" type="text" /></div></div><div id="content" style="display:none"><button class="close" id="closeUpdate" style="margin-top: -20px; margin-right: -15px;">&times;</button><textarea class="span5" rows="10" cols="20"></textarea><table class="table table-bordered table-striped"><tbody><tr><td><div id="addLinkForm" style="display:none; float:left"><input type="text" placeholder="Write here your link"> <button class="btn btn-success" class="span4">Add</button></div><span style="float:right"><a class="updateAction" href="javascript:void(0)" id="addPhoto"><img src="img/glyphicons/png/glyphicons_011_camera.png"></a><a class="updateAction" href="javascript:void(0)" id="addVideo"><img src="img/glyphicons/png/glyphicons_008_film.png"></a><a class="updateAction" href="javascript:void(0)" id="addMusic"><img src="img/glyphicons/png/glyphicons_017_music.png"></a><a class="updateAction" href="javascript:void(0)" id="addLink"><img src="img/glyphicons/png/glyphicons_050_link.png"></a><a class="updateAction" href="javascript:void(0)" id="addEvent"><img src="img/glyphicons/png/glyphicons_045_calendar.png"></a></span></td></tr><tr><td><p>Permitir acceso a</p><input type="text" class="span7"><div class="row-fluid"><div class="span3"><div class="alert alert-info"><button class="close closeAllowed">&times;</button>Amigos</div></div></div></td></tr></tbody></table></div></div><div id="newness-container"></div><button class="btn span6" style="margin-left:10px" id="more-newness">More</button>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from notificationView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.notificationView == 'undefined') { template.notificationView = {}; }


template.notificationView.notification = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t');
  switch (opt_data.type) {
    case 'Wixet\\WixetBundle\\Entity\\PrivateMessage':
      output.append('<a href="#messages">', soy.$$escapeHtml(opt_data.total), ' Private messages</a>');
      break;
    default:
      output.append('<a href="#">', soy.$$escapeHtml(opt_data.total), ' ', soy.$$escapeHtml(opt_data.type), '</a>');
  }
  return opt_sb ? '' : output.toString();
};


template.notificationView.list = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<h5>Notifications</h5><ul id="notificationList"></ul>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from permissionTemplates.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.permission == 'undefined') { template.permission = {}; }


template.permission.simple = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<br><br><h3>Permissions</h3><table class="table table-striped table-bordered table-condensed"><thead><tr><th></th><th>Entity</th><th>Read Granted</th><th>Read Denied</th><th>Write Granted</th><th>Write Denied</th><th></th><th></th></tr></thead><tbody id="permissionsBody"><tr><td></td><td>New permission for<br><input placeholder="Group or person name" id="newPermissionEntity" type="text" class="span"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>');
  return opt_sb ? '' : output.toString();
};


template.permission.simpleEntry = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<td>', (opt_data.type == 'group') ? '<img class="thumbnail" src="/img/glyphicons_043_group.png">' : '<img class="thumbnail" src="/img/glyphicons_003_user.png">', '</td><td>', soy.$$escapeHtml(opt_data.name), '</td><td><input type="checkbox" class="perm rg" ', (opt_data.read_granted == 1) ? 'checked="checked"' : '', '></td><td><input type="checkbox" class="perm rd" ', (opt_data.read_denied == 1) ? 'checked="checked"' : '', '></td><td><input type="checkbox" class="perm wg" ', (opt_data.write_granted == 1) ? 'checked="checked"' : '', '></td><td><input type="checkbox" class="perm wd" ', (opt_data.write_denied == 1) ? 'checked="checked"' : '', '></td><td><button  rel="tooltip" title="Changes saved" class="btn btn-success" id="save-btn">Save</button></td><td><button class="btn btn-danger ', (opt_data.isNew != null) ? 'disabled' : '', '" id="remove-btn">Remove</button></td>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from photoSectionView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.section == 'undefined') { template.section = {}; }


template.section.photo = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="row-fluid"><div class="span9" id="photoContainer"><ul class="breadcrumb"><li><a href="#multimedia">Albums</a> <span class="divider">/</span></li><li><a href="#multimedia/', soy.$$escapeHtml(opt_data.owner.id), '/album/', soy.$$escapeHtml(opt_data.album.id), '">', soy.$$escapeHtml(opt_data.album.name), '</a><span class="divider">/</span></li><li class="active" id="photoTitleTop" style="display:none">', (opt_data.name == null) ? soy.$$escapeHtml(opt_data.name) : '', '</li></ul><div id="carouselContainer"><div id="photo" class="carousel"><!-- Carousel items --><div class="carousel-inner"><div class="active imgtag item" align="center"><img mediaItemId="', soy.$$escapeHtml(opt_data.id), '" class="photoMain" src="/photo/normal/', soy.$$escapeHtml(opt_data.id), '" /><div class="carousel-caption" style="display: none"><p>', soy.$$escapeHtml(opt_data.description), '</p></div></div></div><!-- Carousel nav --><a class="carousel-control left" href="#photo" data-slide="prev">&lsaquo;</a><a class="carousel-control right" href="#photo" data-slide="next">&rsaquo;</a></div><div id="commentContainer"></div></div><div id="permissionContainer" style="display:none"><button class="btn btn-primary" id="backToPhoto" style="margin:10px">Back</button><table class="table table-striped table-bordered table-condensed"><thead><tr><th></th><th>Entity</th><th>Read Granted</th><th>Read Denied</th><th>Write Granted</th><th>Write Denied</th><th></th><th></th></tr></thead><tbody id="permissionsBody"><tr><td></td><td>New permission for<br><input placeholder="Group or person name" id="newPermissionEntity" type="text" class="span"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table></div></div><div class="span3"><div class="well" style="padding: 8px 0;"><ul id="tagList" class="nav nav-list"><li class="active"><a id="tagDesc" href="javascript:void(0)" rel="tooltip" title="Click the photo to add tags"><i class="icon-tags icon-white"></i> Tags</a></li></ul></div><div class="well" style="padding: 8px 0;"><ul id="tagList" class="nav nav-list"><li class="active"><a href="javascript:void(0)"><i class="icon-cog icon-white"></i> Options</a></li><li><a href="javascript:void(0)" id="setPhoto">Set as photo profile</a><div id="photoSuccess" class="alert alert-block alert-success fade in" style="display:none"><button data-dismiss="alert" class="btn close" type="button">×</button>Main photo changed</div></li><li><a href="photo/original/', soy.$$escapeHtml(opt_data.id), '">Download</a></li><li><a href="javascript:void(0)" id="managePermission">Manage permission</a></li><li><a href="javascript:void(0)" id="setTitle">Set title</a></li></ul></div></div><div class="modal fade hide" id="setTitleModal"><div class="modal-header"><h3>Set a title or description to your photo</h3></div><div class="modal-body"><p>Photo title: <input type="text" ', (opt_data.name != null) ? 'value="' + soy.$$escapeHtml(opt_data.name) + '"' : '', ' id="newTitle"></p><p>Description: <input type="text" ', (opt_data.description != null) ? 'value="' + soy.$$escapeHtml(opt_data.description) + '"' : '', ' id="newDescription"></p></div><div class="modal-footer"><a href="#" class="btn" data-dismiss="modal">Close</a><a href="#" id="saveModalChanges" class="btn btn-primary" data-dismiss="modal">Save</a></div></div></div>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from preferencesSectionView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.section == 'undefined') { template.section = {}; }


template.section.preferences = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="row-fluid"><div class="span3"><div class="well" style="padding: 8px 0;"><div id="folderList"><ul class="nav nav-list"><li class="active"><a id="personal-lnk" class="load" href="javascript:void(0)">Personal</a></li><li><a id="aboutMe-lnk" class="load" href="javascript:void(0)">About me</a></li><li><a id="favourites-lnk" class="load" href="javascript:void(0)">Favourites</a></li><li><a id="security-lnk" class="load" href="javascript:void(0)">Security</a></li><li><a id="customize-lnk" class="load" href="javascript:void(0)">Customize</a></li></ul></div></div></div><div class="span9"><div id="bodyContent" class="content-big"></div></div></div>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from preferencesView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.preferencesView == 'undefined') { template.preferencesView = {}; }


template.preferencesView.personalInformation = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t\t\t<div><h3>Personal information</h3></div><br><div><table class="table"><tr><td>First name</td><td><input type="text" id="firstName" class="span5" value="', soy.$$escapeHtml(opt_data.firstName), '"></td></tr><tr><td>Last name</td><td><input type="text" id="lastName" class="span5" value="', soy.$$escapeHtml(opt_data.lastName), '"></td></tr><!--<tr><td>Email name</td><td><input type="text" class="span5" value="', soy.$$escapeHtml(opt_data.email), '"></td></tr>--><tr><td colspan="2"><div class="alert alert-success span5" id="notif-success" style="display:none"><a href="javascript:void(0)" id="close-success" class="close">×</a><p>Your new information has been saved successfully</p></div></td></tr></table></div><div><button class="btn btn-success" id="save-but">Save changes</button></div>');
  return opt_sb ? '' : output.toString();
};


template.preferencesView.aboutMeEditEntry = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<div><table width="100%"><tr><td><input type="text" id="title" class="span7" placeholder="Title (ej. hobbies, books...)" value="', soy.$$escapeHtml(opt_data.title), '"></td></tr><tr><td><textarea type="text" id="body" class="span12" rows="12" placeholder="Description">', soy.$$escapeHtml(opt_data.body), '</textarea></td></tr><tr><td><div class="alert alert-success" id="notif-success" style="display:none"><a href="javascript:void(0)" id="close-success" class="close">×</a><p>Your new information has been saved successfully</p></div><div class="btn-toolbar"><button class="btn btn-success" id="save">Save</button><button class="btn btn-danger" id="delete">Delete</button></div></td></tr></table></div>');
  return opt_sb ? '' : output.toString();
};


template.preferencesView.aboutMe = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t\t\t<div><h3>About me</h3></div><p>Be care about what you write here, this information is public and accesible by everyone and used by the search engine</p><div id="aboutMeList"></div><div class="row-fluid"><div class="span2"><button class="btn" id="newAboutMe-but">Add new</button></div></div>');
  return opt_sb ? '' : output.toString();
};


template.preferencesView.security = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t\t\t<div><h3>Security</h3></div><div><br><div><button class="btn" id="manageGroups-btn">Manage groups</button></button></div><br><h3>Profile permissions</h3><p>Here are only shown the explicit permissions of the profile</p><table class="table table-striped table-bordered table-condensed"><thead><tr><th></th><th>Entity</th><th>Read Granted</th><th>Read Denied</th><th>Write Granted</th><th>Write Denied</th><th></th><th></th></tr></thead><tbody id="profilePermissionsBody"><tr><td></td><td>New permission for<br><input placeholder="Group or person name" id="newProfilePermissionEntity" type="text" class="span"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table><h3>Updates permissions</h3><p>This permissions will be inherited by your profile updates</p><table class="table table-striped table-bordered table-condensed"><thead><tr><th></th><th>Entity</th><th>Read Granted</th><th>Read Denied</th><th>Write Granted</th><th>Write Denied</th><th></th><th></th></tr></thead><tbody id="updatesPermissionsBody"><tr><td></td><td>New permission for<br><input placeholder="Group or person name" id="newUpdatesPermissionEntity" type="text" class="span"></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table><h3>All permissions list</h3><table  align="center" class="table table-striped table-bordered table-condensed"><thead><tr><th>Identity type</th><th>Identity name</th><th>Protected object type</th><th>Protected object id</th><th>Read Granted</th><th>Read Denied</th><th>Write Granted</th><th>Write Denied</th></tr></thead><tbody id="permissionTable"></tbody></table></div>');
  return opt_sb ? '' : output.toString();
};


template.preferencesView.groupListEntry = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<a href="javascript:void(0)" class="load">', soy.$$escapeHtml(opt_data.name), '</a><a style="display:none; margin-top:-35px" class="close" data-dismiss="alert">×</a>');
  return opt_sb ? '' : output.toString();
};


template.preferencesView.editGroup = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<div><h4>Group name<h4></div><div><input type="text" class="span4" value="', soy.$$escapeHtml(opt_data.name), '"></div><br><div><h4>Group members<h4></div><div><select id="memberList" multiple="multiple" size="15" class="span7"></select></div><div><button id="removeSelected-btn" class="btn btn-danger disabled">Remove selected from the group</button></div><br><div><h4>Add members to the group<h4></div><div>Person name: <input type="text" id="personName-txt" class="span4"></div>');
  return opt_sb ? '' : output.toString();
};


template.preferencesView.manageGroups = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t\t\t<div><h3>Manage groups</h3></div><table class="table table-bordered"><tr><td><h4>Group list</h4></td></tr><tr><td><ul id="groupList" class="nav nav-pills nav-stacked"></ul></td></tr></table><br><table><tr><td colspan="2"><h4>New group</h4></td></tr><tr><td colspan><div>Name</td><td><input type="text" class="span" id="newGroupName"></div></td></tr><tr><td colspan="2"><div><button class="btn btn-primary" id="createGroup-btn">Create</button></div></td></tr></table>');
  return opt_sb ? '' : output.toString();
};


template.preferencesView.permissionRow = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<td>', soy.$$escapeHtml(opt_data.permission.type), '</td><td>', (opt_data.permission.type == 'profile') ? soy.$$escapeHtml(opt_data.permission.firstName) + ' ' + soy.$$escapeHtml(opt_data.permission.lastName) : soy.$$escapeHtml(opt_data.permission.groupName), '<td>', soy.$$escapeHtml(opt_data.permission.objectType), '</td><td>', soy.$$escapeHtml(opt_data.permission.objectId), '</td><td><input id="readGranted" type="checkbox" ', (opt_data.permission.readGranted == 1) ? ' checked ' : '', ' ></td><td><input id="readDenied" type="checkbox" ', (opt_data.permission.readDenied == 1) ? ' checked ' : '', ' ></td><td><input id="writeGranted" type="checkbox" ', (opt_data.permission.writeGranted == 1) ? ' checked ' : '', ' ></td><td><input id="writeDenied" type="checkbox" ', (opt_data.permission.writeDenied == 1) ? ' checked ' : '', ' ></td>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from profileSectionView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.section == 'undefined') { template.section = {}; }


template.section.profile = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="row-fluid"><div class="span3"><div class="well"><div align="center" class="media-grid"><a href="#"><img alt="" src="" class="thumbnail"></a></div><div id="personalInfo-cont"></div><div id="favourites-cont"></div></div></div><div class="span6"><div class="content" id="newness"><div><h2 id="profileTitle"></h2></div><div align="center"><ul class="nav nav-pills" style="width: 400px; height:50px"><li class="active"><a id="newness-pill" href="javascript:void(0)">Newness</a></li><li><a id="aboutMe-pill" href="javascript:void(0)">About me</a></li><li><a id="sendMessage-pill" href="javascript:void(0)">Send message</a></li><li><a id="albums-pill" href="#multimedia/', soy.$$escapeHtml(opt_data.id), '">Albums</a></li></ul></div><!--newness--><div id="newness-list" class="subSection"><div id="newness-container"></div></div><!--newness end--><!--about me--><div id="aboutMe" style="display:none" class="subSection"><div id="aboutMe-container"></div></div><!--about me end--><!--send message--><div id="sendMessage" style="display:none" class="subSection"><div id="sendMessage-container"></div></div><!--send message end--><!--albumlist--><div id="albumList" style="display:none" class="subSection"><div id="albumList-container"></div></div><!--about me end--></div></div><div class="span3"><div class="well"><h5>Last photos</h5><div id="lastPhotos-cont"></div><h5>Friends</h5><div id="friends-cont"></div></div></div></div>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from profileView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.profileView == 'undefined') { template.profileView = {}; }


template.profileView.personalInformation = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<ul class="unstyled">', (opt_data.name != null) ? '<li>Name: <b>' + soy.$$escapeHtml(opt_data.name) + '</b></li>' : '', (opt_data.city != null) ? '<li>City: <b>' + soy.$$escapeHtml(opt_data.city) + '</b></li>' : '', (opt_data.age != null) ? '<li>Age: <b>' + soy.$$escapeHtml(opt_data.age) + ' years</b></li>' : '', (opt_data.gender != null) ? '<li>Gender: <b>' + soy.$$escapeHtml(opt_data.gender) + '</b></li>' : '', (opt_data.country != null) ? '<li>Country: <b>' + soy.$$escapeHtml(opt_data.country) + '</b></li>' : '', '</ul>');
  return opt_sb ? '' : output.toString();
};


template.profileView.favourites = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<h5>Favourites</h5><ul>');
  var favouriteList1204 = opt_data.favourites;
  var favouriteListLen1204 = favouriteList1204.length;
  for (var favouriteIndex1204 = 0; favouriteIndex1204 < favouriteListLen1204; favouriteIndex1204++) {
    var favouriteData1204 = favouriteList1204[favouriteIndex1204];
    output.append('<li><a href="#', soy.$$escapeHtml(favouriteData1204.url), '">', soy.$$escapeHtml(favouriteData1204.title), '</li>');
  }
  output.append('</ul>');
  return opt_sb ? '' : output.toString();
};


template.profileView.aboutMe = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var elementList1213 = opt_data.list;
  var elementListLen1213 = elementList1213.length;
  for (var elementIndex1213 = 0; elementIndex1213 < elementListLen1213; elementIndex1213++) {
    var elementData1213 = elementList1213[elementIndex1213];
    output.append('<div class="well"><h3>', soy.$$escapeHtml(elementData1213.title), '</h3></div><p>', soy.$$escapeHtml(elementData1213.body), '</p>');
  }
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from searchSectionView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.section == 'undefined') { template.section = {}; }


template.section.search = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="row-fluid"><div class="span3" style="display:none"><div class="well"><h3>Search filter</3><br><br><form class="form-horizontal"><div class="control-group"><input type="text" id="query" class="input-medium" placeholder="Person name"/></div><div class="control-group"><input type="text" id="query" class="input-medium" placeholder="City"/></div><div class="control-group"><input type="text" id="query" class="input-medium" placeholder="Place"/></div><div class="control-group"><input type="text" id="query" class="input-medium" placeholder="Interest"/></div><div class="control-group"><label class="checkbox"><input type="checkbox" value="random" id="optionsCheckbox">Interests in common</label></div></form></div></div><div class="span9" id="search-result"><form style="margin-top:10px" class="form-search" id="initSearchContainer"><div class="row-fluid"><div class="span10"><input type="text" class="span search-query" id="search-query" placeholder="What are you looking for?"></div><div class="span1"><button class="btn btn-primary" id="but-search"><i class="icon-search icon-white"></i></button></div></div></form><div id="resultContainer" style="display:none"><div>Results  for "<span id="resultsFor"></span>"</div><ul class="nav nav-tabs"><li class="active"><a href="#">All</a></li><li><a href="#">People</a></li><li><a href="#">Places</a></li><li><a href="#">Groups</a></li></ul><div id="results"><!--<div style="min-height: 48px"><div style="float:left; position:relative"><a href="#as"><img alt="" src="" class="thumbnail"></a></div><div style="margin-left:60px"><div><a href="#">Alvaro Garcia</a> <button class="btn btn-success btn-small" id="addGroup">Add to group</button> </div><div>City: Ciudad</div><div><strong>Interests</strong></div><ul><li>Cosa</li><li>Bbbb</li></ul><div><pre><div style="padding:10px">Otros</div></pre></div>--!></div><div>Page <span id="start-page"></span> of <span id="last-page"></span></div><div class="pagination" style="width:205px"><ul><li class="prev disabled"><a href="javascript:void(0)" id="previousPage-btn">← Previous</a></li><li class="next disabled"><a href="javascript:void(0)" id="nextPage-btn">Next page →</a></li></ul></div></div></div></div></div></div>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from searchView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.searchView == 'undefined') { template.searchView = {}; }


template.searchView.cityRow = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<div>Search by: ', soy.$$escapeHtml(opt_data.name), '<a class="close" href="javascript:void(0)">×</a></div>');
  return opt_sb ? '' : output.toString();
};


template.searchView.commonThingRow = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<div>', soy.$$escapeHtml(opt_data.name), '<a class="close" href="javascript:void(0)">×</a></div>');
  return opt_sb ? '' : output.toString();
};


template.searchView.friendRow = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<div>', soy.$$escapeHtml(opt_data.name), '<a class="close" href="javascript:void(0)">×</a></div>');
  return opt_sb ? '' : output.toString();
};


template.searchView.resultList = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('\t<div id="original"><div><ul class="tabs"><li class="active"><a href="#">All</a></li><li><a href="#">People</a></li><li><a href="#">Places</a></li><li><a href="#">Groups</a></li></ul></div><div id="result-container"></div><button class="btn wlarge-btn" id="more-results">More</button></div>');
  return opt_sb ? '' : output.toString();
};


template.searchView.addGroupDialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="modal fade"><div class="modal-header"><a class="close" data-dismiss="modal">×</a><h3>Please select the group</h3></div><div class="modal-body"><p align="center"><select id="groupList"></select></p></div><div class="modal-footer"><a href="javascript:void(0)" class="btn cancel">Cancel</a><a href="javascript:void(0)" class="btn add btn-primary">Add user to group</a></div></div>');
  return opt_sb ? '' : output.toString();
};


template.searchView.queryResult = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div style="min-height: 48px"><div style="float:left; position:relative"><a href="#', soy.$$escapeHtml(opt_data.type), '/', soy.$$escapeHtml(opt_data.id), '"><img alt="" src="', soy.$$escapeHtml(opt_data.thumbnail), '" class="thumbnail"></a></div><div style="margin-left:60px"><div><a href="#', soy.$$escapeHtml(opt_data.type), '/', soy.$$escapeHtml(opt_data.id), '">', soy.$$escapeHtml(opt_data.name), '</a>', (opt_data.group == null) ? '<button style="float:right" class="btn btn-success btn-small" id="addGroup">Add to group</button><div id="groupName" style="float:right; display:none" class="alert alert-info"></div>' : '<div style="float:right" class="alert alert-info">' + soy.$$escapeHtml(opt_data.group.name) + '</div>', '</div>', (opt_data.city != null) ? '<div>City: ' + soy.$$escapeHtml(opt_data.city.name) + '</div>' : '<div>&nbsp; </div>');
  if (opt_data.favourites != null) {
    output.append('<div><strong>Interests</strong></div><ul>');
    var favouriteList1338 = opt_data.favourites;
    var favouriteListLen1338 = favouriteList1338.length;
    for (var favouriteIndex1338 = 0; favouriteIndex1338 < favouriteListLen1338; favouriteIndex1338++) {
      var favouriteData1338 = favouriteList1338[favouriteIndex1338];
      output.append('<li>', soy.$$escapeHtml(favouriteData1338.name), '</li>');
    }
    output.append('</ul>');
  }
  if (opt_data.friends != null) {
    output.append('<div><strong>Friends in common</strong></div><ul>');
    var friendList1350 = opt_data.friends;
    var friendListLen1350 = friendList1350.length;
    for (var friendIndex1350 = 0; friendIndex1350 < friendListLen1350; friendIndex1350++) {
      var friendData1350 = friendList1350[friendIndex1350];
      output.append('<li>', soy.$$escapeHtml(friendData1350.name), '</li>');
    }
    output.append('</ul>');
  }
  if (opt_data.highlights.length > 0) {
    output.append('<div><pre>');
    var resList1359 = opt_data.highlights;
    var resListLen1359 = resList1359.length;
    for (var resIndex1359 = 0; resIndex1359 < resListLen1359; resIndex1359++) {
      var resData1359 = resList1359[resIndex1359];
      output.append('<div style="padding:10px"><strong>', soy.$$escapeHtml(resData1359.title), '</strong><div>', soy.$$escapeHtml(resData1359.body), '</div></div>');
    }
    output.append('</pre></div>');
  }
  output.append('</div></div><hr>');
  return opt_sb ? '' : output.toString();
};

;
// This file was automatically generated from startSectionView.soy.
// Please don't edit this file by hand.

if (typeof template == 'undefined') { var template = {}; }
if (typeof template.section == 'undefined') { template.section = {}; }


template.section.start = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="row-fluid"><div class="span3"><div class="well"><div align="center" class="media-grid"><a href="#"><img alt="" src="photo/public/', soy.$$escapeHtml(opt_data.id), '" class="thumbnail"></a></div><div id="notifications"></div><h5>Agenda</h5><ul class="agenda-short-list" id="agendaTask-list"></ul></div></div><div class="span6"><div class="content" id="multimenu"></div></div><div class="span3"><div class="well"><h5>Suggestions</h5><div id="contact-suggestion"></div><br><h5>Meetings</h5><div>Start a new meeting to organize an event</div><br><div id="meetings"><div><button class="btn btn-success" id="doMeeting-but">Create meeting</button></div><br><ul id="meeting-list"></ul><div><button id="allMeetings-but" class="btn btn-info small disabled">All</button></div></div><br><h5>Find friends</h5><div>Send invitations to your friends or search them in other social networks</div><br><div><button class="btn btn-danger disabled">Send invitations</button></div><br><div><button class="btn btn-primary disabled">Search in other networks</button></div><br></div></div>');
  return opt_sb ? '' : output.toString();
};


template.section.start_old = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="row-fluid"><div class="span2"><div class="well"><div class="media-grid"><a href="#"><img alt="" src="', soy.$$escapeHtml(opt_data.thumbnail), '" class="thumbnail"></a></div><h5>Notifications</h5><ul id="notification"></ul><h5>Agenda</h5><ul class="agenda-short-list" id="agendaTask-list"></ul></div></div></div><div class="row-fluid"><div class="span2"><div class="well"><h5>Suggestions</h5><div id="contact-suggestion"></div><br><h5>Meetings</h5><div>Start a new meeting to organize an event</div><br><div id="meetings"><div><button class="btn success" id="doMeeting-but">Create meeting</button></div><br><ul id="meeting-list"></ul><div><button id="allMeetings-but" class="btn info small">All</button></div></div><br><h5>Find friends</h5><div>Send invitations to your friends or search them in other social networks</div><br><div><button class="btn danger">Send invitations</button></div><br><div><button class="btn primary">Search in other networks</button></div><br></div></div><div class="content" id="multimenu"></div></div></div></div>');
  return opt_sb ? '' : output.toString();
};
