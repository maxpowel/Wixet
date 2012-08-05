/**
 * @preserve
 * FullCalendar v1.5.2
 * http://arshaw.com/fullcalendar/
 *
 * Use fullcalendar.css for basic styling.
 * For event drag & drop, requires jQuery UI draggable.
 * For event resizing, requires jQuery UI resizable.
 *
 * Copyright (c) 2011 Adam Shaw
 * Dual licensed under the MIT and GPL licenses, located in
 * MIT-LICENSE.txt and GPL-LICENSE.txt respectively.
 *
 * Date: Sun Aug 21 22:06:09 2011 -0700
 *
 */
 
(function($, undefined) {


var defaults = {

	// display
	defaultView: 'month',
	aspectRatio: 1.35,
	header: {
		left: 'title',
		center: '',
		right: 'today prev,next'
	},
	weekends: true,
	
	// editing
	//editable: false,
	//disableDragging: false,
	//disableResizing: false,
	
	allDayDefault: true,
	ignoreTimezone: true,
	
	// event ajax
	lazyFetching: true,
	startParam: 'start',
	endParam: 'end',
	
	// time formats
	titleFormat: {
		month: 'MMMM yyyy',
		week: "MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",
		day: 'dddd, MMM d, yyyy'
	},
	columnFormat: {
		month: 'ddd',
		week: 'ddd M/d',
		day: 'dddd M/d'
	},
	timeFormat: { // for event elements
		'': 'h(:mm)t' // default
	},
	
	// locale
	isRTL: false,
	firstDay: 0,
	monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
	monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
	dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
	dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
	buttonText: {
		prev: '&nbsp;&#9668;&nbsp;',
		next: '&nbsp;&#9658;&nbsp;',
		prevYear: '&nbsp;&lt;&lt;&nbsp;',
		nextYear: '&nbsp;&gt;&gt;&nbsp;',
		today: 'today',
		month: 'month',
		week: 'week',
		day: 'day'
	},
	
	// jquery-ui theming
	theme: false,
	buttonIcons: {
		prev: 'circle-triangle-w',
		next: 'circle-triangle-e'
	},
	
	//selectable: false,
	unselectAuto: true,
	
	dropAccept: '*'
	
};

// right-to-left defaults
var rtlDefaults = {
	header: {
		left: 'next,prev today',
		center: '',
		right: 'title'
	},
	buttonText: {
		prev: '&nbsp;&#9658;&nbsp;',
		next: '&nbsp;&#9668;&nbsp;',
		prevYear: '&nbsp;&gt;&gt;&nbsp;',
		nextYear: '&nbsp;&lt;&lt;&nbsp;'
	},
	buttonIcons: {
		prev: 'circle-triangle-e',
		next: 'circle-triangle-w'
	}
};



var fc = $.fullCalendar = { version: "1.5.2" };
var fcViews = fc.views = {};


$.fn.fullCalendar = function(options) {


	// method calling
	if (typeof options == 'string') {
		var args = Array.prototype.slice.call(arguments, 1);
		var res;
		this.each(function() {
			var calendar = $.data(this, 'fullCalendar');
			if (calendar && $.isFunction(calendar[options])) {
				var r = calendar[options].apply(calendar, args);
				if (res === undefined) {
					res = r;
				}
				if (options == 'destroy') {
					$.removeData(this, 'fullCalendar');
				}
			}
		});
		if (res !== undefined) {
			return res;
		}
		return this;
	}
	
	
	// would like to have this logic in EventManager, but needs to happen before options are recursively extended
	var eventSources = options.eventSources || [];
	delete options.eventSources;
	if (options.events) {
		eventSources.push(options.events);
		delete options.events;
	}
	

	options = $.extend(true, {},
		defaults,
		(options.isRTL || options.isRTL===undefined && defaults.isRTL) ? rtlDefaults : {},
		options
	);
	
	
	this.each(function(i, _element) {
		var element = $(_element);
		var calendar = new Calendar(element, options, eventSources);
		element.data('fullCalendar', calendar); // TODO: look into memory leak implications
		calendar.render();
	});
	
	
	return this;
	
};


// function for adding/overriding defaults
function setDefaults(d) {
	$.extend(true, defaults, d);
}



 
function Calendar(element, options, eventSources) {
	var t = this;
	
	
	// exports
	t.options = options;
	t.render = render;
	t.destroy = destroy;
	t.refetchEvents = refetchEvents;
	t.reportEvents = reportEvents;
	t.reportEventChange = reportEventChange;
	t.rerenderEvents = rerenderEvents;
	t.changeView = changeView;
	t.select = select;
	t.unselect = unselect;
	t.prev = prev;
	t.next = next;
	t.prevYear = prevYear;
	t.nextYear = nextYear;
	t.today = today;
	t.gotoDate = gotoDate;
	t.incrementDate = incrementDate;
	t.formatDate = function(format, date) { return formatDate(format, date, options) };
	t.formatDates = function(format, date1, date2) { return formatDates(format, date1, date2, options) };
	t.getDate = getDate;
	t.getView = getView;
	t.option = option;
	t.trigger = trigger;
	
	
	// imports
	EventManager.call(t, options, eventSources);
	var isFetchNeeded = t.isFetchNeeded;
	var fetchEvents = t.fetchEvents;
	
	
	// locals
	var _element = element[0];
	var header;
	var headerElement;
	var content;
	var tm; // for making theme classes
	var currentView;
	var viewInstances = {};
	var elementOuterWidth;
	var suggestedViewHeight;
	var absoluteViewElement;
	var resizeUID = 0;
	var ignoreWindowResize = 0;
	var date = new Date();
	var events = [];
	var _dragElement;
	
	
	
	/* Main Rendering
	-----------------------------------------------------------------------------*/
	
	
	setYMD(date, options.year, options.month, options.date);
	
	
	function render(inc) {
		if (!content) {
			initialRender();
		}else{
			calcSize();
			markSizesDirty();
			markEventsDirty();
			renderView(inc);
		}
	}
	
	
	function initialRender() {
		tm = options.theme ? 'ui' : 'fc';
		element.addClass('fc');
		if (options.isRTL) {
			element.addClass('fc-rtl');
		}
		if (options.theme) {
			element.addClass('ui-widget');
		}
		content = $("<div class='fc-content' style='position:relative'/>")
			.prependTo(element);
		header = new Header(t, options);
		headerElement = header.render();
		if (headerElement) {
			element.prepend(headerElement);
		}
		changeView(options.defaultView);
		$(window).resize(windowResize);
		// needed for IE in a 0x0 iframe, b/c when it is resized, never triggers a windowResize
		if (!bodyVisible()) {
			lateRender();
		}
	}
	
	
	// called when we know the calendar couldn't be rendered when it was initialized,
	// but we think it's ready now
	function lateRender() {
		setTimeout(function() { // IE7 needs this so dimensions are calculated correctly
			if (!currentView.start && bodyVisible()) { // !currentView.start makes sure this never happens more than once
				renderView();
			}
		},0);
	}
	
	
	function destroy() {
		$(window).unbind('resize', windowResize);
		header.destroy();
		content.remove();
		element.removeClass('fc fc-rtl ui-widget');
	}
	
	
	
	function elementVisible() {
		return _element.offsetWidth !== 0;
	}
	
	
	function bodyVisible() {
		return $('body')[0].offsetWidth !== 0;
	}
	
	
	
	/* View Rendering
	-----------------------------------------------------------------------------*/
	
	// TODO: improve view switching (still weird transition in IE, and FF has whiteout problem)
	
	function changeView(newViewName) {
		if (!currentView || newViewName != currentView.name) {
			ignoreWindowResize++; // because setMinHeight might change the height before render (and subsequently setSize) is reached

			unselect();
			
			var oldView = currentView;
			var newViewElement;
				
			if (oldView) {
				(oldView.beforeHide || noop)(); // called before changing min-height. if called after, scroll state is reset (in Opera)
				setMinHeight(content, content.height());
				oldView.element.hide();
			}else{
				setMinHeight(content, 1); // needs to be 1 (not 0) for IE7, or else view dimensions miscalculated
			}
			content.css('overflow', 'hidden');
			
			currentView = viewInstances[newViewName];
			if (currentView) {
				currentView.element.show();
			}else{
				currentView = viewInstances[newViewName] = new fcViews[newViewName](
					newViewElement = absoluteViewElement =
						$("<div class='fc-view fc-view-" + newViewName + "' style='position:absolute'/>")
							.appendTo(content),
					t // the calendar object
				);
			}
			
			if (oldView) {
				header.deactivateButton(oldView.name);
			}
			header.activateButton(newViewName);
			
			renderView(); // after height has been set, will make absoluteViewElement's position=relative, then set to null
			
			content.css('overflow', '');
			if (oldView) {
				setMinHeight(content, 1);
			}
			
			if (!newViewElement) {
				(currentView.afterShow || noop)(); // called after setting min-height/overflow, so in final scroll state (for Opera)
			}
			
			ignoreWindowResize--;
		}
	}
	
	
	
	function renderView(inc) {
		if (elementVisible()) {
			ignoreWindowResize++; // because renderEvents might temporarily change the height before setSize is reached

			unselect();
			
			if (suggestedViewHeight === undefined) {
				calcSize();
			}
			
			var forceEventRender = false;
			if (!currentView.start || inc || date < currentView.start || date >= currentView.end) {
				// view must render an entire new date range (and refetch/render events)
				currentView.render(date, inc || 0); // responsible for clearing events
				setSize(true);
				forceEventRender = true;
			}
			else if (currentView.sizeDirty) {
				// view must resize (and rerender events)
				currentView.clearEvents();
				setSize();
				forceEventRender = true;
			}
			else if (currentView.eventsDirty) {
				currentView.clearEvents();
				forceEventRender = true;
			}
			currentView.sizeDirty = false;
			currentView.eventsDirty = false;
			updateEvents(forceEventRender);
			
			elementOuterWidth = element.outerWidth();
			
			header.updateTitle(currentView.title);
			var today = new Date();
			if (today >= currentView.start && today < currentView.end) {
				header.disableButton('today');
			}else{
				header.enableButton('today');
			}
			
			ignoreWindowResize--;
			currentView.trigger('viewDisplay', _element);
		}
	}
	
	
	
	/* Resizing
	-----------------------------------------------------------------------------*/
	
	
	function updateSize() {
		markSizesDirty();
		if (elementVisible()) {
			calcSize();
			setSize();
			unselect();
			currentView.clearEvents();
			currentView.renderEvents(events);
			currentView.sizeDirty = false;
		}
	}
	
	
	function markSizesDirty() {
		$.each(viewInstances, function(i, inst) {
			inst.sizeDirty = true;
		});
	}
	
	
	function calcSize() {
		if (options.contentHeight) {
			suggestedViewHeight = options.contentHeight;
		}
		else if (options.height) {
			suggestedViewHeight = options.height - (headerElement ? headerElement.height() : 0) - vsides(content);
		}
		else {
			suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, .5));
		}
	}
	
	
	function setSize(dateChanged) { // todo: dateChanged?
		ignoreWindowResize++;
		currentView.setHeight(suggestedViewHeight, dateChanged);
		if (absoluteViewElement) {
			absoluteViewElement.css('position', 'relative');
			absoluteViewElement = null;
		}
		currentView.setWidth(content.width(), dateChanged);
		ignoreWindowResize--;
	}
	
	
	function windowResize() {
		if (!ignoreWindowResize) {
			if (currentView.start) { // view has already been rendered
				var uid = ++resizeUID;
				setTimeout(function() { // add a delay
					if (uid == resizeUID && !ignoreWindowResize && elementVisible()) {
						if (elementOuterWidth != (elementOuterWidth = element.outerWidth())) {
							ignoreWindowResize++; // in case the windowResize callback changes the height
							updateSize();
							currentView.trigger('windowResize', _element);
							ignoreWindowResize--;
						}
					}
				}, 200);
			}else{
				// calendar must have been initialized in a 0x0 iframe that has just been resized
				lateRender();
			}
		}
	}
	
	
	
	/* Event Fetching/Rendering
	-----------------------------------------------------------------------------*/
	
	
	// fetches events if necessary, rerenders events if necessary (or if forced)
	function updateEvents(forceRender) {
		if (!options.lazyFetching || isFetchNeeded(currentView.visStart, currentView.visEnd)) {
			refetchEvents();
		}
		else if (forceRender) {
			rerenderEvents();
		}
	}
	
	
	function refetchEvents() {
		fetchEvents(currentView.visStart, currentView.visEnd); // will call reportEvents
	}
	
	
	// called when event data arrives
	function reportEvents(_events) {
		events = _events;
		rerenderEvents();
	}
	
	
	// called when a single event's data has been changed
	function reportEventChange(eventID) {
		rerenderEvents(eventID);
	}
	
	
	// attempts to rerenderEvents
	function rerenderEvents(modifiedEventID) {
		markEventsDirty();
		if (elementVisible()) {
			currentView.clearEvents();
			currentView.renderEvents(events, modifiedEventID);
			currentView.eventsDirty = false;
		}
	}
	
	
	function markEventsDirty() {
		$.each(viewInstances, function(i, inst) {
			inst.eventsDirty = true;
		});
	}
	


	/* Selection
	-----------------------------------------------------------------------------*/
	

	function select(start, end, allDay) {
		currentView.select(start, end, allDay===undefined ? true : allDay);
	}
	

	function unselect() { // safe to be called before renderView
		if (currentView) {
			currentView.unselect();
		}
	}
	
	
	
	/* Date
	-----------------------------------------------------------------------------*/
	
	
	function prev() {
		renderView(-1);
	}
	
	
	function next() {
		renderView(1);
	}
	
	
	function prevYear() {
		addYears(date, -1);
		renderView();
	}
	
	
	function nextYear() {
		addYears(date, 1);
		renderView();
	}
	
	
	function today() {
		date = new Date();
		renderView();
	}
	
	
	function gotoDate(year, month, dateOfMonth) {
		if (year instanceof Date) {
			date = cloneDate(year); // provided 1 argument, a Date
		}else{
			setYMD(date, year, month, dateOfMonth);
		}
		renderView();
	}
	
	
	function incrementDate(years, months, days) {
		if (years !== undefined) {
			addYears(date, years);
		}
		if (months !== undefined) {
			addMonths(date, months);
		}
		if (days !== undefined) {
			addDays(date, days);
		}
		renderView();
	}
	
	
	function getDate() {
		return cloneDate(date);
	}
	
	
	
	/* Misc
	-----------------------------------------------------------------------------*/
	
	
	function getView() {
		return currentView;
	}
	
	
	function option(name, value) {
		if (value === undefined) {
			return options[name];
		}
		if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
			options[name] = value;
			updateSize();
		}
	}
	
	
	function trigger(name, thisObj) {
		if (options[name]) {
			return options[name].apply(
				thisObj || _element,
				Array.prototype.slice.call(arguments, 2)
			);
		}
	}
	
	
	
	/* External Dragging
	------------------------------------------------------------------------*/
	
	if (options.droppable) {
		$(document)
			.bind('dragstart', function(ev, ui) {
				var _e = ev.target;
				var e = $(_e);
				if (!e.parents('.fc').length) { // not already inside a calendar
					var accept = options.dropAccept;
					if ($.isFunction(accept) ? accept.call(_e, e) : e.is(accept)) {
						_dragElement = _e;
						currentView.dragStart(_dragElement, ev, ui);
					}
				}
			})
			.bind('dragstop', function(ev, ui) {
				if (_dragElement) {
					currentView.dragStop(_dragElement, ev, ui);
					_dragElement = null;
				}
			});
	}
	

}

function Header(calendar, options) {
	var t = this;
	
	
	// exports
	t.render = render;
	t.destroy = destroy;
	t.updateTitle = updateTitle;
	t.activateButton = activateButton;
	t.deactivateButton = deactivateButton;
	t.disableButton = disableButton;
	t.enableButton = enableButton;
	
	
	// locals
	var element = $([]);
	var tm;
	


	function render() {
		tm = options.theme ? 'ui' : 'fc';
		var sections = options.header;
		if (sections) {
			element = $("<table class='fc-header  hero-unit-simple' style='width:100%'/>")
				.append(
					$("<tr/>")
						.append(renderSection('left'))
						.append(renderSection('center'))
						.append(renderSection('right'))
				);
			return element;
		}
	}
	
	
	function destroy() {
		element.remove();
	}
	
	
	function renderSection(position) {
		var e = $("<td class='fc-header-" + position + "'/>");
		var buttonStr = options.header[position];
		if (buttonStr) {
			$.each(buttonStr.split(' '), function(i) {
				if (i > 0) {
					e.append("<span class='fc-header-space'/>");
				}
				var prevButton;
				$.each(this.split(','), function(j, buttonName) {
					if (buttonName == 'title') {
						e.append("<span class='fc-header-title'><h2>&nbsp;</h2></span>");
						if (prevButton) {
							prevButton.addClass(tm + '-corner-right');
						}
						prevButton = null;
					}else{
						var buttonClick;
						if (calendar[buttonName]) {
							buttonClick = calendar[buttonName]; // calendar method
						}
						else if (fcViews[buttonName]) {
							buttonClick = function() {
								button.removeClass(tm + '-state-hover'); // forget why
								calendar.changeView(buttonName);
							};
						}
						if (buttonClick) {
							var icon = options.theme ? smartProperty(options.buttonIcons, buttonName) : null; // why are we using smartProperty here?
							var text = smartProperty(options.buttonText, buttonName); // why are we using smartProperty here?
							var button = $(
								"<span class='fc-button fc-button-" + buttonName + " " + tm + "-state-default'>" +
									"<span class='fc-button-inner'>" +
										"<span class='fc-button-content'>" +
											(icon ?
												"<span class='fc-icon-wrap'>" +
													"<span class='ui-icon ui-icon-" + icon + "'/>" +
												"</span>" :
												text
												) +
										"</span>" +
										"<span class='fc-button-effect'><span></span></span>" +
									"</span>" +
								"</span>"
							);
							if (button) {
								button
									.click(function() {
										if (!button.hasClass(tm + '-state-disabled')) {
											buttonClick();
										}
									})
									.mousedown(function() {
										button
											.not('.' + tm + '-state-active')
											.not('.' + tm + '-state-disabled')
											.addClass(tm + '-state-down');
									})
									.mouseup(function() {
										button.removeClass(tm + '-state-down');
									})
									.hover(
										function() {
											button
												.not('.' + tm + '-state-active')
												.not('.' + tm + '-state-disabled')
												.addClass(tm + '-state-hover');
										},
										function() {
											button
												.removeClass(tm + '-state-hover')
												.removeClass(tm + '-state-down');
										}
									)
									.appendTo(e);
								if (!prevButton) {
									button.addClass(tm + '-corner-left');
								}
								prevButton = button;
							}
						}
					}
				});
				if (prevButton) {
					prevButton.addClass(tm + '-corner-right');
				}
			});
		}
		return e;
	}
	
	
	function updateTitle(html) {
		element.find('h2')
			.html(html);
	}
	
	
	function activateButton(buttonName) {
		element.find('span.fc-button-' + buttonName)
			.addClass(tm + '-state-active');
	}
	
	
	function deactivateButton(buttonName) {
		element.find('span.fc-button-' + buttonName)
			.removeClass(tm + '-state-active');
	}
	
	
	function disableButton(buttonName) {
		element.find('span.fc-button-' + buttonName)
			.addClass(tm + '-state-disabled');
	}
	
	
	function enableButton(buttonName) {
		element.find('span.fc-button-' + buttonName)
			.removeClass(tm + '-state-disabled');
	}


}

fc.sourceNormalizers = [];
fc.sourceFetchers = [];

var ajaxDefaults = {
	dataType: 'json',
	cache: false
};

var eventGUID = 1;


function EventManager(options, _sources) {
	var t = this;
	
	
	// exports
	t.isFetchNeeded = isFetchNeeded;
	t.fetchEvents = fetchEvents;
	t.addEventSource = addEventSource;
	t.removeEventSource = removeEventSource;
	t.updateEvent = updateEvent;
	t.renderEvent = renderEvent;
	t.removeEvents = removeEvents;
	t.clientEvents = clientEvents;
	t.normalizeEvent = normalizeEvent;
	
	
	// imports
	var trigger = t.trigger;
	var getView = t.getView;
	var reportEvents = t.reportEvents;
	
	
	// locals
	var stickySource = { events: [] };
	var sources = [ stickySource ];
	var rangeStart, rangeEnd;
	var currentFetchID = 0;
	var pendingSourceCnt = 0;
	var loadingLevel = 0;
	var cache = [];
	
	
	for (var i=0; i<_sources.length; i++) {
		_addEventSource(_sources[i]);
	}
	
	
	
	/* Fetching
	-----------------------------------------------------------------------------*/
	
	
	function isFetchNeeded(start, end) {
		return !rangeStart || start < rangeStart || end > rangeEnd;
	}
	
	
	function fetchEvents(start, end) {
		rangeStart = start;
		rangeEnd = end;
		cache = [];
		var fetchID = ++currentFetchID;
		var len = sources.length;
		pendingSourceCnt = len;
		for (var i=0; i<len; i++) {
			fetchEventSource(sources[i], fetchID);
		}
	}
	
	
	function fetchEventSource(source, fetchID) {
		_fetchEventSource(source, function(events) {
			if (fetchID == currentFetchID) {
				if (events) {
					for (var i=0; i<events.length; i++) {
						events[i].source = source;
						normalizeEvent(events[i]);
					}
					cache = cache.concat(events);
				}
				pendingSourceCnt--;
				if (!pendingSourceCnt) {
					reportEvents(cache);
				}
			}
		});
	}
	
	
	function _fetchEventSource(source, callback) {
		var i;
		var fetchers = fc.sourceFetchers;
		var res;
		for (i=0; i<fetchers.length; i++) {
			res = fetchers[i](source, rangeStart, rangeEnd, callback);
			if (res === true) {
				// the fetcher is in charge. made its own async request
				return;
			}
			else if (typeof res == 'object') {
				// the fetcher returned a new source. process it
				_fetchEventSource(res, callback);
				return;
			}
		}
		var events = source.events;
		if (events) {
			if ($.isFunction(events)) {
				pushLoading();
				events(cloneDate(rangeStart), cloneDate(rangeEnd), function(events) {
					callback(events);
					popLoading();
				});
			}
			else if ($.isArray(events)) {
				callback(events);
			}
			else {
				callback();
			}
		}else{
			var url = source.url;
			if (url) {
				var success = source.success;
				var error = source.error;
				var complete = source.complete;
				var data = $.extend({}, source.data || {});
				var startParam = firstDefined(source.startParam, options.startParam);
				var endParam = firstDefined(source.endParam, options.endParam);
				if (startParam) {
					data[startParam] = Math.round(+rangeStart / 1000);
				}
				if (endParam) {
					data[endParam] = Math.round(+rangeEnd / 1000);
				}
				pushLoading();
				$.ajax($.extend({}, ajaxDefaults, source, {
					data: data,
					success: function(events) {
						events = events || [];
						var res = applyAll(success, this, arguments);
						if ($.isArray(res)) {
							events = res;
						}
						callback(events);
					},
					error: function() {
						applyAll(error, this, arguments);
						callback();
					},
					complete: function() {
						applyAll(complete, this, arguments);
						popLoading();
					}
				}));
			}else{
				callback();
			}
		}
	}
	
	
	
	/* Sources
	-----------------------------------------------------------------------------*/
	

	function addEventSource(source) {
		source = _addEventSource(source);
		if (source) {
			pendingSourceCnt++;
			fetchEventSource(source, currentFetchID); // will eventually call reportEvents
		}
	}
	
	
	function _addEventSource(source) {
		if ($.isFunction(source) || $.isArray(source)) {
			source = { events: source };
		}
		else if (typeof source == 'string') {
			source = { url: source };
		}
		if (typeof source == 'object') {
			normalizeSource(source);
			sources.push(source);
			return source;
		}
	}
	

	function removeEventSource(source) {
		sources = $.grep(sources, function(src) {
			return !isSourcesEqual(src, source);
		});
		// remove all client events from that source
		cache = $.grep(cache, function(e) {
			return !isSourcesEqual(e.source, source);
		});
		reportEvents(cache);
	}
	
	
	
	/* Manipulation
	-----------------------------------------------------------------------------*/
	
	
	function updateEvent(event) { // update an existing event
		var i, len = cache.length, e,
			defaultEventEnd = getView().defaultEventEnd, // getView???
			startDelta = event.start - event._start,
			endDelta = event.end ?
				(event.end - (event._end || defaultEventEnd(event))) // event._end would be null if event.end
				: 0;                                                      // was null and event was just resized
		for (i=0; i<len; i++) {
			e = cache[i];
			if (e._id == event._id && e != event) {
				e.start = new Date(+e.start + startDelta);
				if (event.end) {
					if (e.end) {
						e.end = new Date(+e.end + endDelta);
					}else{
						e.end = new Date(+defaultEventEnd(e) + endDelta);
					}
				}else{
					e.end = null;
				}
				e.title = event.title;
				e.url = event.url;
				e.allDay = event.allDay;
				e.className = event.className;
				e.editable = event.editable;
				e.color = event.color;
				e.backgroudColor = event.backgroudColor;
				e.borderColor = event.borderColor;
				e.textColor = event.textColor;
				normalizeEvent(e);
			}
		}
		normalizeEvent(event);
		reportEvents(cache);
	}
	
	
	function renderEvent(event, stick) {
		normalizeEvent(event);
		if (!event.source) {
			if (stick) {
				stickySource.events.push(event);
				event.source = stickySource;
			}
			cache.push(event);
		}
		reportEvents(cache);
	}
	
	
	function removeEvents(filter) {
		if (!filter) { // remove all
			cache = [];
			// clear all array sources
			for (var i=0; i<sources.length; i++) {
				if ($.isArray(sources[i].events)) {
					sources[i].events = [];
				}
			}
		}else{
			if (!$.isFunction(filter)) { // an event ID
				var id = filter + '';
				filter = function(e) {
					return e._id == id;
				};
			}
			cache = $.grep(cache, filter, true);
			// remove events from array sources
			for (var i=0; i<sources.length; i++) {
				if ($.isArray(sources[i].events)) {
					sources[i].events = $.grep(sources[i].events, filter, true);
				}
			}
		}
		reportEvents(cache);
	}
	
	
	function clientEvents(filter) {
		if ($.isFunction(filter)) {
			return $.grep(cache, filter);
		}
		else if (filter) { // an event ID
			filter += '';
			return $.grep(cache, function(e) {
				return e._id == filter;
			});
		}
		return cache; // else, return all
	}
	
	
	
	/* Loading State
	-----------------------------------------------------------------------------*/
	
	
	function pushLoading() {
		if (!loadingLevel++) {
			trigger('loading', null, true);
		}
	}
	
	
	function popLoading() {
		if (!--loadingLevel) {
			trigger('loading', null, false);
		}
	}
	
	
	
	/* Event Normalization
	-----------------------------------------------------------------------------*/
	
	
	function normalizeEvent(event) {
		var source = event.source || {};
		var ignoreTimezone = firstDefined(source.ignoreTimezone, options.ignoreTimezone);
		event._id = event._id || (event.id === undefined ? '_fc' + eventGUID++ : event.id + '');
		if (event.date) {
			if (!event.start) {
				event.start = event.date;
			}
			delete event.date;
		}
		event._start = cloneDate(event.start = parseDate(event.start, ignoreTimezone));
		event.end = parseDate(event.end, ignoreTimezone);
		if (event.end && event.end <= event.start) {
			event.end = null;
		}
		event._end = event.end ? cloneDate(event.end) : null;
		if (event.allDay === undefined) {
			event.allDay = firstDefined(source.allDayDefault, options.allDayDefault);
		}
		if (event.className) {
			if (typeof event.className == 'string') {
				event.className = event.className.split(/\s+/);
			}
		}else{
			event.className = [];
		}
		// TODO: if there is no start date, return false to indicate an invalid event
	}
	
	
	
	/* Utils
	------------------------------------------------------------------------------*/
	
	
	function normalizeSource(source) {
		if (source.className) {
			// TODO: repeat code, same code for event classNames
			if (typeof source.className == 'string') {
				source.className = source.className.split(/\s+/);
			}
		}else{
			source.className = [];
		}
		var normalizers = fc.sourceNormalizers;
		for (var i=0; i<normalizers.length; i++) {
			normalizers[i](source);
		}
	}
	
	
	function isSourcesEqual(source1, source2) {
		return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
	}
	
	
	function getSourcePrimitive(source) {
		return ((typeof source == 'object') ? (source.events || source.url) : '') || source;
	}


}


fc.addDays = addDays;
fc.cloneDate = cloneDate;
fc.parseDate = parseDate;
fc.parseISO8601 = parseISO8601;
fc.parseTime = parseTime;
fc.formatDate = formatDate;
fc.formatDates = formatDates;



/* Date Math
-----------------------------------------------------------------------------*/

var dayIDs = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
	DAY_MS = 86400000,
	HOUR_MS = 3600000,
	MINUTE_MS = 60000;
	

function addYears(d, n, keepTime) {
	d.setFullYear(d.getFullYear() + n);
	if (!keepTime) {
		clearTime(d);
	}
	return d;
}


function addMonths(d, n, keepTime) { // prevents day overflow/underflow
	if (+d) { // prevent infinite looping on invalid dates
		var m = d.getMonth() + n,
			check = cloneDate(d);
		check.setDate(1);
		check.setMonth(m);
		d.setMonth(m);
		if (!keepTime) {
			clearTime(d);
		}
		while (d.getMonth() != check.getMonth()) {
			d.setDate(d.getDate() + (d < check ? 1 : -1));
		}
	}
	return d;
}


function addDays(d, n, keepTime) { // deals with daylight savings
	if (+d) {
		var dd = d.getDate() + n,
			check = cloneDate(d);
		check.setHours(9); // set to middle of day
		check.setDate(dd);
		d.setDate(dd);
		if (!keepTime) {
			clearTime(d);
		}
		fixDate(d, check);
	}
	return d;
}


function fixDate(d, check) { // force d to be on check's YMD, for daylight savings purposes
	if (+d) { // prevent infinite looping on invalid dates
		while (d.getDate() != check.getDate()) {
			d.setTime(+d + (d < check ? 1 : -1) * HOUR_MS);
		}
	}
}


function addMinutes(d, n) {
	d.setMinutes(d.getMinutes() + n);
	return d;
}


function clearTime(d) {
	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0); 
	d.setMilliseconds(0);
	return d;
}


function cloneDate(d, dontKeepTime) {
	if (dontKeepTime) {
		return clearTime(new Date(+d));
	}
	return new Date(+d);
}


function zeroDate() { // returns a Date with time 00:00:00 and dateOfMonth=1
	var i=0, d;
	do {
		d = new Date(1970, i++, 1);
	} while (d.getHours()); // != 0
	return d;
}


function skipWeekend(date, inc, excl) {
	inc = inc || 1;
	while (!date.getDay() || (excl && date.getDay()==1 || !excl && date.getDay()==6)) {
		addDays(date, inc);
	}
	return date;
}


function dayDiff(d1, d2) { // d1 - d2
	return Math.round((cloneDate(d1, true) - cloneDate(d2, true)) / DAY_MS);
}


function setYMD(date, y, m, d) {
	if (y !== undefined && y != date.getFullYear()) {
		date.setDate(1);
		date.setMonth(0);
		date.setFullYear(y);
	}
	if (m !== undefined && m != date.getMonth()) {
		date.setDate(1);
		date.setMonth(m);
	}
	if (d !== undefined) {
		date.setDate(d);
	}
}



/* Date Parsing
-----------------------------------------------------------------------------*/


function parseDate(s, ignoreTimezone) { // ignoreTimezone defaults to true
	if (typeof s == 'object') { // already a Date object
		return s;
	}
	if (typeof s == 'number') { // a UNIX timestamp
		return new Date(s * 1000);
	}
	if (typeof s == 'string') {
		if (s.match(/^\d+(\.\d+)?$/)) { // a UNIX timestamp
			return new Date(parseFloat(s) * 1000);
		}
		if (ignoreTimezone === undefined) {
			ignoreTimezone = true;
		}
		return parseISO8601(s, ignoreTimezone) || (s ? new Date(s) : null);
	}
	// TODO: never return invalid dates (like from new Date(<string>)), return null instead
	return null;
}


function parseISO8601(s, ignoreTimezone) { // ignoreTimezone defaults to false
	// derived from http://delete.me.uk/2005/03/iso8601.html
	// TODO: for a know glitch/feature, read tests/issue_206_parseDate_dst.html
	var m = s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);
	if (!m) {
		return null;
	}
	var date = new Date(m[1], 0, 1);
	if (ignoreTimezone || !m[13]) {
		var check = new Date(m[1], 0, 1, 9, 0);
		if (m[3]) {
			date.setMonth(m[3] - 1);
			check.setMonth(m[3] - 1);
		}
		if (m[5]) {
			date.setDate(m[5]);
			check.setDate(m[5]);
		}
		fixDate(date, check);
		if (m[7]) {
			date.setHours(m[7]);
		}
		if (m[8]) {
			date.setMinutes(m[8]);
		}
		if (m[10]) {
			date.setSeconds(m[10]);
		}
		if (m[12]) {
			date.setMilliseconds(Number("0." + m[12]) * 1000);
		}
		fixDate(date, check);
	}else{
		date.setUTCFullYear(
			m[1],
			m[3] ? m[3] - 1 : 0,
			m[5] || 1
		);
		date.setUTCHours(
			m[7] || 0,
			m[8] || 0,
			m[10] || 0,
			m[12] ? Number("0." + m[12]) * 1000 : 0
		);
		if (m[14]) {
			var offset = Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0);
			offset *= m[15] == '-' ? 1 : -1;
			date = new Date(+date + (offset * 60 * 1000));
		}
	}
	return date;
}


function parseTime(s) { // returns minutes since start of day
	if (typeof s == 'number') { // an hour
		return s * 60;
	}
	if (typeof s == 'object') { // a Date object
		return s.getHours() * 60 + s.getMinutes();
	}
	var m = s.match(/(\d+)(?::(\d+))?\s*(\w+)?/);
	if (m) {
		var h = parseInt(m[1], 10);
		if (m[3]) {
			h %= 12;
			if (m[3].toLowerCase().charAt(0) == 'p') {
				h += 12;
			}
		}
		return h * 60 + (m[2] ? parseInt(m[2], 10) : 0);
	}
}



/* Date Formatting
-----------------------------------------------------------------------------*/
// TODO: use same function formatDate(date, [date2], format, [options])


function formatDate(date, format, options) {
	return formatDates(date, null, format, options);
}


function formatDates(date1, date2, format, options) {
	options = options || defaults;
	var date = date1,
		otherDate = date2,
		i, len = format.length, c,
		i2, formatter,
		res = '';
	for (i=0; i<len; i++) {
		c = format.charAt(i);
		if (c == "'") {
			for (i2=i+1; i2<len; i2++) {
				if (format.charAt(i2) == "'") {
					if (date) {
						if (i2 == i+1) {
							res += "'";
						}else{
							res += format.substring(i+1, i2);
						}
						i = i2;
					}
					break;
				}
			}
		}
		else if (c == '(') {
			for (i2=i+1; i2<len; i2++) {
				if (format.charAt(i2) == ')') {
					var subres = formatDate(date, format.substring(i+1, i2), options);
					if (parseInt(subres.replace(/\D/, ''), 10)) {
						res += subres;
					}
					i = i2;
					break;
				}
			}
		}
		else if (c == '[') {
			for (i2=i+1; i2<len; i2++) {
				if (format.charAt(i2) == ']') {
					var subformat = format.substring(i+1, i2);
					var subres = formatDate(date, subformat, options);
					if (subres != formatDate(otherDate, subformat, options)) {
						res += subres;
					}
					i = i2;
					break;
				}
			}
		}
		else if (c == '{') {
			date = date2;
			otherDate = date1;
		}
		else if (c == '}') {
			date = date1;
			otherDate = date2;
		}
		else {
			for (i2=len; i2>i; i2--) {
				if (formatter = dateFormatters[format.substring(i, i2)]) {
					if (date) {
						res += formatter(date, options);
					}
					i = i2 - 1;
					break;
				}
			}
			if (i2 == i) {
				if (date) {
					res += c;
				}
			}
		}
	}
	return res;
};


var dateFormatters = {
	s	: function(d)	{ return d.getSeconds() },
	ss	: function(d)	{ return zeroPad(d.getSeconds()) },
	m	: function(d)	{ return d.getMinutes() },
	mm	: function(d)	{ return zeroPad(d.getMinutes()) },
	h	: function(d)	{ return d.getHours() % 12 || 12 },
	hh	: function(d)	{ return zeroPad(d.getHours() % 12 || 12) },
	H	: function(d)	{ return d.getHours() },
	HH	: function(d)	{ return zeroPad(d.getHours()) },
	d	: function(d)	{ return d.getDate() },
	dd	: function(d)	{ return zeroPad(d.getDate()) },
	ddd	: function(d,o)	{ return o.dayNamesShort[d.getDay()] },
	dddd: function(d,o)	{ return o.dayNames[d.getDay()] },
	M	: function(d)	{ return d.getMonth() + 1 },
	MM	: function(d)	{ return zeroPad(d.getMonth() + 1) },
	MMM	: function(d,o)	{ return o.monthNamesShort[d.getMonth()] },
	MMMM: function(d,o)	{ return o.monthNames[d.getMonth()] },
	yy	: function(d)	{ return (d.getFullYear()+'').substring(2) },
	yyyy: function(d)	{ return d.getFullYear() },
	t	: function(d)	{ return d.getHours() < 12 ? 'a' : 'p' },
	tt	: function(d)	{ return d.getHours() < 12 ? 'am' : 'pm' },
	T	: function(d)	{ return d.getHours() < 12 ? 'A' : 'P' },
	TT	: function(d)	{ return d.getHours() < 12 ? 'AM' : 'PM' },
	u	: function(d)	{ return formatDate(d, "yyyy-MM-dd'T'HH:mm:ss'Z'") },
	S	: function(d)	{
		var date = d.getDate();
		if (date > 10 && date < 20) {
			return 'th';
		}
		return ['st', 'nd', 'rd'][date%10-1] || 'th';
	}
};



fc.applyAll = applyAll;


/* Event Date Math
-----------------------------------------------------------------------------*/


function exclEndDay(event) {
	if (event.end) {
		return _exclEndDay(event.end, event.allDay);
	}else{
		return addDays(cloneDate(event.start), 1);
	}
}


function _exclEndDay(end, allDay) {
	end = cloneDate(end);
	return allDay || end.getHours() || end.getMinutes() ? addDays(end, 1) : clearTime(end);
}


function segCmp(a, b) {
	return (b.msLength - a.msLength) * 100 + (a.event.start - b.event.start);
}


function segsCollide(seg1, seg2) {
	return seg1.end > seg2.start && seg1.start < seg2.end;
}



/* Event Sorting
-----------------------------------------------------------------------------*/


// event rendering utilities
function sliceSegs(events, visEventEnds, start, end) {
	var segs = [],
		i, len=events.length, event,
		eventStart, eventEnd,
		segStart, segEnd,
		isStart, isEnd;
	for (i=0; i<len; i++) {
		event = events[i];
		eventStart = event.start;
		eventEnd = visEventEnds[i];
		if (eventEnd > start && eventStart < end) {
			if (eventStart < start) {
				segStart = cloneDate(start);
				isStart = false;
			}else{
				segStart = eventStart;
				isStart = true;
			}
			if (eventEnd > end) {
				segEnd = cloneDate(end);
				isEnd = false;
			}else{
				segEnd = eventEnd;
				isEnd = true;
			}
			segs.push({
				event: event,
				start: segStart,
				end: segEnd,
				isStart: isStart,
				isEnd: isEnd,
				msLength: segEnd - segStart
			});
		}
	} 
	return segs.sort(segCmp);
}


// event rendering calculation utilities
function stackSegs(segs) {
	var levels = [],
		i, len = segs.length, seg,
		j, collide, k;
	for (i=0; i<len; i++) {
		seg = segs[i];
		j = 0; // the level index where seg should belong
		while (true) {
			collide = false;
			if (levels[j]) {
				for (k=0; k<levels[j].length; k++) {
					if (segsCollide(levels[j][k], seg)) {
						collide = true;
						break;
					}
				}
			}
			if (collide) {
				j++;
			}else{
				break;
			}
		}
		if (levels[j]) {
			levels[j].push(seg);
		}else{
			levels[j] = [seg];
		}
	}
	return levels;
}



/* Event Element Binding
-----------------------------------------------------------------------------*/


function lazySegBind(container, segs, bindHandlers) {
	container.unbind('mouseover').mouseover(function(ev) {
		var parent=ev.target, e,
			i, seg;
		while (parent != this) {
			e = parent;
			parent = parent.parentNode;
		}
		if ((i = e._fci) !== undefined) {
			e._fci = undefined;
			seg = segs[i];
			bindHandlers(seg.event, seg.element, seg);
			$(ev.target).trigger(ev);
		}
		ev.stopPropagation();
	});
}



/* Element Dimensions
-----------------------------------------------------------------------------*/


function setOuterWidth(element, width, includeMargins) {
	for (var i=0, e; i<element.length; i++) {
		e = $(element[i]);
		e.width(Math.max(0, width - hsides(e, includeMargins)));
	}
}


function setOuterHeight(element, height, includeMargins) {
	for (var i=0, e; i<element.length; i++) {
		e = $(element[i]);
		e.height(Math.max(0, height - vsides(e, includeMargins)));
	}
}


// TODO: curCSS has been deprecated (jQuery 1.4.3 - 10/16/2010)


function hsides(element, includeMargins) {
	return hpadding(element) + hborders(element) + (includeMargins ? hmargins(element) : 0);
}


function hpadding(element) {
	return (parseFloat($.curCSS(element[0], 'paddingLeft', true)) || 0) +
	       (parseFloat($.curCSS(element[0], 'paddingRight', true)) || 0);
}


function hmargins(element) {
	return (parseFloat($.curCSS(element[0], 'marginLeft', true)) || 0) +
	       (parseFloat($.curCSS(element[0], 'marginRight', true)) || 0);
}


function hborders(element) {
	return (parseFloat($.curCSS(element[0], 'borderLeftWidth', true)) || 0) +
	       (parseFloat($.curCSS(element[0], 'borderRightWidth', true)) || 0);
}


function vsides(element, includeMargins) {
	return vpadding(element) +  vborders(element) + (includeMargins ? vmargins(element) : 0);
}


function vpadding(element) {
	return (parseFloat($.curCSS(element[0], 'paddingTop', true)) || 0) +
	       (parseFloat($.curCSS(element[0], 'paddingBottom', true)) || 0);
}


function vmargins(element) {
	return (parseFloat($.curCSS(element[0], 'marginTop', true)) || 0) +
	       (parseFloat($.curCSS(element[0], 'marginBottom', true)) || 0);
}


function vborders(element) {
	return (parseFloat($.curCSS(element[0], 'borderTopWidth', true)) || 0) +
	       (parseFloat($.curCSS(element[0], 'borderBottomWidth', true)) || 0);
}


function setMinHeight(element, height) {
	height = (typeof height == 'number' ? height + 'px' : height);
	element.each(function(i, _element) {
		_element.style.cssText += ';min-height:' + height + ';_height:' + height;
		// why can't we just use .css() ? i forget
	});
}



/* Misc Utils
-----------------------------------------------------------------------------*/


//TODO: arraySlice
//TODO: isFunction, grep ?


function noop() { }


function cmp(a, b) {
	return a - b;
}


function arrayMax(a) {
	return Math.max.apply(Math, a);
}


function zeroPad(n) {
	return (n < 10 ? '0' : '') + n;
}


function smartProperty(obj, name) { // get a camel-cased/namespaced property of an object
	if (obj[name] !== undefined) {
		return obj[name];
	}
	var parts = name.split(/(?=[A-Z])/),
		i=parts.length-1, res;
	for (; i>=0; i--) {
		res = obj[parts[i].toLowerCase()];
		if (res !== undefined) {
			return res;
		}
	}
	return obj[''];
}


function htmlEscape(s) {
	return s.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/'/g, '&#039;')
		.replace(/"/g, '&quot;')
		.replace(/\n/g, '<br />');
}


function cssKey(_element) {
	return _element.id + '/' + _element.className + '/' + _element.style.cssText.replace(/(^|;)\s*(top|left|width|height)\s*:[^;]*/ig, '');
}


function disableTextSelection(element) {
	element
		.attr('unselectable', 'on')
		.css('MozUserSelect', 'none')
		.bind('selectstart.ui', function() { return false; });
}


/*
function enableTextSelection(element) {
	element
		.attr('unselectable', 'off')
		.css('MozUserSelect', '')
		.unbind('selectstart.ui');
}
*/


function markFirstLast(e) {
	e.children()
		.removeClass('fc-first fc-last')
		.filter(':first-child')
			.addClass('fc-first')
		.end()
		.filter(':last-child')
			.addClass('fc-last');
}


function setDayID(cell, date) {
	cell.each(function(i, _cell) {
		_cell.className = _cell.className.replace(/^fc-\w*/, 'fc-' + dayIDs[date.getDay()]);
		// TODO: make a way that doesn't rely on order of classes
	});
}


function getSkinCss(event, opt) {
	var source = event.source || {};
	var eventColor = event.color;
	var sourceColor = source.color;
	var optionColor = opt('eventColor');
	var backgroundColor =
		event.backgroundColor ||
		eventColor ||
		source.backgroundColor ||
		sourceColor ||
		opt('eventBackgroundColor') ||
		optionColor;
	var borderColor =
		event.borderColor ||
		eventColor ||
		source.borderColor ||
		sourceColor ||
		opt('eventBorderColor') ||
		optionColor;
	var textColor =
		event.textColor ||
		source.textColor ||
		opt('eventTextColor');
	var statements = [];
	if (backgroundColor) {
		statements.push('background-color:' + backgroundColor);
	}
	if (borderColor) {
		statements.push('border-color:' + borderColor);
	}
	if (textColor) {
		statements.push('color:' + textColor);
	}
	return statements.join(';');
}


function applyAll(functions, thisObj, args) {
	if ($.isFunction(functions)) {
		functions = [ functions ];
	}
	if (functions) {
		var i;
		var ret;
		for (i=0; i<functions.length; i++) {
			ret = functions[i].apply(thisObj, args) || ret;
		}
		return ret;
	}
}


function firstDefined() {
	for (var i=0; i<arguments.length; i++) {
		if (arguments[i] !== undefined) {
			return arguments[i];
		}
	}
}



fcViews.month = MonthView;

function MonthView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	BasicView.call(t, element, calendar, 'month');
	var opt = t.opt;
	var renderBasic = t.renderBasic;
	var formatDate = calendar.formatDate;
	
	
	
	function render(date, delta) {
		if (delta) {
			addMonths(date, delta);
			date.setDate(1);
		}
		var start = cloneDate(date, true);
		start.setDate(1);
		var end = addMonths(cloneDate(start), 1);
		var visStart = cloneDate(start);
		var visEnd = cloneDate(end);
		var firstDay = opt('firstDay');
		var nwe = opt('weekends') ? 0 : 1;
		if (nwe) {
			skipWeekend(visStart);
			skipWeekend(visEnd, -1, true);
		}
		addDays(visStart, -((visStart.getDay() - Math.max(firstDay, nwe) + 7) % 7));
		addDays(visEnd, (7 - visEnd.getDay() + Math.max(firstDay, nwe)) % 7);
		var rowCnt = Math.round((visEnd - visStart) / (DAY_MS * 7));
		if (opt('weekMode') == 'fixed') {
			addDays(visEnd, (6 - rowCnt) * 7);
			rowCnt = 6;
		}
		t.title = formatDate(start, opt('titleFormat'));
		t.start = start;
		t.end = end;
		t.visStart = visStart;
		t.visEnd = visEnd;
		renderBasic(6, rowCnt, nwe ? 5 : 7, true);
	}
	
	
}

fcViews.basicWeek = BasicWeekView;

function BasicWeekView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	BasicView.call(t, element, calendar, 'basicWeek');
	var opt = t.opt;
	var renderBasic = t.renderBasic;
	var formatDates = calendar.formatDates;
	
	
	
	function render(date, delta) {
		if (delta) {
			addDays(date, delta * 7);
		}
		var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + 7) % 7));
		var end = addDays(cloneDate(start), 7);
		var visStart = cloneDate(start);
		var visEnd = cloneDate(end);
		var weekends = opt('weekends');
		if (!weekends) {
			skipWeekend(visStart);
			skipWeekend(visEnd, -1, true);
		}
		t.title = formatDates(
			visStart,
			addDays(cloneDate(visEnd), -1),
			opt('titleFormat')
		);
		t.start = start;
		t.end = end;
		t.visStart = visStart;
		t.visEnd = visEnd;
		renderBasic(1, 1, weekends ? 7 : 5, false);
	}
	
	
}

fcViews.basicDay = BasicDayView;

//TODO: when calendar's date starts out on a weekend, shouldn't happen


function BasicDayView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	BasicView.call(t, element, calendar, 'basicDay');
	var opt = t.opt;
	var renderBasic = t.renderBasic;
	var formatDate = calendar.formatDate;
	
	
	
	function render(date, delta) {
		if (delta) {
			addDays(date, delta);
			if (!opt('weekends')) {
				skipWeekend(date, delta < 0 ? -1 : 1);
			}
		}
		t.title = formatDate(date, opt('titleFormat'));
		t.start = t.visStart = cloneDate(date, true);
		t.end = t.visEnd = addDays(cloneDate(t.start), 1);
		renderBasic(1, 1, 1, false);
	}
	
	
}

setDefaults({
	weekMode: 'fixed'
});


function BasicView(element, calendar, viewName) {
	var t = this;
	
	
	// exports
	t.renderBasic = renderBasic;
	t.setHeight = setHeight;
	t.setWidth = setWidth;
	t.renderDayOverlay = renderDayOverlay;
	t.defaultSelectionEnd = defaultSelectionEnd;
	t.renderSelection = renderSelection;
	t.clearSelection = clearSelection;
	t.reportDayClick = reportDayClick; // for selection (kinda hacky)
	t.dragStart = dragStart;
	t.dragStop = dragStop;
	t.defaultEventEnd = defaultEventEnd;
	t.getHoverListener = function() { return hoverListener };
	t.colContentLeft = colContentLeft;
	t.colContentRight = colContentRight;
	t.dayOfWeekCol = dayOfWeekCol;
	t.dateCell = dateCell;
	t.cellDate = cellDate;
	t.cellIsAllDay = function() { return true };
	t.allDayRow = allDayRow;
	t.allDayBounds = allDayBounds;
	t.getRowCnt = function() { return rowCnt };
	t.getColCnt = function() { return colCnt };
	t.getColWidth = function() { return colWidth };
	t.getDaySegmentContainer = function() { return daySegmentContainer };
	
	
	// imports
	View.call(t, element, calendar, viewName);
	OverlayManager.call(t);
	SelectionManager.call(t);
	BasicEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	var clearEvents = t.clearEvents;
	var renderOverlay = t.renderOverlay;
	var clearOverlays = t.clearOverlays;
	var daySelectionMousedown = t.daySelectionMousedown;
	var formatDate = calendar.formatDate;
	
	
	// locals
	
	var head;
	var headCells;
	var body;
	var bodyRows;
	var bodyCells;
	var bodyFirstCells;
	var bodyCellTopInners;
	var daySegmentContainer;
	
	var viewWidth;
	var viewHeight;
	var colWidth;
	
	var rowCnt, colCnt;
	var coordinateGrid;
	var hoverListener;
	var colContentPositions;
	
	var rtl, dis, dit;
	var firstDay;
	var nwe;
	var tm;
	var colFormat;
	
	
	
	/* Rendering
	------------------------------------------------------------*/
	
	
	disableTextSelection(element.addClass('fc-grid'));
	
	
	function renderBasic(maxr, r, c, showNumbers) {
		rowCnt = r;
		colCnt = c;
		updateOptions();
		var firstTime = !body;
		if (firstTime) {
			buildSkeleton(maxr, showNumbers);
		}else{
			clearEvents();
		}
		updateCells(firstTime);
	}
	
	
	
	function updateOptions() {
		rtl = opt('isRTL');
		if (rtl) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
		firstDay = opt('firstDay');
		nwe = opt('weekends') ? 0 : 1;
		tm = opt('theme') ? 'ui' : 'fc';
		colFormat = opt('columnFormat');
	}
	
	
	
	function buildSkeleton(maxRowCnt, showNumbers) {
		var s;
		var headerClass = tm + "-widget-header";
		var contentClass = tm + "-widget-content";
		var i, j;
		var table;
		
		s =
			"<table class='fc-border-separate' style='width:100%' cellspacing='0'>" +
			"<thead>" +
			"<tr>";
		for (i=0; i<colCnt; i++) {
			s +=
				"<th class='fc- " + headerClass + "'/>"; // need fc- for setDayID
		}
		s +=
			"</tr>" +
			"</thead>" +
			"<tbody>";
		for (i=0; i<maxRowCnt; i++) {
			s +=
				"<tr class='fc-week" + i + "'>";
			for (j=0; j<colCnt; j++) {
				s +=
					"<td class='fc- " + contentClass + " fc-day" + (i*colCnt+j) + "'>" + // need fc- for setDayID
					"<div>" +
					(showNumbers ?
						"<div class='fc-day-number'/>" :
						''
						) +
					"<div class='fc-day-content'>" +
					"<div style='position:relative'>&nbsp;</div>" +
					"</div>" +
					"</div>" +
					"</td>";
			}
			s +=
				"</tr>";
		}
		s +=
			"</tbody>" +
			"</table>";
		table = $(s).appendTo(element);
		
		head = table.find('thead');
		headCells = head.find('th');
		body = table.find('tbody');
		bodyRows = body.find('tr');
		bodyCells = body.find('td');
		bodyFirstCells = bodyCells.filter(':first-child');
		bodyCellTopInners = bodyRows.eq(0).find('div.fc-day-content div');
		
		markFirstLast(head.add(head.find('tr'))); // marks first+last tr/th's
		markFirstLast(bodyRows); // marks first+last td's
		bodyRows.eq(0).addClass('fc-first'); // fc-last is done in updateCells
		
		dayBind(bodyCells);
		
		daySegmentContainer =
			$("<div style='position:absolute;z-index:8;top:0;left:0'/>")
				.appendTo(element);
	}
	
	
	
	function updateCells(firstTime) {
		var dowDirty = firstTime || rowCnt == 1; // could the cells' day-of-weeks need updating?
		var month = t.start.getMonth();
		var today = clearTime(new Date());
		var cell;
		var date;
		var row;
	
		if (dowDirty) {
			headCells.each(function(i, _cell) {
				cell = $(_cell);
				date = indexDate(i);
				cell.html(formatDate(date, colFormat));
				setDayID(cell, date);
			});
		}
		
		bodyCells.each(function(i, _cell) {
			cell = $(_cell);
			date = indexDate(i);
			if (date.getMonth() == month) {
				cell.removeClass('fc-other-month');
			}else{
				cell.addClass('fc-other-month');
			}
			if (+date == +today) {
				cell.addClass(tm + '-state-highlight fc-today');
			}else{
				cell.removeClass(tm + '-state-highlight fc-today');
			}
			cell.find('div.fc-day-number').text(date.getDate());
			if (dowDirty) {
				setDayID(cell, date);
			}
		});
		
		bodyRows.each(function(i, _row) {
			row = $(_row);
			if (i < rowCnt) {
				row.show();
				if (i == rowCnt-1) {
					row.addClass('fc-last');
				}else{
					row.removeClass('fc-last');
				}
			}else{
				row.hide();
			}
		});
	}
	
	
	
	function setHeight(height) {
		viewHeight = height;
		
		var bodyHeight = viewHeight - head.height();
		var rowHeight;
		var rowHeightLast;
		var cell;
			
		if (opt('weekMode') == 'variable') {
			rowHeight = rowHeightLast = Math.floor(bodyHeight / (rowCnt==1 ? 2 : 6));
		}else{
			rowHeight = Math.floor(bodyHeight / rowCnt);
			rowHeightLast = bodyHeight - rowHeight * (rowCnt-1);
		}
		
		bodyFirstCells.each(function(i, _cell) {
			if (i < rowCnt) {
				cell = $(_cell);
				setMinHeight(
					cell.find('> div'),
					(i==rowCnt-1 ? rowHeightLast : rowHeight) - vsides(cell)
				);
			}
		});
		
	}
	
	
	function setWidth(width) {
		viewWidth = width;
		colContentPositions.clear();
		colWidth = Math.floor(viewWidth / colCnt);
		setOuterWidth(headCells.slice(0, -1), colWidth);
	}
	
	
	
	/* Day clicking and binding
	-----------------------------------------------------------*/
	
	
	function dayBind(days) {
		days.click(dayClick)
			.mousedown(daySelectionMousedown);
	}
	
	
	function dayClick(ev) {
		if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
			var index = parseInt(this.className.match(/fc\-day(\d+)/)[1]); // TODO: maybe use .data
			var date = indexDate(index);
			trigger('dayClick', this, date, true, ev);
		}
	}
	
	
	
	/* Semi-transparent Overlay Helpers
	------------------------------------------------------*/
	
	
	function renderDayOverlay(overlayStart, overlayEnd, refreshCoordinateGrid) { // overlayEnd is exclusive
		if (refreshCoordinateGrid) {
			coordinateGrid.build();
		}
		var rowStart = cloneDate(t.visStart);
		var rowEnd = addDays(cloneDate(rowStart), colCnt);
		for (var i=0; i<rowCnt; i++) {
			var stretchStart = new Date(Math.max(rowStart, overlayStart));
			var stretchEnd = new Date(Math.min(rowEnd, overlayEnd));
			if (stretchStart < stretchEnd) {
				var colStart, colEnd;
				if (rtl) {
					colStart = dayDiff(stretchEnd, rowStart)*dis+dit+1;
					colEnd = dayDiff(stretchStart, rowStart)*dis+dit+1;
				}else{
					colStart = dayDiff(stretchStart, rowStart);
					colEnd = dayDiff(stretchEnd, rowStart);
				}
				dayBind(
					renderCellOverlay(i, colStart, i, colEnd-1)
				);
			}
			addDays(rowStart, 7);
			addDays(rowEnd, 7);
		}
	}
	
	
	function renderCellOverlay(row0, col0, row1, col1) { // row1,col1 is inclusive
		var rect = coordinateGrid.rect(row0, col0, row1, col1, element);
		return renderOverlay(rect, element);
	}
	
	
	
	/* Selection
	-----------------------------------------------------------------------*/
	
	
	function defaultSelectionEnd(startDate, allDay) {
		return cloneDate(startDate);
	}
	
	
	function renderSelection(startDate, endDate, allDay) {
		renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true); // rebuild every time???
	}
	
	
	function clearSelection() {
		clearOverlays();
	}
	
	
	function reportDayClick(date, allDay, ev) {
		var cell = dateCell(date);
		var _element = bodyCells[cell.row*colCnt + cell.col];
		trigger('dayClick', _element, date, allDay, ev);
	}
	
	
	
	/* External Dragging
	-----------------------------------------------------------------------*/
	
	
	function dragStart(_dragElement, ev, ui) {
		hoverListener.start(function(cell) {
			clearOverlays();
			if (cell) {
				renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
			}
		}, ev);
	}
	
	
	function dragStop(_dragElement, ev, ui) {
		var cell = hoverListener.stop();
		clearOverlays();
		if (cell) {
			var d = cellDate(cell);
			trigger('drop', _dragElement, d, true, ev, ui);
		}
	}
	
	
	
	/* Utilities
	--------------------------------------------------------*/
	
	
	function defaultEventEnd(event) {
		return cloneDate(event.start);
	}
	
	
	coordinateGrid = new CoordinateGrid(function(rows, cols) {
		var e, n, p;
		headCells.each(function(i, _e) {
			e = $(_e);
			n = e.offset().left;
			if (i) {
				p[1] = n;
			}
			p = [n];
			cols[i] = p;
		});
		p[1] = n + e.outerWidth();
		bodyRows.each(function(i, _e) {
			if (i < rowCnt) {
				e = $(_e);
				n = e.offset().top;
				if (i) {
					p[1] = n;
				}
				p = [n];
				rows[i] = p;
			}
		});
		p[1] = n + e.outerHeight();
	});
	
	
	hoverListener = new HoverListener(coordinateGrid);
	
	
	colContentPositions = new HorizontalPositionCache(function(col) {
		return bodyCellTopInners.eq(col);
	});
	
	
	function colContentLeft(col) {
		return colContentPositions.left(col);
	}
	
	
	function colContentRight(col) {
		return colContentPositions.right(col);
	}
	
	
	
	
	function dateCell(date) {
		return {
			row: Math.floor(dayDiff(date, t.visStart) / 7),
			col: dayOfWeekCol(date.getDay())
		};
	}
	
	
	function cellDate(cell) {
		return _cellDate(cell.row, cell.col);
	}
	
	
	function _cellDate(row, col) {
		return addDays(cloneDate(t.visStart), row*7 + col*dis+dit);
		// what about weekends in middle of week?
	}
	
	
	function indexDate(index) {
		return _cellDate(Math.floor(index/colCnt), index%colCnt);
	}
	
	
	function dayOfWeekCol(dayOfWeek) {
		return ((dayOfWeek - Math.max(firstDay, nwe) + colCnt) % colCnt) * dis + dit;
	}
	
	
	
	
	function allDayRow(i) {
		return bodyRows.eq(i);
	}
	
	
	function allDayBounds(i) {
		return {
			left: 0,
			right: viewWidth
		};
	}
	
	
}

function BasicEventRenderer() {
	var t = this;
	
	
	// exports
	t.renderEvents = renderEvents;
	t.compileDaySegs = compileSegs; // for DayEventRenderer
	t.clearEvents = clearEvents;
	t.bindDaySeg = bindDaySeg;
	
	
	// imports
	DayEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	//var setOverflowHidden = t.setOverflowHidden;
	var isEventDraggable = t.isEventDraggable;
	var isEventResizable = t.isEventResizable;
	var reportEvents = t.reportEvents;
	var reportEventClear = t.reportEventClear;
	var eventElementHandlers = t.eventElementHandlers;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var eventDrop = t.eventDrop;
	var getDaySegmentContainer = t.getDaySegmentContainer;
	var getHoverListener = t.getHoverListener;
	var renderDayOverlay = t.renderDayOverlay;
	var clearOverlays = t.clearOverlays;
	var getRowCnt = t.getRowCnt;
	var getColCnt = t.getColCnt;
	var renderDaySegs = t.renderDaySegs;
	var resizableDayEvent = t.resizableDayEvent;
	
	
	
	/* Rendering
	--------------------------------------------------------------------*/
	
	
	function renderEvents(events, modifiedEventId) {
		reportEvents(events);
		renderDaySegs(compileSegs(events), modifiedEventId);
	}
	
	
	function clearEvents() {
		reportEventClear();
		getDaySegmentContainer().empty();
	}
	
	
	function compileSegs(events) {
		var rowCnt = getRowCnt(),
			colCnt = getColCnt(),
			d1 = cloneDate(t.visStart),
			d2 = addDays(cloneDate(d1), colCnt),
			visEventsEnds = $.map(events, exclEndDay),
			i, row,
			j, level,
			k, seg,
			segs=[];
		for (i=0; i<rowCnt; i++) {
			row = stackSegs(sliceSegs(events, visEventsEnds, d1, d2));
			for (j=0; j<row.length; j++) {
				level = row[j];
				for (k=0; k<level.length; k++) {
					seg = level[k];
					seg.row = i;
					seg.level = j; // not needed anymore
					segs.push(seg);
				}
			}
			addDays(d1, 7);
			addDays(d2, 7);
		}
		return segs;
	}
	
	
	function bindDaySeg(event, eventElement, seg) {
		if (isEventDraggable(event)) {
			draggableDayEvent(event, eventElement);
		}
		if (seg.isEnd && isEventResizable(event)) {
			resizableDayEvent(event, eventElement, seg);
		}
		eventElementHandlers(event, eventElement);
			// needs to be after, because resizableDayEvent might stopImmediatePropagation on click
	}
	
	
	
	/* Dragging
	----------------------------------------------------------------------------*/
	
	
	function draggableDayEvent(event, eventElement) {
		var hoverListener = getHoverListener();
		var dayDelta;
		eventElement.draggable({
			zIndex: 9,
			delay: 50,
			opacity: opt('dragOpacity'),
			revertDuration: opt('dragRevertDuration'),
			start: function(ev, ui) {
				trigger('eventDragStart', eventElement, event, ev, ui);
				hideEvents(event, eventElement);
				hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
					eventElement.draggable('option', 'revert', !cell || !rowDelta && !colDelta);
					clearOverlays();
					if (cell) {
						//setOverflowHidden(true);
						dayDelta = rowDelta*7 + colDelta * (opt('isRTL') ? -1 : 1);
						renderDayOverlay(
							addDays(cloneDate(event.start), dayDelta),
							addDays(exclEndDay(event), dayDelta)
						);
					}else{
						//setOverflowHidden(false);
						dayDelta = 0;
					}
				}, ev, 'drag');
			},
			stop: function(ev, ui) {
				hoverListener.stop();
				clearOverlays();
				trigger('eventDragStop', eventElement, event, ev, ui);
				if (dayDelta) {
					eventDrop(this, event, dayDelta, 0, event.allDay, ev, ui);
				}else{
					eventElement.css('filter', ''); // clear IE opacity side-effects
					showEvents(event, eventElement);
				}
				//setOverflowHidden(false);
			}
		});
	}


}

fcViews.agendaWeek = AgendaWeekView;

function AgendaWeekView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	AgendaView.call(t, element, calendar, 'agendaWeek');
	var opt = t.opt;
	var renderAgenda = t.renderAgenda;
	var formatDates = calendar.formatDates;
	
	
	
	function render(date, delta) {
		if (delta) {
			addDays(date, delta * 7);
		}
		var start = addDays(cloneDate(date), -((date.getDay() - opt('firstDay') + 7) % 7));
		var end = addDays(cloneDate(start), 7);
		var visStart = cloneDate(start);
		var visEnd = cloneDate(end);
		var weekends = opt('weekends');
		if (!weekends) {
			skipWeekend(visStart);
			skipWeekend(visEnd, -1, true);
		}
		t.title = formatDates(
			visStart,
			addDays(cloneDate(visEnd), -1),
			opt('titleFormat')
		);
		t.start = start;
		t.end = end;
		t.visStart = visStart;
		t.visEnd = visEnd;
		renderAgenda(weekends ? 7 : 5);
	}
	

}

fcViews.agendaDay = AgendaDayView;

function AgendaDayView(element, calendar) {
	var t = this;
	
	
	// exports
	t.render = render;
	
	
	// imports
	AgendaView.call(t, element, calendar, 'agendaDay');
	var opt = t.opt;
	var renderAgenda = t.renderAgenda;
	var formatDate = calendar.formatDate;
	
	
	
	function render(date, delta) {
		if (delta) {
			addDays(date, delta);
			if (!opt('weekends')) {
				skipWeekend(date, delta < 0 ? -1 : 1);
			}
		}
		var start = cloneDate(date, true);
		var end = addDays(cloneDate(start), 1);
		t.title = formatDate(date, opt('titleFormat'));
		t.start = t.visStart = start;
		t.end = t.visEnd = end;
		renderAgenda(1);
	}
	

}

setDefaults({
	allDaySlot: true,
	allDayText: 'all-day',
	firstHour: 6,
	slotMinutes: 30,
	defaultEventMinutes: 120,
	axisFormat: 'h(:mm)tt',
	timeFormat: {
		agenda: 'h:mm{ - h:mm}'
	},
	dragOpacity: {
		agenda: .5
	},
	minTime: 0,
	maxTime: 24
});


// TODO: make it work in quirks mode (event corners, all-day height)
// TODO: test liquid width, especially in IE6


function AgendaView(element, calendar, viewName) {
	var t = this;
	
	
	// exports
	t.renderAgenda = renderAgenda;
	t.setWidth = setWidth;
	t.setHeight = setHeight;
	t.beforeHide = beforeHide;
	t.afterShow = afterShow;
	t.defaultEventEnd = defaultEventEnd;
	t.timePosition = timePosition;
	t.dayOfWeekCol = dayOfWeekCol;
	t.dateCell = dateCell;
	t.cellDate = cellDate;
	t.cellIsAllDay = cellIsAllDay;
	t.allDayRow = getAllDayRow;
	t.allDayBounds = allDayBounds;
	t.getHoverListener = function() { return hoverListener };
	t.colContentLeft = colContentLeft;
	t.colContentRight = colContentRight;
	t.getDaySegmentContainer = function() { return daySegmentContainer };
	t.getSlotSegmentContainer = function() { return slotSegmentContainer };
	t.getMinMinute = function() { return minMinute };
	t.getMaxMinute = function() { return maxMinute };
	t.getBodyContent = function() { return slotContent }; // !!??
	t.getRowCnt = function() { return 1 };
	t.getColCnt = function() { return colCnt };
	t.getColWidth = function() { return colWidth };
	t.getSlotHeight = function() { return slotHeight };
	t.defaultSelectionEnd = defaultSelectionEnd;
	t.renderDayOverlay = renderDayOverlay;
	t.renderSelection = renderSelection;
	t.clearSelection = clearSelection;
	t.reportDayClick = reportDayClick; // selection mousedown hack
	t.dragStart = dragStart;
	t.dragStop = dragStop;
	
	
	// imports
	View.call(t, element, calendar, viewName);
	OverlayManager.call(t);
	SelectionManager.call(t);
	AgendaEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	var clearEvents = t.clearEvents;
	var renderOverlay = t.renderOverlay;
	var clearOverlays = t.clearOverlays;
	var reportSelection = t.reportSelection;
	var unselect = t.unselect;
	var daySelectionMousedown = t.daySelectionMousedown;
	var slotSegHtml = t.slotSegHtml;
	var formatDate = calendar.formatDate;
	
	
	// locals
	
	var dayTable;
	var dayHead;
	var dayHeadCells;
	var dayBody;
	var dayBodyCells;
	var dayBodyCellInners;
	var dayBodyFirstCell;
	var dayBodyFirstCellStretcher;
	var slotLayer;
	var daySegmentContainer;
	var allDayTable;
	var allDayRow;
	var slotScroller;
	var slotContent;
	var slotSegmentContainer;
	var slotTable;
	var slotTableFirstInner;
	var axisFirstCells;
	var gutterCells;
	var selectionHelper;
	
	var viewWidth;
	var viewHeight;
	var axisWidth;
	var colWidth;
	var gutterWidth;
	var slotHeight; // TODO: what if slotHeight changes? (see issue 650)
	var savedScrollTop;
	
	var colCnt;
	var slotCnt;
	var coordinateGrid;
	var hoverListener;
	var colContentPositions;
	var slotTopCache = {};
	
	var tm;
	var firstDay;
	var nwe;            // no weekends (int)
	var rtl, dis, dit;  // day index sign / translate
	var minMinute, maxMinute;
	var colFormat;
	

	
	/* Rendering
	-----------------------------------------------------------------------------*/
	
	
	disableTextSelection(element.addClass('fc-agenda'));
	
	
	function renderAgenda(c) {
		colCnt = c;
		updateOptions();
		if (!dayTable) {
			buildSkeleton();
		}else{
			clearEvents();
		}
		updateCells();
	}
	
	
	
	function updateOptions() {
		tm = opt('theme') ? 'ui' : 'fc';
		nwe = opt('weekends') ? 0 : 1;
		firstDay = opt('firstDay');
		if (rtl = opt('isRTL')) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
		minMinute = parseTime(opt('minTime'));
		maxMinute = parseTime(opt('maxTime'));
		colFormat = opt('columnFormat');
	}
	
	
	
	function buildSkeleton() {
		var headerClass = tm + "-widget-header";
		var contentClass = tm + "-widget-content";
		var s;
		var i;
		var d;
		var maxd;
		var minutes;
		var slotNormal = opt('slotMinutes') % 15 == 0;
		
		s =
			"<table style='width:100%' class='fc-agenda-days fc-border-separate' cellspacing='0'>" +
			"<thead>" +
			"<tr>" +
			"<th class='fc-agenda-axis " + headerClass + "'>&nbsp;</th>";
		for (i=0; i<colCnt; i++) {
			s +=
				"<th class='fc- fc-col" + i + ' ' + headerClass + "'/>"; // fc- needed for setDayID
		}
		s +=
			"<th class='fc-agenda-gutter " + headerClass + "'>&nbsp;</th>" +
			"</tr>" +
			"</thead>" +
			"<tbody>" +
			"<tr>" +
			"<th class='fc-agenda-axis " + headerClass + "'>&nbsp;</th>";
		for (i=0; i<colCnt; i++) {
			s +=
				"<td class='fc- fc-col" + i + ' ' + contentClass + "'>" + // fc- needed for setDayID
				"<div>" +
				"<div class='fc-day-content'>" +
				"<div style='position:relative'>&nbsp;</div>" +
				"</div>" +
				"</div>" +
				"</td>";
		}
		s +=
			"<td class='fc-agenda-gutter " + contentClass + "'>&nbsp;</td>" +
			"</tr>" +
			"</tbody>" +
			"</table>";
		dayTable = $(s).appendTo(element);
		dayHead = dayTable.find('thead');
		dayHeadCells = dayHead.find('th').slice(1, -1);
		dayBody = dayTable.find('tbody');
		dayBodyCells = dayBody.find('td').slice(0, -1);
		dayBodyCellInners = dayBodyCells.find('div.fc-day-content div');
		dayBodyFirstCell = dayBodyCells.eq(0);
		dayBodyFirstCellStretcher = dayBodyFirstCell.find('> div');
		
		markFirstLast(dayHead.add(dayHead.find('tr')));
		markFirstLast(dayBody.add(dayBody.find('tr')));
		
		axisFirstCells = dayHead.find('th:first');
		gutterCells = dayTable.find('.fc-agenda-gutter');
		
		slotLayer =
			$("<div style='position:absolute;z-index:2;left:0;width:100%'/>")
				.appendTo(element);
				
		if (opt('allDaySlot')) {
		
			daySegmentContainer =
				$("<div style='position:absolute;z-index:8;top:0;left:0'/>")
					.appendTo(slotLayer);
		
			s =
				"<table style='width:100%' class='fc-agenda-allday' cellspacing='0'>" +
				"<tr>" +
				"<th class='" + headerClass + " fc-agenda-axis'>" + opt('allDayText') + "</th>" +
				"<td>" +
				"<div class='fc-day-content'><div style='position:relative'/></div>" +
				"</td>" +
				"<th class='" + headerClass + " fc-agenda-gutter'>&nbsp;</th>" +
				"</tr>" +
				"</table>";
			allDayTable = $(s).appendTo(slotLayer);
			allDayRow = allDayTable.find('tr');
			
			dayBind(allDayRow.find('td'));
			
			axisFirstCells = axisFirstCells.add(allDayTable.find('th:first'));
			gutterCells = gutterCells.add(allDayTable.find('th.fc-agenda-gutter'));
			
			slotLayer.append(
				"<div class='fc-agenda-divider " + headerClass + "'>" +
				"<div class='fc-agenda-divider-inner'/>" +
				"</div>"
			);
			
		}else{
		
			daySegmentContainer = $([]); // in jQuery 1.4, we can just do $()
		
		}
		
		slotScroller =
			$("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>")
				.appendTo(slotLayer);
				
		slotContent =
			$("<div style='position:relative;width:100%;overflow:hidden'/>")
				.appendTo(slotScroller);
				
		slotSegmentContainer =
			$("<div style='position:absolute;z-index:8;top:0;left:0'/>")
				.appendTo(slotContent);
		
		s =
			"<table class='fc-agenda-slots' style='width:100%' cellspacing='0'>" +
			"<tbody>";
		d = zeroDate();
		maxd = addMinutes(cloneDate(d), maxMinute);
		addMinutes(d, minMinute);
		slotCnt = 0;
		for (i=0; d < maxd; i++) {
			minutes = d.getMinutes();
			s +=
				"<tr class='fc-slot" + i + ' ' + (!minutes ? '' : 'fc-minor') + "'>" +
				"<th class='fc-agenda-axis " + headerClass + "'>" +
				((!slotNormal || !minutes) ? formatDate(d, opt('axisFormat')) : '&nbsp;') +
				"</th>" +
				"<td class='" + contentClass + "'>" +
				"<div style='position:relative'>&nbsp;</div>" +
				"</td>" +
				"</tr>";
			addMinutes(d, opt('slotMinutes'));
			slotCnt++;
		}
		s +=
			"</tbody>" +
			"</table>";
		slotTable = $(s).appendTo(slotContent);
		slotTableFirstInner = slotTable.find('div:first');
		
		slotBind(slotTable.find('td'));
		
		axisFirstCells = axisFirstCells.add(slotTable.find('th:first'));
	}
	
	
	
	function updateCells() {
		var i;
		var headCell;
		var bodyCell;
		var date;
		var today = clearTime(new Date());
		for (i=0; i<colCnt; i++) {
			date = colDate(i);
			headCell = dayHeadCells.eq(i);
			headCell.html(formatDate(date, colFormat));
			bodyCell = dayBodyCells.eq(i);
			if (+date == +today) {
				bodyCell.addClass(tm + '-state-highlight fc-today');
			}else{
				bodyCell.removeClass(tm + '-state-highlight fc-today');
			}
			setDayID(headCell.add(bodyCell), date);
		}
	}
	
	
	
	function setHeight(height, dateChanged) {
		if (height === undefined) {
			height = viewHeight;
		}
		viewHeight = height;
		slotTopCache = {};
	
		var headHeight = dayBody.position().top;
		var allDayHeight = slotScroller.position().top; // including divider
		var bodyHeight = Math.min( // total body height, including borders
			height - headHeight,   // when scrollbars
			slotTable.height() + allDayHeight + 1 // when no scrollbars. +1 for bottom border
		);
		
		dayBodyFirstCellStretcher
			.height(bodyHeight - vsides(dayBodyFirstCell));
		
		slotLayer.css('top', headHeight);
		
		slotScroller.height(bodyHeight - allDayHeight - 1);
		
		slotHeight = slotTableFirstInner.height() + 1; // +1 for border
		
		if (dateChanged) {
			resetScroll();
		}
	}
	
	
	
	function setWidth(width) {
		viewWidth = width;
		colContentPositions.clear();
		
		axisWidth = 0;
		setOuterWidth(
			axisFirstCells
				.width('')
				.each(function(i, _cell) {
					axisWidth = Math.max(axisWidth, $(_cell).outerWidth());
				}),
			axisWidth
		);
		
		var slotTableWidth = slotScroller[0].clientWidth; // needs to be done after axisWidth (for IE7)
		//slotTable.width(slotTableWidth);
		
		gutterWidth = slotScroller.width() - slotTableWidth;
		if (gutterWidth) {
			setOuterWidth(gutterCells, gutterWidth);
			gutterCells
				.show()
				.prev()
				.removeClass('fc-last');
		}else{
			gutterCells
				.hide()
				.prev()
				.addClass('fc-last');
		}
		
		colWidth = Math.floor((slotTableWidth - axisWidth) / colCnt);
		setOuterWidth(dayHeadCells.slice(0, -1), colWidth);
	}
	


	function resetScroll() {
		var d0 = zeroDate();
		var scrollDate = cloneDate(d0);
		scrollDate.setHours(opt('firstHour'));
		var top = timePosition(d0, scrollDate) + 1; // +1 for the border
		function scroll() {
			slotScroller.scrollTop(top);
		}
		scroll();
		setTimeout(scroll, 0); // overrides any previous scroll state made by the browser
	}
	
	
	function beforeHide() {
		savedScrollTop = slotScroller.scrollTop();
	}
	
	
	function afterShow() {
		slotScroller.scrollTop(savedScrollTop);
	}
	
	
	
	/* Slot/Day clicking and binding
	-----------------------------------------------------------------------*/
	

	function dayBind(cells) {
		cells.click(slotClick)
			.mousedown(daySelectionMousedown);
	}


	function slotBind(cells) {
		cells.click(slotClick)
			.mousedown(slotSelectionMousedown);
	}
	
	
	function slotClick(ev) {
		if (!opt('selectable')) { // if selectable, SelectionManager will worry about dayClick
			var col = Math.min(colCnt-1, Math.floor((ev.pageX - dayTable.offset().left - axisWidth) / colWidth));
			var date = colDate(col);
			var rowMatch = this.parentNode.className.match(/fc-slot(\d+)/); // TODO: maybe use data
			if (rowMatch) {
				var mins = parseInt(rowMatch[1]) * opt('slotMinutes');
				var hours = Math.floor(mins/60);
				date.setHours(hours);
				date.setMinutes(mins%60 + minMinute);
				trigger('dayClick', dayBodyCells[col], date, false, ev);
			}else{
				trigger('dayClick', dayBodyCells[col], date, true, ev);
			}
		}
	}
	
	
	
	/* Semi-transparent Overlay Helpers
	-----------------------------------------------------*/
	

	function renderDayOverlay(startDate, endDate, refreshCoordinateGrid) { // endDate is exclusive
		if (refreshCoordinateGrid) {
			coordinateGrid.build();
		}
		var visStart = cloneDate(t.visStart);
		var startCol, endCol;
		if (rtl) {
			startCol = dayDiff(endDate, visStart)*dis+dit+1;
			endCol = dayDiff(startDate, visStart)*dis+dit+1;
		}else{
			startCol = dayDiff(startDate, visStart);
			endCol = dayDiff(endDate, visStart);
		}
		startCol = Math.max(0, startCol);
		endCol = Math.min(colCnt, endCol);
		if (startCol < endCol) {
			dayBind(
				renderCellOverlay(0, startCol, 0, endCol-1)
			);
		}
	}
	
	
	function renderCellOverlay(row0, col0, row1, col1) { // only for all-day?
		var rect = coordinateGrid.rect(row0, col0, row1, col1, slotLayer);
		return renderOverlay(rect, slotLayer);
	}
	

	function renderSlotOverlay(overlayStart, overlayEnd) {
		var dayStart = cloneDate(t.visStart);
		var dayEnd = addDays(cloneDate(dayStart), 1);
		for (var i=0; i<colCnt; i++) {
			var stretchStart = new Date(Math.max(dayStart, overlayStart));
			var stretchEnd = new Date(Math.min(dayEnd, overlayEnd));
			if (stretchStart < stretchEnd) {
				var col = i*dis+dit;
				var rect = coordinateGrid.rect(0, col, 0, col, slotContent); // only use it for horizontal coords
				var top = timePosition(dayStart, stretchStart);
				var bottom = timePosition(dayStart, stretchEnd);
				rect.top = top;
				rect.height = bottom - top;
				slotBind(
					renderOverlay(rect, slotContent)
				);
			}
			addDays(dayStart, 1);
			addDays(dayEnd, 1);
		}
	}
	
	
	
	/* Coordinate Utilities
	-----------------------------------------------------------------------------*/
	
	
	coordinateGrid = new CoordinateGrid(function(rows, cols) {
		var e, n, p;
		dayHeadCells.each(function(i, _e) {
			e = $(_e);
			n = e.offset().left;
			if (i) {
				p[1] = n;
			}
			p = [n];
			cols[i] = p;
		});
		p[1] = n + e.outerWidth();
		if (opt('allDaySlot')) {
			e = allDayRow;
			n = e.offset().top;
			rows[0] = [n, n+e.outerHeight()];
		}
		var slotTableTop = slotContent.offset().top;
		var slotScrollerTop = slotScroller.offset().top;
		var slotScrollerBottom = slotScrollerTop + slotScroller.outerHeight();
		function constrain(n) {
			return Math.max(slotScrollerTop, Math.min(slotScrollerBottom, n));
		}
		for (var i=0; i<slotCnt; i++) {
			rows.push([
				constrain(slotTableTop + slotHeight*i),
				constrain(slotTableTop + slotHeight*(i+1))
			]);
		}
	});
	
	
	hoverListener = new HoverListener(coordinateGrid);
	
	
	colContentPositions = new HorizontalPositionCache(function(col) {
		return dayBodyCellInners.eq(col);
	});
	
	
	function colContentLeft(col) {
		return colContentPositions.left(col);
	}
	
	
	function colContentRight(col) {
		return colContentPositions.right(col);
	}
	
	
	
	
	function dateCell(date) { // "cell" terminology is now confusing
		return {
			row: Math.floor(dayDiff(date, t.visStart) / 7),
			col: dayOfWeekCol(date.getDay())
		};
	}
	
	
	function cellDate(cell) {
		var d = colDate(cell.col);
		var slotIndex = cell.row;
		if (opt('allDaySlot')) {
			slotIndex--;
		}
		if (slotIndex >= 0) {
			addMinutes(d, minMinute + slotIndex * opt('slotMinutes'));
		}
		return d;
	}
	
	
	function colDate(col) { // returns dates with 00:00:00
		return addDays(cloneDate(t.visStart), col*dis+dit);
	}
	
	
	function cellIsAllDay(cell) {
		return opt('allDaySlot') && !cell.row;
	}
	
	
	function dayOfWeekCol(dayOfWeek) {
		return ((dayOfWeek - Math.max(firstDay, nwe) + colCnt) % colCnt)*dis+dit;
	}
	
	
	
	
	// get the Y coordinate of the given time on the given day (both Date objects)
	function timePosition(day, time) { // both date objects. day holds 00:00 of current day
		day = cloneDate(day, true);
		if (time < addMinutes(cloneDate(day), minMinute)) {
			return 0;
		}
		if (time >= addMinutes(cloneDate(day), maxMinute)) {
			return slotTable.height();
		}
		var slotMinutes = opt('slotMinutes'),
			minutes = time.getHours()*60 + time.getMinutes() - minMinute,
			slotI = Math.floor(minutes / slotMinutes),
			slotTop = slotTopCache[slotI];
		if (slotTop === undefined) {
			slotTop = slotTopCache[slotI] = slotTable.find('tr:eq(' + slotI + ') td div')[0].offsetTop; //.position().top; // need this optimization???
		}
		return Math.max(0, Math.round(
			slotTop - 1 + slotHeight * ((minutes % slotMinutes) / slotMinutes)
		));
	}
	
	
	function allDayBounds() {
		return {
			left: axisWidth,
			right: viewWidth - gutterWidth
		}
	}
	
	
	function getAllDayRow(index) {
		return allDayRow;
	}
	
	
	function defaultEventEnd(event) {
		var start = cloneDate(event.start);
		if (event.allDay) {
			return start;
		}
		return addMinutes(start, opt('defaultEventMinutes'));
	}
	
	
	
	/* Selection
	---------------------------------------------------------------------------------*/
	
	
	function defaultSelectionEnd(startDate, allDay) {
		if (allDay) {
			return cloneDate(startDate);
		}
		return addMinutes(cloneDate(startDate), opt('slotMinutes'));
	}
	
	
	function renderSelection(startDate, endDate, allDay) { // only for all-day
		if (allDay) {
			if (opt('allDaySlot')) {
				renderDayOverlay(startDate, addDays(cloneDate(endDate), 1), true);
			}
		}else{
			renderSlotSelection(startDate, endDate);
		}
	}
	
	
	function renderSlotSelection(startDate, endDate) {
		var helperOption = opt('selectHelper');
		coordinateGrid.build();
		if (helperOption) {
			var col = dayDiff(startDate, t.visStart) * dis + dit;
			if (col >= 0 && col < colCnt) { // only works when times are on same day
				var rect = coordinateGrid.rect(0, col, 0, col, slotContent); // only for horizontal coords
				var top = timePosition(startDate, startDate);
				var bottom = timePosition(startDate, endDate);
				if (bottom > top) { // protect against selections that are entirely before or after visible range
					rect.top = top;
					rect.height = bottom - top;
					rect.left += 2;
					rect.width -= 5;
					if ($.isFunction(helperOption)) {
						var helperRes = helperOption(startDate, endDate);
						if (helperRes) {
							rect.position = 'absolute';
							rect.zIndex = 8;
							selectionHelper = $(helperRes)
								.css(rect)
								.appendTo(slotContent);
						}
					}else{
						rect.isStart = true; // conside rect a "seg" now
						rect.isEnd = true;   //
						selectionHelper = $(slotSegHtml(
							{
								title: '',
								start: startDate,
								end: endDate,
								className: ['fc-select-helper'],
								editable: false
							},
							rect
						));
						selectionHelper.css('opacity', opt('dragOpacity'));
					}
					if (selectionHelper) {
						slotBind(selectionHelper);
						slotContent.append(selectionHelper);
						setOuterWidth(selectionHelper, rect.width, true); // needs to be after appended
						setOuterHeight(selectionHelper, rect.height, true);
					}
				}
			}
		}else{
			renderSlotOverlay(startDate, endDate);
		}
	}
	
	
	function clearSelection() {
		clearOverlays();
		if (selectionHelper) {
			selectionHelper.remove();
			selectionHelper = null;
		}
	}
	
	
	function slotSelectionMousedown(ev) {
		if (ev.which == 1 && opt('selectable')) { // ev.which==1 means left mouse button
			unselect(ev);
			var dates;
			hoverListener.start(function(cell, origCell) {
				clearSelection();
				if (cell && cell.col == origCell.col && !cellIsAllDay(cell)) {
					var d1 = cellDate(origCell);
					var d2 = cellDate(cell);
					dates = [
						d1,
						addMinutes(cloneDate(d1), opt('slotMinutes')),
						d2,
						addMinutes(cloneDate(d2), opt('slotMinutes'))
					].sort(cmp);
					renderSlotSelection(dates[0], dates[3]);
				}else{
					dates = null;
				}
			}, ev);
			$(document).one('mouseup', function(ev) {
				hoverListener.stop();
				if (dates) {
					if (+dates[0] == +dates[1]) {
						reportDayClick(dates[0], false, ev);
					}
					reportSelection(dates[0], dates[3], false, ev);
				}
			});
		}
	}
	
	
	function reportDayClick(date, allDay, ev) {
		trigger('dayClick', dayBodyCells[dayOfWeekCol(date.getDay())], date, allDay, ev);
	}
	
	
	
	/* External Dragging
	--------------------------------------------------------------------------------*/
	
	
	function dragStart(_dragElement, ev, ui) {
		hoverListener.start(function(cell) {
			clearOverlays();
			if (cell) {
				if (cellIsAllDay(cell)) {
					renderCellOverlay(cell.row, cell.col, cell.row, cell.col);
				}else{
					var d1 = cellDate(cell);
					var d2 = addMinutes(cloneDate(d1), opt('defaultEventMinutes'));
					renderSlotOverlay(d1, d2);
				}
			}
		}, ev);
	}
	
	
	function dragStop(_dragElement, ev, ui) {
		var cell = hoverListener.stop();
		clearOverlays();
		if (cell) {
			trigger('drop', _dragElement, cellDate(cell), cellIsAllDay(cell), ev, ui);
		}
	}


}

function AgendaEventRenderer() {
	var t = this;
	
	
	// exports
	t.renderEvents = renderEvents;
	t.compileDaySegs = compileDaySegs; // for DayEventRenderer
	t.clearEvents = clearEvents;
	t.slotSegHtml = slotSegHtml;
	t.bindDaySeg = bindDaySeg;
	
	
	// imports
	DayEventRenderer.call(t);
	var opt = t.opt;
	var trigger = t.trigger;
	//var setOverflowHidden = t.setOverflowHidden;
	var isEventDraggable = t.isEventDraggable;
	var isEventResizable = t.isEventResizable;
	var eventEnd = t.eventEnd;
	var reportEvents = t.reportEvents;
	var reportEventClear = t.reportEventClear;
	var eventElementHandlers = t.eventElementHandlers;
	var setHeight = t.setHeight;
	var getDaySegmentContainer = t.getDaySegmentContainer;
	var getSlotSegmentContainer = t.getSlotSegmentContainer;
	var getHoverListener = t.getHoverListener;
	var getMaxMinute = t.getMaxMinute;
	var getMinMinute = t.getMinMinute;
	var timePosition = t.timePosition;
	var colContentLeft = t.colContentLeft;
	var colContentRight = t.colContentRight;
	var renderDaySegs = t.renderDaySegs;
	var resizableDayEvent = t.resizableDayEvent; // TODO: streamline binding architecture
	var getColCnt = t.getColCnt;
	var getColWidth = t.getColWidth;
	var getSlotHeight = t.getSlotHeight;
	var getBodyContent = t.getBodyContent;
	var reportEventElement = t.reportEventElement;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var eventDrop = t.eventDrop;
	var eventResize = t.eventResize;
	var renderDayOverlay = t.renderDayOverlay;
	var clearOverlays = t.clearOverlays;
	var calendar = t.calendar;
	var formatDate = calendar.formatDate;
	var formatDates = calendar.formatDates;
	
	
	
	/* Rendering
	----------------------------------------------------------------------------*/
	

	function renderEvents(events, modifiedEventId) {
		reportEvents(events);
		var i, len=events.length,
			dayEvents=[],
			slotEvents=[];
		for (i=0; i<len; i++) {
			if (events[i].allDay) {
				dayEvents.push(events[i]);
			}else{
				slotEvents.push(events[i]);
			}
		}
		if (opt('allDaySlot')) {
			renderDaySegs(compileDaySegs(dayEvents), modifiedEventId);
			setHeight(); // no params means set to viewHeight
		}
		renderSlotSegs(compileSlotSegs(slotEvents), modifiedEventId);
	}
	
	
	function clearEvents() {
		reportEventClear();
		getDaySegmentContainer().empty();
		getSlotSegmentContainer().empty();
	}
	
	
	function compileDaySegs(events) {
		var levels = stackSegs(sliceSegs(events, $.map(events, exclEndDay), t.visStart, t.visEnd)),
			i, levelCnt=levels.length, level,
			j, seg,
			segs=[];
		for (i=0; i<levelCnt; i++) {
			level = levels[i];
			for (j=0; j<level.length; j++) {
				seg = level[j];
				seg.row = 0;
				seg.level = i; // not needed anymore
				segs.push(seg);
			}
		}
		return segs;
	}
	
	
	function compileSlotSegs(events) {
		var colCnt = getColCnt(),
			minMinute = getMinMinute(),
			maxMinute = getMaxMinute(),
			d = addMinutes(cloneDate(t.visStart), minMinute),
			visEventEnds = $.map(events, slotEventEnd),
			i, col,
			j, level,
			k, seg,
			segs=[];
		for (i=0; i<colCnt; i++) {
			col = stackSegs(sliceSegs(events, visEventEnds, d, addMinutes(cloneDate(d), maxMinute-minMinute)));
			countForwardSegs(col);
			for (j=0; j<col.length; j++) {
				level = col[j];
				for (k=0; k<level.length; k++) {
					seg = level[k];
					seg.col = i;
					seg.level = j;
					segs.push(seg);
				}
			}
			addDays(d, 1, true);
		}
		return segs;
	}
	
	
	function slotEventEnd(event) {
		if (event.end) {
			return cloneDate(event.end);
		}else{
			return addMinutes(cloneDate(event.start), opt('defaultEventMinutes'));
		}
	}
	
	
	// renders events in the 'time slots' at the bottom
	
	function renderSlotSegs(segs, modifiedEventId) {
	
		var i, segCnt=segs.length, seg,
			event,
			classes,
			top, bottom,
			colI, levelI, forward,
			leftmost,
			availWidth,
			outerWidth,
			left,
			html='',
			eventElements,
			eventElement,
			triggerRes,
			vsideCache={},
			hsideCache={},
			key, val,
			contentElement,
			height,
			slotSegmentContainer = getSlotSegmentContainer(),
			rtl, dis, dit,
			colCnt = getColCnt();
			
		if (rtl = opt('isRTL')) {
			dis = -1;
			dit = colCnt - 1;
		}else{
			dis = 1;
			dit = 0;
		}
			
		// calculate position/dimensions, create html
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			top = timePosition(seg.start, seg.start);
			bottom = timePosition(seg.start, seg.end);
			colI = seg.col;
			levelI = seg.level;
			forward = seg.forward || 0;
			leftmost = colContentLeft(colI*dis + dit);
			availWidth = colContentRight(colI*dis + dit) - leftmost;
			availWidth = Math.min(availWidth-6, availWidth*.95); // TODO: move this to CSS
			if (levelI) {
				// indented and thin
				outerWidth = availWidth / (levelI + forward + 1);
			}else{
				if (forward) {
					// moderately wide, aligned left still
					outerWidth = ((availWidth / (forward + 1)) - (12/2)) * 2; // 12 is the predicted width of resizer =
				}else{
					// can be entire width, aligned left
					outerWidth = availWidth;
				}
			}
			left = leftmost +                                  // leftmost possible
				(availWidth / (levelI + forward + 1) * levelI) // indentation
				* dis + (rtl ? availWidth - outerWidth : 0);   // rtl
			seg.top = top;
			seg.left = left;
			seg.outerWidth = outerWidth;
			seg.outerHeight = bottom - top;
			html += slotSegHtml(event, seg);
		}
		slotSegmentContainer[0].innerHTML = html; // faster than html()
		eventElements = slotSegmentContainer.children();
		
		// retrieve elements, run through eventRender callback, bind event handlers
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			eventElement = $(eventElements[i]); // faster than eq()
			triggerRes = trigger('eventRender', event, event, eventElement);
			if (triggerRes === false) {
				eventElement.remove();
			}else{
				if (triggerRes && triggerRes !== true) {
					eventElement.remove();
					eventElement = $(triggerRes)
						.css({
							position: 'absolute',
							top: seg.top,
							left: seg.left
						})
						.appendTo(slotSegmentContainer);
				}
				seg.element = eventElement;
				if (event._id === modifiedEventId) {
					bindSlotSeg(event, eventElement, seg);
				}else{
					eventElement[0]._fci = i; // for lazySegBind
				}
				reportEventElement(event, eventElement);
			}
		}
		
		lazySegBind(slotSegmentContainer, segs, bindSlotSeg);
		
		// record event sides and title positions
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				val = vsideCache[key = seg.key = cssKey(eventElement[0])];
				seg.vsides = val === undefined ? (vsideCache[key] = vsides(eventElement, true)) : val;
				val = hsideCache[key];
				seg.hsides = val === undefined ? (hsideCache[key] = hsides(eventElement, true)) : val;
				contentElement = eventElement.find('div.fc-event-content');
				if (contentElement.length) {
					seg.contentTop = contentElement[0].offsetTop;
				}
			}
		}
		
		// set all positions/dimensions at once
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			if (eventElement = seg.element) {
				eventElement[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
				height = Math.max(0, seg.outerHeight - seg.vsides);
				eventElement[0].style.height = height + 'px';
				event = seg.event;
				if (seg.contentTop !== undefined && height - seg.contentTop < 10) {
					// not enough room for title, put it in the time header
					eventElement.find('div.fc-event-time')
						.text(formatDate(event.start, opt('timeFormat')) + ' - ' + event.title);
					eventElement.find('div.fc-event-title')
						.remove();
				}
				trigger('eventAfterRender', event, event, eventElement);
			}
		}
					
	}
	
	
	function slotSegHtml(event, seg) {
		var html = "<";
		var url = event.url;
		var skinCss = getSkinCss(event, opt);
		var skinCssAttr = (skinCss ? " style='" + skinCss + "'" : '');
		var classes = ['fc-event', 'fc-event-skin', 'fc-event-vert'];
		if (isEventDraggable(event)) {
			classes.push('fc-event-draggable');
		}
		if (seg.isStart) {
			classes.push('fc-corner-top');
		}
		if (seg.isEnd) {
			classes.push('fc-corner-bottom');
		}
		classes = classes.concat(event.className);
		if (event.source) {
			classes = classes.concat(event.source.className || []);
		}
		if (url) {
			html += "a href='" + htmlEscape(event.url) + "'";
		}else{
			html += "div";
		}
		html +=
			" class='" + classes.join(' ') + "'" +
			" style='position:absolute;z-index:8;top:" + seg.top + "px;left:" + seg.left + "px;" + skinCss + "'" +
			">" +
			"<div class='fc-event-inner fc-event-skin'" + skinCssAttr + ">" +
			"<div class='fc-event-head fc-event-skin'" + skinCssAttr + ">" +
			"<div class='fc-event-time'>" +
			htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
			"</div>" +
			"</div>" +
			"<div class='fc-event-content'>" +
			"<div class='fc-event-title'>" +
			htmlEscape(event.title) +
			"</div>" +
			"</div>" +
			"<div class='fc-event-bg'></div>" +
			"</div>"; // close inner
		if (seg.isEnd && isEventResizable(event)) {
			html +=
				"<div class='ui-resizable-handle ui-resizable-s'>=</div>";
		}
		html +=
			"</" + (url ? "a" : "div") + ">";
		return html;
	}
	
	
	function bindDaySeg(event, eventElement, seg) {
		if (isEventDraggable(event)) {
			draggableDayEvent(event, eventElement, seg.isStart);
		}
		if (seg.isEnd && isEventResizable(event)) {
			resizableDayEvent(event, eventElement, seg);
		}
		eventElementHandlers(event, eventElement);
			// needs to be after, because resizableDayEvent might stopImmediatePropagation on click
	}
	
	
	function bindSlotSeg(event, eventElement, seg) {
		var timeElement = eventElement.find('div.fc-event-time');
		if (isEventDraggable(event)) {
			draggableSlotEvent(event, eventElement, timeElement);
		}
		if (seg.isEnd && isEventResizable(event)) {
			resizableSlotEvent(event, eventElement, timeElement);
		}
		eventElementHandlers(event, eventElement);
	}
	
	
	
	/* Dragging
	-----------------------------------------------------------------------------------*/
	
	
	// when event starts out FULL-DAY
	
	function draggableDayEvent(event, eventElement, isStart) {
		var origWidth;
		var revert;
		var allDay=true;
		var dayDelta;
		var dis = opt('isRTL') ? -1 : 1;
		var hoverListener = getHoverListener();
		var colWidth = getColWidth();
		var slotHeight = getSlotHeight();
		var minMinute = getMinMinute();
		eventElement.draggable({
			zIndex: 9,
			opacity: opt('dragOpacity', 'month'), // use whatever the month view was using
			revertDuration: opt('dragRevertDuration'),
			start: function(ev, ui) {
				trigger('eventDragStart', eventElement, event, ev, ui);
				hideEvents(event, eventElement);
				origWidth = eventElement.width();
				hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
					clearOverlays();
					if (cell) {
						//setOverflowHidden(true);
						revert = false;
						dayDelta = colDelta * dis;
						if (!cell.row) {
							// on full-days
							renderDayOverlay(
								addDays(cloneDate(event.start), dayDelta),
								addDays(exclEndDay(event), dayDelta)
							);
							resetElement();
						}else{
							// mouse is over bottom slots
							if (isStart) {
								if (allDay) {
									// convert event to temporary slot-event
									eventElement.width(colWidth - 10); // don't use entire width
									setOuterHeight(
										eventElement,
										slotHeight * Math.round(
											(event.end ? ((event.end - event.start) / MINUTE_MS) : opt('defaultEventMinutes'))
											/ opt('slotMinutes')
										)
									);
									eventElement.draggable('option', 'grid', [colWidth, 1]);
									allDay = false;
								}
							}else{
								revert = true;
							}
						}
						revert = revert || (allDay && !dayDelta);
					}else{
						resetElement();
						//setOverflowHidden(false);
						revert = true;
					}
					eventElement.draggable('option', 'revert', revert);
				}, ev, 'drag');
			},
			stop: function(ev, ui) {
				hoverListener.stop();
				clearOverlays();
				trigger('eventDragStop', eventElement, event, ev, ui);
				if (revert) {
					// hasn't moved or is out of bounds (draggable has already reverted)
					resetElement();
					eventElement.css('filter', ''); // clear IE opacity side-effects
					showEvents(event, eventElement);
				}else{
					// changed!
					var minuteDelta = 0;
					if (!allDay) {
						minuteDelta = Math.round((eventElement.offset().top - getBodyContent().offset().top) / slotHeight)
							* opt('slotMinutes')
							+ minMinute
							- (event.start.getHours() * 60 + event.start.getMinutes());
					}
					eventDrop(this, event, dayDelta, minuteDelta, allDay, ev, ui);
				}
				//setOverflowHidden(false);
			}
		});
		function resetElement() {
			if (!allDay) {
				eventElement
					.width(origWidth)
					.height('')
					.draggable('option', 'grid', null);
				allDay = true;
			}
		}
	}
	
	
	// when event starts out IN TIMESLOTS
	
	function draggableSlotEvent(event, eventElement, timeElement) {
		var origPosition;
		var allDay=false;
		var dayDelta;
		var minuteDelta;
		var prevMinuteDelta;
		var dis = opt('isRTL') ? -1 : 1;
		var hoverListener = getHoverListener();
		var colCnt = getColCnt();
		var colWidth = getColWidth();
		var slotHeight = getSlotHeight();
		eventElement.draggable({
			zIndex: 9,
			scroll: false,
			grid: [colWidth, slotHeight],
			axis: colCnt==1 ? 'y' : false,
			opacity: opt('dragOpacity'),
			revertDuration: opt('dragRevertDuration'),
			start: function(ev, ui) {
				trigger('eventDragStart', eventElement, event, ev, ui);
				hideEvents(event, eventElement);
				origPosition = eventElement.position();
				minuteDelta = prevMinuteDelta = 0;
				hoverListener.start(function(cell, origCell, rowDelta, colDelta) {
					eventElement.draggable('option', 'revert', !cell);
					clearOverlays();
					if (cell) {
						dayDelta = colDelta * dis;
						if (opt('allDaySlot') && !cell.row) {
							// over full days
							if (!allDay) {
								// convert to temporary all-day event
								allDay = true;
								timeElement.hide();
								eventElement.draggable('option', 'grid', null);
							}
							renderDayOverlay(
								addDays(cloneDate(event.start), dayDelta),
								addDays(exclEndDay(event), dayDelta)
							);
						}else{
							// on slots
							resetElement();
						}
					}
				}, ev, 'drag');
			},
			drag: function(ev, ui) {
				minuteDelta = Math.round((ui.position.top - origPosition.top) / slotHeight) * opt('slotMinutes');
				if (minuteDelta != prevMinuteDelta) {
					if (!allDay) {
						updateTimeText(minuteDelta);
					}
					prevMinuteDelta = minuteDelta;
				}
			},
			stop: function(ev, ui) {
				var cell = hoverListener.stop();
				clearOverlays();
				trigger('eventDragStop', eventElement, event, ev, ui);
				if (cell && (dayDelta || minuteDelta || allDay)) {
					// changed!
					eventDrop(this, event, dayDelta, allDay ? 0 : minuteDelta, allDay, ev, ui);
				}else{
					// either no change or out-of-bounds (draggable has already reverted)
					resetElement();
					eventElement.css('filter', ''); // clear IE opacity side-effects
					eventElement.css(origPosition); // sometimes fast drags make event revert to wrong position
					updateTimeText(0);
					showEvents(event, eventElement);
				}
			}
		});
		function updateTimeText(minuteDelta) {
			var newStart = addMinutes(cloneDate(event.start), minuteDelta);
			var newEnd;
			if (event.end) {
				newEnd = addMinutes(cloneDate(event.end), minuteDelta);
			}
			timeElement.text(formatDates(newStart, newEnd, opt('timeFormat')));
		}
		function resetElement() {
			// convert back to original slot-event
			if (allDay) {
				timeElement.css('display', ''); // show() was causing display=inline
				eventElement.draggable('option', 'grid', [colWidth, slotHeight]);
				allDay = false;
			}
		}
	}
	
	
	
	/* Resizing
	--------------------------------------------------------------------------------------*/
	
	
	function resizableSlotEvent(event, eventElement, timeElement) {
		var slotDelta, prevSlotDelta;
		var slotHeight = getSlotHeight();
		eventElement.resizable({
			handles: {
				s: 'div.ui-resizable-s'
			},
			grid: slotHeight,
			start: function(ev, ui) {
				slotDelta = prevSlotDelta = 0;
				hideEvents(event, eventElement);
				eventElement.css('z-index', 9);
				trigger('eventResizeStart', this, event, ev, ui);
			},
			resize: function(ev, ui) {
				// don't rely on ui.size.height, doesn't take grid into account
				slotDelta = Math.round((Math.max(slotHeight, eventElement.height()) - ui.originalSize.height) / slotHeight);
				if (slotDelta != prevSlotDelta) {
					timeElement.text(
						formatDates(
							event.start,
							(!slotDelta && !event.end) ? null : // no change, so don't display time range
								addMinutes(eventEnd(event), opt('slotMinutes')*slotDelta),
							opt('timeFormat')
						)
					);
					prevSlotDelta = slotDelta;
				}
			},
			stop: function(ev, ui) {
				trigger('eventResizeStop', this, event, ev, ui);
				if (slotDelta) {
					eventResize(this, event, 0, opt('slotMinutes')*slotDelta, ev, ui);
				}else{
					eventElement.css('z-index', 8);
					showEvents(event, eventElement);
					// BUG: if event was really short, need to put title back in span
				}
			}
		});
	}
	

}


function countForwardSegs(levels) {
	var i, j, k, level, segForward, segBack;
	for (i=levels.length-1; i>0; i--) {
		level = levels[i];
		for (j=0; j<level.length; j++) {
			segForward = level[j];
			for (k=0; k<levels[i-1].length; k++) {
				segBack = levels[i-1][k];
				if (segsCollide(segForward, segBack)) {
					segBack.forward = Math.max(segBack.forward||0, (segForward.forward||0)+1);
				}
			}
		}
	}
}




function View(element, calendar, viewName) {
	var t = this;
	
	
	// exports
	t.element = element;
	t.calendar = calendar;
	t.name = viewName;
	t.opt = opt;
	t.trigger = trigger;
	//t.setOverflowHidden = setOverflowHidden;
	t.isEventDraggable = isEventDraggable;
	t.isEventResizable = isEventResizable;
	t.reportEvents = reportEvents;
	t.eventEnd = eventEnd;
	t.reportEventElement = reportEventElement;
	t.reportEventClear = reportEventClear;
	t.eventElementHandlers = eventElementHandlers;
	t.showEvents = showEvents;
	t.hideEvents = hideEvents;
	t.eventDrop = eventDrop;
	t.eventResize = eventResize;
	// t.title
	// t.start, t.end
	// t.visStart, t.visEnd
	
	
	// imports
	var defaultEventEnd = t.defaultEventEnd;
	var normalizeEvent = calendar.normalizeEvent; // in EventManager
	var reportEventChange = calendar.reportEventChange;
	
	
	// locals
	var eventsByID = {};
	var eventElements = [];
	var eventElementsByID = {};
	var options = calendar.options;
	
	
	
	function opt(name, viewNameOverride) {
		var v = options[name];
		if (typeof v == 'object') {
			return smartProperty(v, viewNameOverride || viewName);
		}
		return v;
	}

	
	function trigger(name, thisObj) {
		return calendar.trigger.apply(
			calendar,
			[name, thisObj || t].concat(Array.prototype.slice.call(arguments, 2), [t])
		);
	}
	
	
	/*
	function setOverflowHidden(bool) {
		element.css('overflow', bool ? 'hidden' : '');
	}
	*/
	
	
	function isEventDraggable(event) {
		return isEventEditable(event) && !opt('disableDragging');
	}
	
	
	function isEventResizable(event) { // but also need to make sure the seg.isEnd == true
		return isEventEditable(event) && !opt('disableResizing');
	}
	
	
	function isEventEditable(event) {
		return firstDefined(event.editable, (event.source || {}).editable, opt('editable'));
	}
	
	
	
	/* Event Data
	------------------------------------------------------------------------------*/
	
	
	// report when view receives new events
	function reportEvents(events) { // events are already normalized at this point
		eventsByID = {};
		var i, len=events.length, event;
		for (i=0; i<len; i++) {
			event = events[i];
			if (eventsByID[event._id]) {
				eventsByID[event._id].push(event);
			}else{
				eventsByID[event._id] = [event];
			}
		}
	}
	
	
	// returns a Date object for an event's end
	function eventEnd(event) {
		return event.end ? cloneDate(event.end) : defaultEventEnd(event);
	}
	
	
	
	/* Event Elements
	------------------------------------------------------------------------------*/
	
	
	// report when view creates an element for an event
	function reportEventElement(event, element) {
		eventElements.push(element);
		if (eventElementsByID[event._id]) {
			eventElementsByID[event._id].push(element);
		}else{
			eventElementsByID[event._id] = [element];
		}
	}
	
	
	function reportEventClear() {
		eventElements = [];
		eventElementsByID = {};
	}
	
	
	// attaches eventClick, eventMouseover, eventMouseout
	function eventElementHandlers(event, eventElement) {
		eventElement
			.click(function(ev) {
				if (!eventElement.hasClass('ui-draggable-dragging') &&
					!eventElement.hasClass('ui-resizable-resizing')) {
						return trigger('eventClick', this, event, ev);
					}
			})
			.hover(
				function(ev) {
					trigger('eventMouseover', this, event, ev);
				},
				function(ev) {
					trigger('eventMouseout', this, event, ev);
				}
			);
		// TODO: don't fire eventMouseover/eventMouseout *while* dragging is occuring (on subject element)
		// TODO: same for resizing
	}
	
	
	function showEvents(event, exceptElement) {
		eachEventElement(event, exceptElement, 'show');
	}
	
	
	function hideEvents(event, exceptElement) {
		eachEventElement(event, exceptElement, 'hide');
	}
	
	
	function eachEventElement(event, exceptElement, funcName) {
		var elements = eventElementsByID[event._id],
			i, len = elements.length;
		for (i=0; i<len; i++) {
			if (!exceptElement || elements[i][0] != exceptElement[0]) {
				elements[i][funcName]();
			}
		}
	}
	
	
	
	/* Event Modification Reporting
	---------------------------------------------------------------------------------*/
	
	
	function eventDrop(e, event, dayDelta, minuteDelta, allDay, ev, ui) {
		var oldAllDay = event.allDay;
		var eventId = event._id;
		moveEvents(eventsByID[eventId], dayDelta, minuteDelta, allDay);
		trigger(
			'eventDrop',
			e,
			event,
			dayDelta,
			minuteDelta,
			allDay,
			function() {
				// TODO: investigate cases where this inverse technique might not work
				moveEvents(eventsByID[eventId], -dayDelta, -minuteDelta, oldAllDay);
				reportEventChange(eventId);
			},
			ev,
			ui
		);
		reportEventChange(eventId);
	}
	
	
	function eventResize(e, event, dayDelta, minuteDelta, ev, ui) {
		var eventId = event._id;
		elongateEvents(eventsByID[eventId], dayDelta, minuteDelta);
		trigger(
			'eventResize',
			e,
			event,
			dayDelta,
			minuteDelta,
			function() {
				// TODO: investigate cases where this inverse technique might not work
				elongateEvents(eventsByID[eventId], -dayDelta, -minuteDelta);
				reportEventChange(eventId);
			},
			ev,
			ui
		);
		reportEventChange(eventId);
	}
	
	
	
	/* Event Modification Math
	---------------------------------------------------------------------------------*/
	
	
	function moveEvents(events, dayDelta, minuteDelta, allDay) {
		minuteDelta = minuteDelta || 0;
		for (var e, len=events.length, i=0; i<len; i++) {
			e = events[i];
			if (allDay !== undefined) {
				e.allDay = allDay;
			}
			addMinutes(addDays(e.start, dayDelta, true), minuteDelta);
			if (e.end) {
				e.end = addMinutes(addDays(e.end, dayDelta, true), minuteDelta);
			}
			normalizeEvent(e, options);
		}
	}
	
	
	function elongateEvents(events, dayDelta, minuteDelta) {
		minuteDelta = minuteDelta || 0;
		for (var e, len=events.length, i=0; i<len; i++) {
			e = events[i];
			e.end = addMinutes(addDays(eventEnd(e), dayDelta, true), minuteDelta);
			normalizeEvent(e, options);
		}
	}
	

}

function DayEventRenderer() {
	var t = this;

	
	// exports
	t.renderDaySegs = renderDaySegs;
	t.resizableDayEvent = resizableDayEvent;
	
	
	// imports
	var opt = t.opt;
	var trigger = t.trigger;
	var isEventDraggable = t.isEventDraggable;
	var isEventResizable = t.isEventResizable;
	var eventEnd = t.eventEnd;
	var reportEventElement = t.reportEventElement;
	var showEvents = t.showEvents;
	var hideEvents = t.hideEvents;
	var eventResize = t.eventResize;
	var getRowCnt = t.getRowCnt;
	var getColCnt = t.getColCnt;
	var getColWidth = t.getColWidth;
	var allDayRow = t.allDayRow;
	var allDayBounds = t.allDayBounds;
	var colContentLeft = t.colContentLeft;
	var colContentRight = t.colContentRight;
	var dayOfWeekCol = t.dayOfWeekCol;
	var dateCell = t.dateCell;
	var compileDaySegs = t.compileDaySegs;
	var getDaySegmentContainer = t.getDaySegmentContainer;
	var bindDaySeg = t.bindDaySeg; //TODO: streamline this
	var formatDates = t.calendar.formatDates;
	var renderDayOverlay = t.renderDayOverlay;
	var clearOverlays = t.clearOverlays;
	var clearSelection = t.clearSelection;
	
	
	
	/* Rendering
	-----------------------------------------------------------------------------*/
	
	
	function renderDaySegs(segs, modifiedEventId) {
		var segmentContainer = getDaySegmentContainer();
		var rowDivs;
		var rowCnt = getRowCnt();
		var colCnt = getColCnt();
		var i = 0;
		var rowI;
		var levelI;
		var colHeights;
		var j;
		var segCnt = segs.length;
		var seg;
		var top;
		var k;
		segmentContainer[0].innerHTML = daySegHTML(segs); // faster than .html()
		daySegElementResolve(segs, segmentContainer.children());
		daySegElementReport(segs);
		daySegHandlers(segs, segmentContainer, modifiedEventId);
		daySegCalcHSides(segs);
		daySegSetWidths(segs);
		daySegCalcHeights(segs);
		rowDivs = getRowDivs();
		// set row heights, calculate event tops (in relation to row top)
		for (rowI=0; rowI<rowCnt; rowI++) {
			levelI = 0;
			colHeights = [];
			for (j=0; j<colCnt; j++) {
				colHeights[j] = 0;
			}
			while (i<segCnt && (seg = segs[i]).row == rowI) {
				// loop through segs in a row
				top = arrayMax(colHeights.slice(seg.startCol, seg.endCol));
				seg.top = top;
				top += seg.outerHeight;
				for (k=seg.startCol; k<seg.endCol; k++) {
					colHeights[k] = top;
				}
				i++;
			}
			rowDivs[rowI].height(arrayMax(colHeights));
		}
		daySegSetTops(segs, getRowTops(rowDivs));
	}
	
	
	function renderTempDaySegs(segs, adjustRow, adjustTop) {
		var tempContainer = $("<div/>");
		var elements;
		var segmentContainer = getDaySegmentContainer();
		var i;
		var segCnt = segs.length;
		var element;
		tempContainer[0].innerHTML = daySegHTML(segs); // faster than .html()
		elements = tempContainer.children();
		segmentContainer.append(elements);
		daySegElementResolve(segs, elements);
		daySegCalcHSides(segs);
		daySegSetWidths(segs);
		daySegCalcHeights(segs);
		daySegSetTops(segs, getRowTops(getRowDivs()));
		elements = [];
		for (i=0; i<segCnt; i++) {
			element = segs[i].element;
			if (element) {
				if (segs[i].row === adjustRow) {
					element.css('top', adjustTop);
				}
				elements.push(element[0]);
			}
		}
		return $(elements);
	}
	
	
	function daySegHTML(segs) { // also sets seg.left and seg.outerWidth
		var rtl = opt('isRTL');
		var i;
		var segCnt=segs.length;
		var seg;
		var event;
		var url;
		var classes;
		var bounds = allDayBounds();
		var minLeft = bounds.left;
		var maxLeft = bounds.right;
		var leftCol;
		var rightCol;
		var left;
		var right;
		var skinCss;
		var html = '';
		// calculate desired position/dimensions, create html
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			classes = ['fc-event', 'fc-event-skin', 'fc-event-hori'];
			if (isEventDraggable(event)) {
				classes.push('fc-event-draggable');
			}
			if (rtl) {
				if (seg.isStart) {
					classes.push('fc-corner-right');
				}
				if (seg.isEnd) {
					classes.push('fc-corner-left');
				}
				leftCol = dayOfWeekCol(seg.end.getDay()-1);
				rightCol = dayOfWeekCol(seg.start.getDay());
				left = seg.isEnd ? colContentLeft(leftCol) : minLeft;
				right = seg.isStart ? colContentRight(rightCol) : maxLeft;
			}else{
				if (seg.isStart) {
					classes.push('fc-corner-left');
				}
				if (seg.isEnd) {
					classes.push('fc-corner-right');
				}
				leftCol = dayOfWeekCol(seg.start.getDay());
				rightCol = dayOfWeekCol(seg.end.getDay()-1);
				left = seg.isStart ? colContentLeft(leftCol) : minLeft;
				right = seg.isEnd ? colContentRight(rightCol) : maxLeft;
			}
			classes = classes.concat(event.className);
			if (event.source) {
				classes = classes.concat(event.source.className || []);
			}
			url = event.url;
			skinCss = getSkinCss(event, opt);
			if (url) {
				html += "<a href='" + htmlEscape(url) + "'";
			}else{
				html += "<div";
			}
			html +=
				" class='" + classes.join(' ') + "'" +
				" style='position:absolute;z-index:8;left:"+left+"px;" + skinCss + "'" +
				">" +
				"<div" +
				" class='fc-event-inner fc-event-skin'" +
				(skinCss ? " style='" + skinCss + "'" : '') +
				">";
			if (!event.allDay && seg.isStart) {
				html +=
					"<span class='fc-event-time'>" +
					htmlEscape(formatDates(event.start, event.end, opt('timeFormat'))) +
					"</span>";
			}
			html +=
				"<span class='fc-event-title'>" + htmlEscape(event.title) + "</span>" +
				"</div>";
			if (seg.isEnd && isEventResizable(event)) {
				html +=
					"<div class='ui-resizable-handle ui-resizable-" + (rtl ? 'w' : 'e') + "'>" +
					"&nbsp;&nbsp;&nbsp;" + // makes hit area a lot better for IE6/7
					"</div>";
			}
			html +=
				"</" + (url ? "a" : "div" ) + ">";
			seg.left = left;
			seg.outerWidth = right - left;
			seg.startCol = leftCol;
			seg.endCol = rightCol + 1; // needs to be exclusive
		}
		return html;
	}
	
	
	function daySegElementResolve(segs, elements) { // sets seg.element
		var i;
		var segCnt = segs.length;
		var seg;
		var event;
		var element;
		var triggerRes;
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			event = seg.event;
			element = $(elements[i]); // faster than .eq()
			triggerRes = trigger('eventRender', event, event, element);
			if (triggerRes === false) {
				element.remove();
			}else{
				if (triggerRes && triggerRes !== true) {
					triggerRes = $(triggerRes)
						.css({
							position: 'absolute',
							left: seg.left
						});
					element.replaceWith(triggerRes);
					element = triggerRes;
				}
				seg.element = element;
			}
		}
	}
	
	
	function daySegElementReport(segs) {
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				reportEventElement(seg.event, element);
			}
		}
	}
	
	
	function daySegHandlers(segs, segmentContainer, modifiedEventId) {
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		var event;
		// retrieve elements, run through eventRender callback, bind handlers
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				event = seg.event;
				if (event._id === modifiedEventId) {
					bindDaySeg(event, element, seg);
				}else{
					element[0]._fci = i; // for lazySegBind
				}
			}
		}
		lazySegBind(segmentContainer, segs, bindDaySeg);
	}
	
	
	function daySegCalcHSides(segs) { // also sets seg.key
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		var key, val;
		var hsideCache = {};
		// record event horizontal sides
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				key = seg.key = cssKey(element[0]);
				val = hsideCache[key];
				if (val === undefined) {
					val = hsideCache[key] = hsides(element, true);
				}
				seg.hsides = val;
			}
		}
	}
	
	
	function daySegSetWidths(segs) {
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				element[0].style.width = Math.max(0, seg.outerWidth - seg.hsides) + 'px';
			}
		}
	}
	
	
	function daySegCalcHeights(segs) {
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		var key, val;
		var vmarginCache = {};
		// record event heights
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				key = seg.key; // created in daySegCalcHSides
				val = vmarginCache[key];
				if (val === undefined) {
					val = vmarginCache[key] = vmargins(element);
				}
				seg.outerHeight = element[0].offsetHeight + val;
			}
		}
	}
	
	
	function getRowDivs() {
		var i;
		var rowCnt = getRowCnt();
		var rowDivs = [];
		for (i=0; i<rowCnt; i++) {
			rowDivs[i] = allDayRow(i)
				.find('td:first div.fc-day-content > div'); // optimal selector?
		}
		return rowDivs;
	}
	
	
	function getRowTops(rowDivs) {
		var i;
		var rowCnt = rowDivs.length;
		var tops = [];
		for (i=0; i<rowCnt; i++) {
			tops[i] = rowDivs[i][0].offsetTop; // !!?? but this means the element needs position:relative if in a table cell!!!!
		}
		return tops;
	}
	
	
	function daySegSetTops(segs, rowTops) { // also triggers eventAfterRender
		var i;
		var segCnt = segs.length;
		var seg;
		var element;
		var event;
		for (i=0; i<segCnt; i++) {
			seg = segs[i];
			element = seg.element;
			if (element) {
				element[0].style.top = rowTops[seg.row] + (seg.top||0) + 'px';
				event = seg.event;
				trigger('eventAfterRender', event, event, element);
			}
		}
	}
	
	
	
	/* Resizing
	-----------------------------------------------------------------------------------*/
	
	
	function resizableDayEvent(event, element, seg) {
		var rtl = opt('isRTL');
		var direction = rtl ? 'w' : 'e';
		var handle = element.find('div.ui-resizable-' + direction);
		var isResizing = false;
		
		// TODO: look into using jquery-ui mouse widget for this stuff
		disableTextSelection(element); // prevent native <a> selection for IE
		element
			.mousedown(function(ev) { // prevent native <a> selection for others
				ev.preventDefault();
			})
			.click(function(ev) {
				if (isResizing) {
					ev.preventDefault(); // prevent link from being visited (only method that worked in IE6)
					ev.stopImmediatePropagation(); // prevent fullcalendar eventClick handler from being called
					                               // (eventElementHandlers needs to be bound after resizableDayEvent)
				}
			});
		
		handle.mousedown(function(ev) {
			if (ev.which != 1) {
				return; // needs to be left mouse button
			}
			isResizing = true;
			var hoverListener = t.getHoverListener();
			var rowCnt = getRowCnt();
			var colCnt = getColCnt();
			var dis = rtl ? -1 : 1;
			var dit = rtl ? colCnt-1 : 0;
			var elementTop = element.css('top');
			var dayDelta;
			var helpers;
			var eventCopy = $.extend({}, event);
			var minCell = dateCell(event.start);
			clearSelection();
			$('body')
				.css('cursor', direction + '-resize')
				.one('mouseup', mouseup);
			trigger('eventResizeStart', this, event, ev);
			hoverListener.start(function(cell, origCell) {
				if (cell) {
					var r = Math.max(minCell.row, cell.row);
					var c = cell.col;
					if (rowCnt == 1) {
						r = 0; // hack for all-day area in agenda views
					}
					if (r == minCell.row) {
						if (rtl) {
							c = Math.min(minCell.col, c);
						}else{
							c = Math.max(minCell.col, c);
						}
					}
					dayDelta = (r*7 + c*dis+dit) - (origCell.row*7 + origCell.col*dis+dit);
					var newEnd = addDays(eventEnd(event), dayDelta, true);
					if (dayDelta) {
						eventCopy.end = newEnd;
						var oldHelpers = helpers;
						helpers = renderTempDaySegs(compileDaySegs([eventCopy]), seg.row, elementTop);
						helpers.find('*').css('cursor', direction + '-resize');
						if (oldHelpers) {
							oldHelpers.remove();
						}
						hideEvents(event);
					}else{
						if (helpers) {
							showEvents(event);
							helpers.remove();
							helpers = null;
						}
					}
					clearOverlays();
					renderDayOverlay(event.start, addDays(cloneDate(newEnd), 1)); // coordinate grid already rebuild at hoverListener.start
				}
			}, ev);
			
			function mouseup(ev) {
				trigger('eventResizeStop', this, event, ev);
				$('body').css('cursor', '');
				hoverListener.stop();
				clearOverlays();
				if (dayDelta) {
					eventResize(this, event, dayDelta, 0, ev);
					// event redraw will clear helpers
				}
				// otherwise, the drag handler already restored the old events
				
				setTimeout(function() { // make this happen after the element's click event
					isResizing = false;
				},0);
			}
			
		});
	}
	

}

//BUG: unselect needs to be triggered when events are dragged+dropped

function SelectionManager() {
	var t = this;
	
	
	// exports
	t.select = select;
	t.unselect = unselect;
	t.reportSelection = reportSelection;
	t.daySelectionMousedown = daySelectionMousedown;
	
	
	// imports
	var opt = t.opt;
	var trigger = t.trigger;
	var defaultSelectionEnd = t.defaultSelectionEnd;
	var renderSelection = t.renderSelection;
	var clearSelection = t.clearSelection;
	
	
	// locals
	var selected = false;



	// unselectAuto
	if (opt('selectable') && opt('unselectAuto')) {
		$(document).mousedown(function(ev) {
			var ignore = opt('unselectCancel');
			if (ignore) {
				if ($(ev.target).parents(ignore).length) { // could be optimized to stop after first match
					return;
				}
			}
			unselect(ev);
		});
	}
	

	function select(startDate, endDate, allDay) {
		unselect();
		if (!endDate) {
			endDate = defaultSelectionEnd(startDate, allDay);
		}
		renderSelection(startDate, endDate, allDay);
		reportSelection(startDate, endDate, allDay);
	}
	
	
	function unselect(ev) {
		if (selected) {
			selected = false;
			clearSelection();
			trigger('unselect', null, ev);
		}
	}
	
	
	function reportSelection(startDate, endDate, allDay, ev) {
		selected = true;
		trigger('select', null, startDate, endDate, allDay, ev);
	}
	
	
	function daySelectionMousedown(ev) { // not really a generic manager method, oh well
		var cellDate = t.cellDate;
		var cellIsAllDay = t.cellIsAllDay;
		var hoverListener = t.getHoverListener();
		var reportDayClick = t.reportDayClick; // this is hacky and sort of weird
		if (ev.which == 1 && opt('selectable')) { // which==1 means left mouse button
			unselect(ev);
			var _mousedownElement = this;
			var dates;
			hoverListener.start(function(cell, origCell) { // TODO: maybe put cellDate/cellIsAllDay info in cell
				clearSelection();
				if (cell && cellIsAllDay(cell)) {
					dates = [ cellDate(origCell), cellDate(cell) ].sort(cmp);
					renderSelection(dates[0], dates[1], true);
				}else{
					dates = null;
				}
			}, ev);
			$(document).one('mouseup', function(ev) {
				hoverListener.stop();
				if (dates) {
					if (+dates[0] == +dates[1]) {
						reportDayClick(dates[0], true, ev);
					}
					reportSelection(dates[0], dates[1], true, ev);
				}
			});
		}
	}


}
 
function OverlayManager() {
	var t = this;
	
	
	// exports
	t.renderOverlay = renderOverlay;
	t.clearOverlays = clearOverlays;
	
	
	// locals
	var usedOverlays = [];
	var unusedOverlays = [];
	
	
	function renderOverlay(rect, parent) {
		var e = unusedOverlays.shift();
		if (!e) {
			e = $("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>");
		}
		if (e[0].parentNode != parent[0]) {
			e.appendTo(parent);
		}
		usedOverlays.push(e.css(rect).show());
		return e;
	}
	

	function clearOverlays() {
		var e;
		while (e = usedOverlays.shift()) {
			unusedOverlays.push(e.hide().unbind());
		}
	}


}

function CoordinateGrid(buildFunc) {

	var t = this;
	var rows;
	var cols;
	
	
	t.build = function() {
		rows = [];
		cols = [];
		buildFunc(rows, cols);
	};
	
	
	t.cell = function(x, y) {
		var rowCnt = rows.length;
		var colCnt = cols.length;
		var i, r=-1, c=-1;
		for (i=0; i<rowCnt; i++) {
			if (y >= rows[i][0] && y < rows[i][1]) {
				r = i;
				break;
			}
		}
		for (i=0; i<colCnt; i++) {
			if (x >= cols[i][0] && x < cols[i][1]) {
				c = i;
				break;
			}
		}
		return (r>=0 && c>=0) ? { row:r, col:c } : null;
	};
	
	
	t.rect = function(row0, col0, row1, col1, originElement) { // row1,col1 is inclusive
		var origin = originElement.offset();
		return {
			top: rows[row0][0] - origin.top,
			left: cols[col0][0] - origin.left,
			width: cols[col1][1] - cols[col0][0],
			height: rows[row1][1] - rows[row0][0]
		};
	};

}

function HoverListener(coordinateGrid) {


	var t = this;
	var bindType;
	var change;
	var firstCell;
	var cell;
	
	
	t.start = function(_change, ev, _bindType) {
		change = _change;
		firstCell = cell = null;
		coordinateGrid.build();
		mouse(ev);
		bindType = _bindType || 'mousemove';
		$(document).bind(bindType, mouse);
	};
	
	
	function mouse(ev) {
		var newCell = coordinateGrid.cell(ev.pageX, ev.pageY);
		if (!newCell != !cell || newCell && (newCell.row != cell.row || newCell.col != cell.col)) {
			if (newCell) {
				if (!firstCell) {
					firstCell = newCell;
				}
				change(newCell, firstCell, newCell.row-firstCell.row, newCell.col-firstCell.col);
			}else{
				change(newCell, firstCell);
			}
			cell = newCell;
		}
	}
	
	
	t.stop = function() {
		$(document).unbind(bindType, mouse);
		return cell;
	};
	
	
}

function HorizontalPositionCache(getElement) {

	var t = this,
		elements = {},
		lefts = {},
		rights = {};
		
	function e(i) {
		return elements[i] = elements[i] || getElement(i);
	}
	
	t.left = function(i) {
		return lefts[i] = lefts[i] === undefined ? e(i).position().left : lefts[i];
	};
	
	t.right = function(i) {
		return rights[i] = rights[i] === undefined ? t.left(i) + e(i).width() : rights[i];
	};
	
	t.clear = function() {
		elements = {};
		lefts = {};
		rights = {};
	};
	
}

})(jQuery);

var AboutMeEditEntryView = Backbone.View.extend({
    
    events: {
    	"click #save": "saveEntry",
    	"click #delete": "deleteEntry",
    	"click #close-success": "closeSuccess"
    },
	
      
    render: function() {
    			
    	$(this.el).html(template.preferencesView.aboutMeEditEntry({title: this.model.get("title"), body:this.model.get("body")}));
    	this.notificationSuccess = $(this.el).find("#notif-success");
    
      return this;
    },
    
    deleteEntry: function(){
    	this.model.destroy();
    	$(this.el).fadeOut(function(){
    		$(this).remove();
    	});
    	
    },
    
    saveEntry: function(){
    	var html = $(this.el);
    	var notif = this.notificationSuccess;
    	this.model.save({title: html.find("#title").val(), body: html.find("#body").val()},{
    		success:function(){
    			notif.show();
    		}
    	});
    },
    
    closeSuccess: function(){
    	this.notificationSuccess.hide();
    }
});
var AboutMeEditView = Backbone.View.extend({
    
    events: {
    	"click #newAboutMe-but": "addNew"
    },
	
    initialize: function() {
    	this.aboutMeCollection = new AboutMeList({id: getViewer("id")});
    	this.aboutMeCollection.bind('add',   this.addOne, this);
        this.aboutMeCollection.bind('reset', this.addAll, this);
    },
    
      
    render: function() {
    			
    			
    	$(this.el).html(template.preferencesView.aboutMe());
    	this.aboutMeCollection.fetch({data:{profile: getViewer().get("id")}});
    	this.aboutMeList = $(this.el).find("#aboutMeList");
    	
    	

      return this;
    },
    
    addAll: function() {
    	var cont =this.aboutMeList; 
    	this.aboutMeCollection.each(function(aboutMe,i){
    	  var view = new AboutMeEditEntryView({model: aboutMe});
          cont.append(view.render().el);
      });  
    },
    
    addOne: function(aboutMe){

  	  var view = new AboutMeEditEntryView({model: aboutMe});
        this.aboutMeList.append(view.render().el);
    },
    
    addNew: function(){
        this.addOne(new AboutMe({title:"",body:""}));
    }
});
var AboutMeView = Backbone.View.extend({
    
    el: '#aboutMe',
    
    /*events: {
    	"keypress #new-share":  "createOnEnter",
    	"click #more-newness":  "loadMoreNewness"
    },*/
    
    
    initialize: function() {
    	
      this.render();
  
      //this.options.collection.fetch({data:{page:1}});*/
    },
	
    render: function(){
		
		/*aboutMeCollection.each(function(aboutMe,i){
	    	  var view = new AboutMeEditEntryView({model: aboutMe});
	          cont.append(view.render().el);
	      });*/
    	$(this.el).html(template.profileView.aboutMe( {list: this.collection.toJSON()} ));
    }
});

var AgendaNearbyTaskListView = Backbone.View.extend({
    
    el: '#agendaTask-list',
    
    
    initialize: function() {
      
      this.options.collection.bind('reset', this.addAll, this);

      this.options.collection.fetch();
    },
    
    addAll: function() {
      this.options.collection.each(this.addOne);
    },
    
    addOne: function(task) {
      var view = new AgendaNearbyTaskView({model: task });
      this.$("#agendaTask-list").append(view.render().el);
    },
});

var AgendaNearbyTaskView = Backbone.View.extend({
      
    render: function() {
    	
    	$(this.el).html(template.agendaView.nearbyTask( this.model.toJSON()));

      return this;
    }
});
var AgendaSectionView = Backbone.View.extend({
    
    el: '#content',
    
    initialize: function() {
    	
      this.render();
    },
    
    render: function(){
    	$(this.el).html(template.section.agenda( this.options));
		
    	var calendarView = new CalendarView({ collection: new CalendarEventList()});

    	}
});

var AlbumListView = Backbone.View.extend({
	tagName:"ul",
    className:"nav nav-list",
    loadedAlbum: null,
    
    initialize: function() {
    	this.photoContainer = this.options.photoContainer;
    	this.newAlbumButton = this.options.newAlbumButton;
    	this.profileId = this.options.profileId;
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
    	  
          this.options.collection.fetch({data:{profile: this.profileId}});
    	  return this;
      },
      
      addAll: function() {
    	  var cont = $(this.el);
    	  var self = this;
    	  cont.html("");
    	  cont.append('<li class="nav-header">Albums</li>');
    	  var photoCon = this.photoContainer;
    	  var albumButton = this.newAlbumButton;
    	  var profileId = this.profileId;
    	  var albumId = this.options.albumId;
          this.options.collection.each(function(folder,i){
        	  var view = new AlbumView({model: folder, photoContainer: photoCon, newAlbumButton: albumButton});
        	  
        	  cont.append(view.render().el);
        	  view.bind('loaded', self.albumLoaded, self);
        	  if(albumId != null){
        		  if(folder.get('id') == albumId)
            		  view.loadAlbum();
          	  }else if(i == 0){
        		  view.loadAlbum();
        	  }
          });    	  
      },
      
      albumLoaded: function(album){
    	  
    	  if(this.loadedAlbum != null)
    		  this.loadedAlbum.removeClass("active");
    	  
    	  this.loadedAlbum = $(album);
    	  this.loadedAlbum.addClass("active");
      },
      
      addOne: function(album){
    	  
    	  var view = new AlbumView({model: album, photoContainer: this.photoContainer, newAlbumButton: this.newAlbumButton});
          $(this.el).append(view.render().el);
          view.loadAlbum();
      },
      removeOne: function(folder) {
    	  this.addAll();
      }
});

var AlbumNewFormView = Backbone.View.extend({
    
    events: {
    	"click button":  "createFolder",
    },
    initialize: function() {
    	this.folderCollection = this.options.collection;
    	
    },
    
    createFolder: function(){
    	//Only insert if text is written
    	var val = $(this.el).find("#folderName-input").val().trim();
    	var collection = this.folderCollection;
    	if(val.length){
    		var folder = new Album({name: val});
    		folder.save(null,{success: function(){
    			collection.add(folder);
    		}});
    	}
    	
    	//TODO aqui estoy this.options.collection..destroy();
    },
    render: function() {
    	$(this.el).html(template.multimediaView.newAlbum());
		
    	

      return this;
    }
});
var AlbumOptionsButtonView = Backbone.View.extend({
    tagName: "span",
	subSectionId: "options-sub",
	buttonClass: "primary",
    events: {
    	"click button":  "doOptionsForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.multimediaView.albumOptionsButton( ));
    	return this;
    },
    
    doOptionsForm: function( event ){
    	this.changeTo(this.subSectionId,new AlbumOptionsFormView({folder: this.options.album, context: this}));
    }
});

var AlbumOptionsFormView = Backbone.View.extend({
    removeWindow: null,
    events: {
    	"click #save-folder-btn":  "saveAlbum",
    	"click #remove-folder-btn": "removeAlbum",
    },
    initialize: function() {
    	this.folder = this.options.folder;
    	this.permissions = new PermissionList();
    	this.permissions.url = this.permissions.url+"ItemContainer/"+this.folder.get("id");
    	this.permissions.bind('add',   this.addOnePermission, this);
        this.permissions.bind('reset', this.addAllPermissions, this);
    	
    },
    addAllPermissions: function(){
    	this.permissionContainer = this.$el.find("#permissionsBody");
    	var self = this;
    	this.permissions.each(function(permission){
      	  self.addOnePermission(permission,self);
        });
    },
    
    addOnePermission: function(permission){
    	this.permissionContainer.append(new PermissionSimpleEntryView({model: permission}).render().el)
    },
    
    saveAlbum: function(){
    	var name = $.trim($(this.el).find("#folderName-input").val());
    	if(name.length > 0){
    		this.options.folder.set({name:name});
    		this.options.folder.save();
    		this.options.context.backToMain();
    	}
    },
    removeAlbum: function(){
    	
    	if(this.removeWindow == null){
    		var modalTemplate = template.multimediaView.removeAlbumAsk( {folder:this.options.folder.get('name')});
    		var folder = this.options.folder;
	    	this.removeWindow = $(modalTemplate);
	    	var remWin = this.removeWindow;
	    	this.removeWindow.modal({backdrop:true, keyboard: true});
	    	this.removeWindow.find(".remove").click(function(){
	    		folder.destroy({wait: true, error: function(){
	    			alert("Album cannot be removed because is not empty");
	    		}});
	    		remWin.modal('hide');
	    	});
	    	this.removeWindow.find(".cancel").click(function(){
	    		remWin.modal('hide');
	    	});
    	}
	    this.removeWindow.modal('show');

    },
    render: function() {
    	$(this.el).html(template.multimediaView.albumOptions({name:this.options.folder.get('name')}));
    	this.$el.append(new PermissionManagerSimpleView({model: this.options.folder}).render().el)
    	//Permissions
		this.permissions.fetch();
    	var self = this
    	this.$el.find("#newPermissionEntity").typeahead({
			source: "/autocomplete/contactsGroups",
			onSelect: function(item){
				self.permissions.add(new Permission({isNew: true, read_granted:1, read_denied:0, write_granted:1, write_denied:0, object_id: self.folder.get("id") ,type: item.data, object_type: "ItemContainer", entity_id: item.id, name: item.value}));
				
			}

    	});
    	///
    	

      return this;
    }
});
var AlbumView = Backbone.View.extend({
    
	tagName: "li",
	
	events: {
		"click .load": "loadAlbum"
	},
	
    initialize: function() {
    	//this.render();
    	this.photoContainer = this.options.photoContainer;
    	this.model.bind('change', this.modelChanged, this);
    	this.model.bind('destroy', this.removeAlbum, this);
    },
    
    modelChanged: function(){
    	$(this.el).find("a").text(this.model.get('name'));
    	this.photoContainer.find("#folderName").text(this.model.get('name'));
    },
    render: function() {
    	$(this.el).html(template.multimediaView.album( {name: this.model.get('name')} ) );

      return this;
    },
    
    removeAlbum: function(){
    	$(this.el).unbind().remove();
    },
    loadAlbum: function(){
    	if(this.options.newAlbumButton != null){ //Viewer is the owner
    		var albumOptions = new AlbumOptionsButtonView({album: this.model});
        	var photoList = new PhotoListView({album:this.model, optionsBut: albumOptions});
        	
        	
        	var menu = new MultimenuView({original:photoList, subsections:[albumOptions,this.options.newAlbumButton], el: this.photoContainer});
    	}else{
    		var photoList = new PhotoListView({album:this.model, optionsBut: null});
        	var menu = new MultimenuView({original:photoList, subsections:[], el: this.photoContainer});
    	}
    	
    	menu.render();
    	this.trigger("loaded",this.el);
    }
});
var AlertPermissionView = Backbone.View.extend({
	
	className: "span4",
	
	events: {
		"click .close": "removePermission"
	},
	
    initialize: function() {
    	//Avoid destroy item in the server
    	this.model.set({id: null})

    },
    
    render: function() {
    	$(this.el).html(template.appView.alert( {text: this.model.get('name')} ) );

      return this;
    },
    
    removePermission: function(){
    	this.model.destroy();
    	$(this.el).unbind().remove();
    }
});
var AppView = Backbone.View.extend({
	actualSection: null,
	navbar: null,
	toolbar: null,
	sectionContainer: null,
	activeMenuSection: function( section ){
		//Activate the menu toolbar button
		this.navbar.find(".active").removeClass("active");
		this.navbar.find("#menu-"+section).addClass("active");
	},
	  
	clean: function(){
		if(this.actualSection != null){
			  this.actualSection.unbind();
			  this.actualSection.remove();
		}
	},
    loadView: function(view){
	    this.clean();
        this.actualSection = view;
	    this.sectionContainer.html(view.render().el);
    },
	initialize: function() {
		this.render();
		
		
		$(this.el).find(".dropdown-toggle").dropdown();
		
		
		this.navbar = $(this.el).find("#navbar");
		var navbar = this.navbar;
		this.sectionContainer = $(this.el).find("#content"); 
		var app = this;
		var Controller = Backbone.Router.extend({
			  navbar: navbar,
			  
			  routes: {
			    "start":                 "loadStart",
			    "photo/:id":					"loadPhoto",
			    "search/:query":                 "loadSearchQuery",
			    "search":                 "loadSearch",
			    "messages":                 "loadMessages",
			    "agenda/:year/:month":   "loadAgenda",
			    "agenda":   "loadAgenda",
			    "profile/:id":           "loadProfile",
			    "profile":           "toProfile",
			    "multimedia/:id":             "loadMultimedia",
			    "multimedia/:id/album/:albumId": "loadAlbum",
			    "multimedia":                 "toMultimedia",
			    "preferences":             "loadPreferences",
			    "" :"goToStart"
			  },
			  goToStart: function(){
				  this.navigate("start", true);
			  },
			  
			  loadStart: function() {
				  app.activeMenuSection("start");
				  app.loadView(new StartSectionView());
			  },

			  loadProfile: function(id) {
				  app.activeMenuSection("profile");
				  app.loadView(new ProfileSectionView({userId:id}));
			  },
			  
			  toProfile: function() {
				  this.navigate("profile/"+getViewer().get('id'),true);
			  },
			  
			  loadPreferences: function() {
				  app.activeMenuSection("preferences");
				  app.loadView(new PreferencesSectionView());

			  },
			  
			  loadAlbum: function(id, albumId) {
				  app.activeMenuSection("multimedia");
				  app.loadView(new MultimediaSectionView({profileId:id, albumId: albumId}));
			  },
			  
			  loadMultimedia: function(id) {
				  app.activeMenuSection("multimedia");
				  app.loadView(new MultimediaSectionView({profileId:id}));

			  },
			  
			  toMultimedia: function() {
				  this.navigate("multimedia/"+getViewer().get('id'),true);
			  },
			  
			  loadPhoto: function(id) {
				  app.activeMenuSection("multimedia");
				  app.loadView(new PhotoSectionView({photoId:id}));
			  },
			  
			  loadAgenda: function(year, month) {
				  alert("Not available")
				  return;
				  app.activeMenuSection("agenda");
				  if(app.sections.agenda == null)
					  app.sections.agenda = new AgendaSectionView();
				  app.sectionContainer.html(app.sections.agenda.el);
			  },
			  
			  loadSearch: function() {
				  app.activeMenuSection("search");
				  app.loadView(new SearchSectionView());
			  },
			  
			  loadSearchQuery: function(query) {
				  app.activeMenuSection("search");
				  app.loadView(new SearchSectionView({query: query}));
			  },
			  
			  loadMessages: function() {
				  app.activeMenuSection("messages");
				  app.loadView(new MessagesSectionView());
			  }

			});

			Backbone.emulateHTTP = true;
			var controller = new Controller();
			this.toolbar = new ToolbarView({router: controller, el: $(this.el).find("#navbar")});
			this.toolbar.render();
			Backbone.history.start();
	},

	
	render: function(){
		$(this.el).html(template.appView.app());
		return this;
	}
	
});

var CalendarView = Backbone.View.extend({
    
    el: '#calendar',
    
    /*events: {
    	"keypress #new-share":  "createOnEnter",
    	"click #more-newness":  "loadMoreNewness"
    },*/
    
    
    initialize: function() {
    	
   // 	$(this.el).fullCalendar();
    	$('#calendar').fullCalendar({
    	    
    	});
      /*this.page = 1;
      this.input    = this.$("#new-share");
      this.moreButton = this.$("#more-newness");
      
      this.options.collection.bind('add',   this.addOne, this);
      this.options.collection.bind('reset', this.addAll, this);
      //this.options.collection.bind('all',   this.render, this);

      this.options.collection.fetch({data:{page:1}});*/
    }
});

var CommentListView = Backbone.View.extend({
    
    events: {
        "click #nextPage-btn": "nextPage",
        "click #previousPage-btn": "previousPage",
        "click #comment-send": "sendComment",
        
    },
    
    initialize: function() {

      this.collection = new CommentList(null,{photoId:this.options.photoId});
      this.collection.bind('reset', this.addAll, this);
      
    },
    
    render: function(){
    	$(this.el).html(template.commentView.commentList());

        this.pageContainer = $(this.el).find("#page-number");
        
        this.nextButton = $(this.el).find("#nextPage-btn").parent();
        this.previousButton = $(this.el).find("#previousPage-btn").parent();
        this.commentContainer = $(this.el).find("#comment-list");
        this.commentText = $(this.el).find("#comment-text");
        
        this.collection.fetch();
        return this;
    },
    
    sendComment: function(){
    	
    	var text = $.trim(this.commentText.val());
    	var self = this;
    	if(text.length > 0){
    		var comment = new Comment();
    		comment.save({photoId: this.options.photoId, body: text},
    				{
    					success: function(){
    						self.collection.reinit();
    						self.commentText.val("")
    						
    					}
    				});
    		
    		
    	}
    	
    },
    addAll: function() {
    	this.commentContainer.html("");
        this.totalPages = this.collection.getTotalPages();
        if(this.totalPages > 0 && this.collection.size() == 0){
        	this.previousPage();
        }else{
        	this.pageContainer.text(this.collection.getPage());
        	this.checkNavButtons();
        	this.collection.each(this.addOne);
        }
    },
    
    addOne: function(comment) {
        var view = new CommentView({model: comment });
        this.$("#comment-list").append(view.render().el);
    },
    
    
    checkNavButtons: function(){
    	var page = this.collection.getPage();
    	if(page >= this.totalPages){
    		this.nextButton.addClass("disabled");
    	}else{
    		this.nextButton.removeClass("disabled");
    	}
    	
    	if(page == 1){
    		this.previousButton.addClass("disabled");
    	}else{
    		this.previousButton.removeClass("disabled");
    	}
    	
    },
    nextPage: function(){
    	if(this.collection.getPage() < this.totalPages){
    		this.collection.nextPage();
    		this.pageContainer.text(this.collection.getPage());
    	}
    },
    previousPage: function(){
    	if(this.collection.getPage() > 1){
    		this.collection.previousPage();
    		this.pageContainer.text(this.collection.getPage());
    	}
    }
});

var CommentView = Backbone.View.extend({
	tagName:"li",
	events:{
		"click .close": "destroyModel"
	},
	
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    },
    
    remove: function() {
        $(this.el).remove();
     },
     
     destroyModel: function(){
    	 this.model.destroy();
     },
      
    render: function() {
    	//TODO hacer que esto cambie
    	$(this.el).html(template.commentView.comment( {authorName: this.model.get("firstName")+" "+this.model.get("lastName"), date:this.model.get("date"), body:this.model.get("body")} ));
    	
      return this;
    }
      
});
var ContactSuggestionListView = Backbone.View.extend({
    
    el: '#contact-suggestion',
    
    initialize: function() {
      
      this.options.collection.bind('reset', this.addAll, this);

      this.options.collection.fetch();
    },
    
    addAll: function() {
      var container = $(this.el);
      
      this.options.collection.each(function(suggestion){
    	  var view = new ContactSuggestionView({model: suggestion, id: suggestion.id, name: suggestion.get("name") });
          container.append(view.render().el);
    	  
      });
    }
});

var ContactSuggestionView = Backbone.View.extend({
    
    template: $('#contactSuggestion-template').html(),
    
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    	
    },
    
    remove: function() {
    	//Do not execute manually, use destroyModel
        $(this.el).remove();
     },
     
      
    render: function() {
    	var model = this.model;
    	$(this.el).html(template.contactSuggestionView.contactSuggestion( this.options));
		$(this.el).find(".add").click(function(){
			model.destroy();
		});
      return this;
    }
});
var ConversationEntryView = Backbone.View.extend({
    
	tagName: "tr",
      
	render: function(){
		$(this.el).html(template.messagesView.conversationEntry( this.model.toJSON() ));

		return this;
	}
});

var ConversationView = Backbone.View.extend({
    
    
    events: {
    	"click #send-but":  "replyMessage"
    //	"focus #body": "bigTextarea",
    //	"blur #body": "normalTextarea",
    },
    
    
    initialize: function() {
    	this.collection = new ConversationEntryList();
    	this.collection.bind('add',   this.addOne, this);
        this.collection.bind('reset', this.addAll, this);
    },
    
    addAll: function() {
        var cont = this.conversationContainer;
        this.collection.each(function(message){
      	    var view = new ConversationEntryView({model: message});
            cont.append(view.render().el);
        });
     },
      
     addOne: function(message) {
        var view = new ConversationEntryView({model: message});
        this.conversationContainer.prepend(view.render().el);
     },
      
	render: function(){
		$(this.el).html(template.messagesView.conversation());
		this.conversationContainer = $(this.el).find("#message-list"); 
		this.messageBody = $(this.el).find("#body");
		this.collection.fetch({data:{id:this.model.get("id")}});
		return this;
	},
	
	/*bigTextarea: function(){
		this.messageBody.height("200px");
	},
	
	normalTextarea: function(){
		this.messageBody.height("50px");
	},*/
	
	replyMessage: function(){
		var message = new Message();
		var localThis = this;
		message.save({conversation_id: this.model.get("id"), body: this.messageBody.val()},{success:function(){
			localThis.collection.add(message);
			localThis.messageBody.html("");
		}});
	}
});

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
var GroupEditView = Backbone.View.extend({
	subSectionId: "edit-sub",
	buttonClass: "primary",
	events: {
		"click #removeSelected-btn": "removeUsers"
	},
	
    initialize: function() {
    	this.memberList = new UserList();
    	this.memberList.bind("add", this.addToList, this);
    },
    
    addToList: function(user){
    	if(user.get("save") == true){
    		var self = this;
    		$.getJSON("/permission/addGroup/"+user.get('id')+"/"+this.model.get('id'),function(data){
    			if(data.error){
    				item.destroy();
    				alert("Error while saving group")
    			}
    		});
    	}
    	this.memberListContainer.append("<option value='"+ user.get('id') +"'>"+ user.get('name') +"</option>");

    },
    removeUsers: function(){
    	var self = this;
    	$.each(this.$el.find("#memberList option:selected"),function(i,element){
    		$.getJSON("/permission/removeGroup/"+$(element).val()+"/"+self.model.get("id"), function(data){
    			if(data.error)
    				alert("Error while removing user")
    			else
    				$(element).remove();
    		});
    	});
    },
    
    render: function() {
    	/*this.model.set({name:"jajajajaja"})
    	$(this.el).html(this.model.get("name"));
    	this.model.save();*/
    	var self = this;
    	$(this.el).html(template.preferencesView.editGroup({name: this.model.get("name")}));
    	this.memberListContainer = $(this.el).find("#memberList");
    	
    	this.memberListContainer.bind('change', function(){
    		if(self.memberListContainer.find("option:selected").length > 0)
    			self.$el.find("#removeSelected-btn").removeClass("disabled");
    		else
    			self.$el.find("#removeSelected-btn").addClass("disabled");
		})
		
    	this.model.getMemberList(function(list){
    		list.each(function(user){
    			self.memberList.add(user)
    		});
    		
    	});
    	
    	this.$el.find("#personName-txt").typeahead({
			source: "/autocomplete/contacts",
			onSelect: function(item){
				self.memberList.add(new User({id: item.id, name: item.value, save: true}))
				
			}

    	});
    	

      return this;
    }
});
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
var ManageGroupsView = Backbone.View.extend({
    
	events:{
		"click #createGroup-btn": "createGroup"
	},
	
	//changeTo and backtoMain provided by MultimenuView
	
    initialize: function() {
    	this.groupCollection = new GroupList();
        this.groupCollection.bind('add',   this.addOne, this);
        this.groupCollection.bind('reset', this.addAll, this);
      },
      
      render: function(){
    	  $(this.el).html(template.preferencesView.manageGroups());
    	  this.groupContainer = $(this.el).find("#groupList");
          this.groupCollection.fetch();
          this.newGroupName = $(this.el).find("#newGroupName");
    	  return this;
      },
      
      addAll: function() {
    	  var cont = this.groupContainer;
    	  var changeTo = this.changeTo;
          this.groupCollection.each(function(group){
        	  var view = new GroupListEntryView({model: group, call: changeTo});
        	  cont.append(view.render().el);
          });    	  
      },
      
      addOne: function(group){
    	  var view = new GroupListEntryView({model: group, call: this.changeTo});
    	  this.groupContainer.append(view.render().el);
    	  //TODO dont know why the "close" content in changed

    	  
    	  
      },
      
      
      createGroup: function(){
    	  var group = new Group();
    	  var groupName = $.trim(this.newGroupName.val());
    	  if(groupName.length > 0){
    		 group.set({name: groupName});
    		 this.groupCollection.add(group);
    		 group.save();
    		 this.newGroupName.val("");
    	  }
    	  
      }
});

var MeetingFieldListView = Backbone.View.extend({
    
    el: '#meetingInformation',

    views: [],
    
    initialize: function() {
      this.options.collection.bind('add',   this.addOne, this);
      this.options.collection.bind('reset', this.addAll, this);
      this.options.collection.bind('remove', this.removeOne, this);
      //this.options.collection.bind('all',   this.render, this);
      
      //this.options.collection.fetch();
    },
    
    getFields: function(){
    	var views = this.views;
    	var fields = [];
    	this.options.collection.each(function(element){
    		var view = views[element];
    		if(view != null)
    			fields.push({title: element.get('text'), value: $.trim($(view.el).find("input").val())});
    		
    	});
    	return fields;
    },
    
    addAll: function() {
      this.options.collection.each(this.addOne);
    },
    
    addOne: function(meetingField) {
    	
      var view = new MeetingFieldView({collection: this.options.collection, model: meetingField });
      $("#meetingInformation").append(view.el);
      this.views[meetingField] = view;
    },
    removeOne: function(meetingField) {
        meetingField.destroy();
        this.views[meetingField] = null;
      }
    
});

var MeetingFieldView = Backbone.View.extend({
    
    tagName: 'tr',
    
    
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    	this.render();
    	var collection = this.options.collection;
    	var model = this.model;
    	$(this.el).find("a").click(function(){
    		collection.remove(model);
    	});
    },
    
      
    render: function() {
    	
    	$(this.el).html(template.meetingView.doMeetingRow( {text: this.model.get("text")}));

      return this;
    },
    remove: function() {
    	
        $(this.el).remove();
    }
});
var MeetingInvitedPeopleEntryView = Backbone.View.extend({
    tagName: "li",
    
    events: {
    	"click .close":  "close",
    },
    
	initialize: function() {
		this.type = this.options.type;
	},
    
    render: function() {
    	
    	if(this.type == "person"){
    		if(this.model.get("type") == "external"){
    			//External person
    			$(this.el).html(template.meetingView.invitedPeopleEntryExternal({name: this.model.get("name")}));
    		}else{
    			$(this.el).html("<li>hola</li>");
    		}
    	}else if(this.type == "group"){
    		//Do group things
    	}

   
    	
      return this;
    },
	
	close: function(){
		this.model.destroy();
		this.remove();
	}
});
var MeetingInvitedPeopleListView = Backbone.View.extend({
    input: null,	
    invitedList: null,
    events: {
    	"click #invite-but":  "invite"
    },
	
	
    initialize: function() {
    	this.invitedPeople = new PeopleList();
    	this.invitedGroups = new GroupList();
    	
        this.invitedPeople.bind('add',   this.addOnePerson, this);
        this.invitedPeople.bind('remove', this.removeOnePerson, this);
        this.invitedGroups.bind('add',   this.addOneGroup, this);
        this.invitedGroups.bind('remove', this.removeOneGroup, this);
        
    },
    
    
    invite: function(){
    	var entryType = this.input.attr("entrytype");
    	if( entryType == "person"){
    		//Do person things
    		var person = new User();
    		person.set({name: $.trim(this.input.val())});
    		this.invitedPeople.add(person);
    	}else if(entryType == "group"){
    		//Do group things
    		var group = new Group();
    		group.set({name: $.trim(this.input.val())});
    		this.invitedGroups.add(group);
    	}else{
    		//External person
    		var person = new User();
    		person.set({type:"external",  name: $.trim(this.input.val())});
    		this.invitedPeople.add(person);
    	}
    	this.input.attr({entrytype: null});
    	this.input.val("");
    },
    
    addOnePerson: function(person) {
      var view = new MeetingInvitedPeopleEntryView({type:"person", model: person });
      this.invitedList.append(view.render().el);
      
    },
    removeOnePerson: function(person) {
        person.destroy();
    },
    
    addOneGroup: function(group) {
    	
        var view = new MeetingInvitedPeopleEntryView({type:"group", model: group });
        this.invitedList.append(view.el);
      },
    removeOneGroup: function(group) {
          group.destroy();
      },
    
    
    render: function() {
    	
    	$(this.el).html(template.meetingView.invitedPeopleList());

    	this.invitedList = $(this.el).find("#invited-people");
    	//


		this.input = $(this.el).find("input");
		
    	this.$el.find("#invitedName-txt").typeahead({
			source: "/autocomplete/contactsGroups",
			onSelect: function(item){
				//self.permissions.add(new Permission({object_id: item.id, name: item.value, read_granted: 1, read_denied: 0}))
				console.log(item)
			}

    	});

    	
      return this;
    }
});

var MeetingListView = Backbone.View.extend({
    
	subSectionId: "meeting-sub",
	buttonClass: "success",
    events: {
    	"click #allMeetings-but":  "showAllMeetings",
    	"click #doMeeting-but":  "doMeeting"
    },
    
    
    initialize: function() {
      this.options.collection.bind('add',   this.addOne, this);
      this.options.collection.bind('reset', this.addAll, this);
      //this.options.collection.bind('all',   this.render, this);
      
      this.options.collection.fetch();
    },
    
    
    addAll: function() {
      this.options.collection.each(this.addOne);
    },
    
    addOne: function(meeting) {
      var view = new MeetingView({model: meeting });
      this.$("#meeting-list").append(view.render().el);
    },
    
    showAllMeetings: function( event ){
    	//this.changeTo(new DoMeetingView({collection: this.options.collection}));
    	//this.changeTo("allMeetings");
    	
    },
    
    doMeeting: function( event ){
    	this.changeTo(this.subSectionId,new DoMeetingView({collection: this.options.collection}));
    }
});

var MeetingView = Backbone.View.extend({
    
    initialize: function() {
    	this.render();
    },
    
      
    render: function() {
    	
    	$(this.el).html(template.meetingView.meeting( this.model.toJSON()));
    	


      return this;
    }
});
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

var MessageFolderNewFormView = Backbone.View.extend({
    
    events: {
    	"click button":  "createFolder",
    },
    initialize: function() {
    	this.folderCollection = this.options.collection;
    	
    },
    
    createFolder: function(){
    	//Only insert if text is written
    	var val = $(this.el).find("#folderName-input").val().trim();
    	var collection = this.folderCollection;
    	if(val.length){
    		var folder = new MessageFolder({name: val});
    		folder.save(null,{success: function(){
    			collection.add(folder);
    		}});
    	}
    	
    	//TODO aqui estoy this.options.collection..destroy();
    },
    render: function() {
    	$(this.el).html(template.messagesView.newFolder());
		
    	

      return this;
    }
});
var MessageFolderOptionsButtonView = Backbone.View.extend({
    tagName: "span",
	subSectionId: "options-sub",
	buttonClass: "primary",
    events: {
    	"click button":  "doOptionsForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.messagesView.folderOptionsButton( ));
    	return this;
    },
    
    doOptionsForm: function( event ){
    	this.changeTo(this.subSectionId,new MessageFolderOptionsFormView({folder: this.options.folder, context: this}));
    }
});

var MessageFolderOptionsFormView = Backbone.View.extend({
    removeWindow: null,
    events: {
    	"click #save-folder-btn":  "saveFolder",
    	"click #remove-folder-btn": "removeFolder",
    },
    initialize: function() {

    	
    },
    
    saveFolder: function(){
    	var name = $.trim($(this.el).find("#folderName-input").val());
    	console.log(name);
    	if(name.length > 0){
    		this.options.folder.set({name:name});
    		this.options.folder.save();
    		this.options.context.backToMain();
    	}
    },
    removeFolder: function(){
    	
    	if(this.removeWindow == null){
    		var modalTemplate = template.messagesView.removeFolderAsk( {folder:this.options.folder.get('name')});
    		var folder = this.options.folder;
	    	this.removeWindow = $(modalTemplate);
	    	var remWin = this.removeWindow;
	    	this.removeWindow.modal({backdrop:true, keyboard: true});
	    	this.removeWindow.find(".remove").click(function(){
	    		folder.destroy({wait: true, error: function(){
	    			alert("Folder cannot be remove because is not empty or is your main folder")
	    		}});
	    		remWin.modal('hide');
	    	});
	    	this.removeWindow.find(".cancel").click(function(){
	    		remWin.modal('hide');
	    	});
    	}
	    this.removeWindow.modal('show');

    },
    render: function() {
    	$(this.el).html(template.messagesView.folderOptions({name:this.options.folder.get('name')}));
		
    	

      return this;
    }
});
var MessageFolderView = Backbone.View.extend({
    
	tagName: "li",
	
	events: {
		//"click #destroy":  "destroyFolder",
		"click .load": "loadFolder"
	},
	
    initialize: function() {
    	//this.render();
    	this.messageContainer = this.options.messageContainer;
    	this.optionsButtonContainer = this.options.optionsButtonContainer;
    	this.model.bind('change', this.modelChanged, this);
    	this.model.bind('destroy', this.removeFolder, this);
    },
    
    modelChanged: function(){
    	$(this.el).find("a").text(this.model.get('name'));
    	this.messageContainer.find("#folderName").text(this.model.get('name'));
    },
    render: function() {
    	$(this.el).html(template.messagesView.messageFolder( this.model.toJSON()) );

      return this;
    },
    
    removeFolder: function(){


    	$(this.el).unbind().remove();
    },
    loadFolder: function(){
    	
    	var messageOptions = new MessageFolderOptionsButtonView({folder: this.model});
    	var messageList = new MessageListView({folder:this.model, messageOptionsBut: messageOptions});
    	
    	var menu = new MultimenuView({original:messageList, subsections:[this.options.newMessageButton,messageOptions,this.options.newFolderButton], el: this.messageContainer});
    	menu.render();
    	//Modifi this.optionsButtonContainer.html(messageOptions.render().el);
    	/*if(this.options.context.messageListView != null){
    		this.options.context.messageListView.trigger("reset","an event");
    	}*/
    	//this.options.context.messageListView.trigger("reset","an event");
    	//this.options.context.messageListView.remove();
    	/*if(this.options.context.messageListView != null)
    		this.options.context.messageListView.unbind();
    	this.options.context.messageListView = new MessageListView({folder:this.model, context: this.options.context});
    	console.log("load "+this.model.get("name"))*/
    	//this.options.context.messageListView.trigger("reset",this.model);
    }
});
var MessageListView = Backbone.View.extend({
    
    events: {
    	"click #check-all": "checkAll",
    	"click #check-none": "checkNone",
    	"click #remove-btn": "removeMessages",
        "click #nextPage-btn": "nextPage",
        "click #previousPage-btn": "previousPage",
    },
    
    /*resetView: function(folder){
    	//this.options.model = folder;
    	console.log("Unbind" +this.options.folder.get('name'));
    	this.unbind("click");
    	//this.collection.unbind('reset');
    	//this.initialize();
    },*/
    initialize: function() {

      this.bind("reset", this.resetView);

      this.collection = new MessageList(null,{folderId:this.options.folder.get('id')});
      this.collection.bind('reset', this.addAll, this);
      this.messageOptionsBut = this.options.messageOptionsBut;
      
    },
    
    render: function(){
    	$(this.el).html(template.messagesView.messageList( {folder: this.options.folder.get('name')}));
    	$(this.el).find("#optButCont").html(this.messageOptionsBut.render().el);

        this.startPageContainer = $(this.el).find("#start-page");
        
        this.nextButton = $(this.el).find("#nextPage-btn").parent();
        this.previousButton = $(this.el).find("#previousPage-btn").parent();
        
        this.collection.fetch();
        return this;
    },
    addAll: function() {
    	this.$("#message-table").html("");
        this.totalPages = this.collection.getTotalPages();
        if(this.totalPages > 0 && this.collection.size() == 0){
        	this.previousPage();
        }else{
        	$(this.el).find("#last-page").text(this.totalPages);
        	this.startPageContainer.text(this.collection.getPage());
        	this.checkNavButtons();
        	this.collection.each(this.addOne);
        }
    },
    
    addOne: function(message) {
      var view = new MessageView({model: message, actionButtons: [$("#move-btn"),$("#remove-btn")] });
      this.$("#message-table").append(view.render().el);
    },
    
    checkAll: function(){
    	$(".ckbox:not(:checked)").click();
    },
    
    checkNone: function(){
    	$(".ckbox:checked").click();
    },
    removeMessages: function(){
    	$(".ckbox").trigger("removeIfChecked", "an event");
    	this.checkNone();
    	//TODO Puede fallar si se tarda mucho en borrar
    	this.collection.fetch();
    },
    
    checkNavButtons: function(){
    	var page = this.collection.getPage();
    	if(page >= this.totalPages){
    		this.nextButton.addClass("disabled");
    	}else{
    		this.nextButton.removeClass("disabled");
    	}
    	
    	if(page == 1){
    		this.previousButton.addClass("disabled");
    	}else{
    		this.previousButton.removeClass("disabled");
    	}
    	
    },
    nextPage: function(){
    	if(this.collection.getPage() < this.totalPages){
    		this.collection.nextPage();
    		this.startPageContainer.text(this.collection.getPage());
    	}
    },
    previousPage: function(){
    	if(this.collection.getPage() > 1){
    		this.collection.previousPage();
    		this.startPageContainer.text(this.collection.getPage());
    	}
    }
});

var MessageView = Backbone.View.extend({
    
	tagName: "tr",
	conversationLoaded: false,
	events: {
		"click #message":  "showConversation",
		"change input": "checkState",
		"removeIfChecked .ckbox": "removeIfChecked"
	},
	
    initialize: function() {
    	this.render();
    },
    
      
    render: function() {
    	$(this.el).html(template.messagesView.message( this.model.toJSON()) );

      return this;
    },
    
    checkState: function(){
    	if($(".ckbox:checked").length > 0){
	    	$.each(this.options.actionButtons, function(i,button){
	    		$(button).removeClass("disabled");
	    		
	    	});
    	}else{
    		$.each(this.options.actionButtons, function(i,button){
    			$(button).addClass("disabled");
	    	});
    	}
    	
    },
    showConversation: function(event){
    	var conversation = $(this.el).find("#conversation");
    	if(!$(event.target).hasClass("ckbox")){
    		if(conversation.is(":visible")){
    			conversation.hide();
    		}else{
    			conversation.show();
    			if(!this.conversationLoaded){
    				var conversationView = new ConversationView({model: this.model});
    				conversation.html(conversationView.render().el);
    				this.conversationLoaded = true;
    			}
    				
    			
    		}
    			
    	}
    		
    	
    },
    
    removeIfChecked: function(){
    	if(this.$(".ckbox:checked").length > 0){
    		//Not necessary because list is reloaded
    		//this.remove();
    		
    		this.model.destroy();
    	}
    }
});
var MessagesSectionView = Backbone.View.extend({
	className: "container-fluid",
    
    initialize: function() {

      this.folderCollection = new MessageFolderList();
      
      
      
    },
    
    render: function(){
    	$(this.el).html(template.section.messages( this.options ));
    	
    	//Use a view because later we will pass the buttonView to the multimenu    	
    	var newMessageButtonView = new NewMessageButtonView();
    	$(this.el).find("#newButton-cont").html(newMessageButtonView.render().el);
    	
    	
    	var newFolderButtonView = new NewFolderButtonView({collection: this.folderCollection});
    	$(this.el).find("#newFolder-cont").html(newFolderButtonView.render().el);
    	//Folder list view will create the multimenu that contains messagelist, newmessageform and folderoptions
    	
    	
    	
    	var folderListView = new MessageFolderListView({collection: this.folderCollection, messageContainer: $(this.el).find("#multimenu"), newFolderButton: newFolderButtonView, newMessageButton: newMessageButtonView, optionsButtonContainer:$(this.el).find("#optionsButton-cont")});
    	$(this.el).find("#folderList").html(folderListView.render().el);

    	/*
    	var newMessageFormView = new NewMessageFormView();
    	var folderOptionsView = new FolderOptionsFormView({folder:folder, context: this});
    	
    	
    	
    	//folderList
    	
    	return this;
    	this.menu = new MultimenuView({original:folderListView, subsections:[messageFormView,folderOptionsView], el: $(this.el).find("#multimenu")});
    	this.menu.render();
    	
		
		//FolderListView will init the messages
		
		
		//Create new folder form
		//TODO corregir esto de la ventana modal
		if($("#newFolderForm").length == 0){
			var modalTemplate = template.messagesView.newFolder();

		    this.newFolderFormModal = $(modalTemplate);
		    this.newFolderFormModal.attr({id: "newFolderForm"});
		    this.newFolderFormModal.modal({backdrop:true, keyboard: true});
		    
		    var form = this.newFolderFormModal;

		    var folderCollection = this.folderCollection;
		    //Insert the new field
		    this.newFolderFormModal.find(".primary").click(function(){
		    	//Only insert if text is written
		    	var val = form.find("input").val().trim();
		    	if(val.length){
		    		var folder = new MessageFolder({name: val});
		    		folder.save();
		    		folderCollection.add(folder);
		    		
		    	}
		    	
		    	form.modal('hide');
		    	form.find("input").val("");
		    });
		    
		    //Cancel button
		    this.newFolderFormModal.find(".secondary").click(function(){
		    	form.modal('hide');
		    	form.find("input").val("");
		    });
		    
		}else this.newFolderFormModal = $("#newFolderForm");
		///////*/
		return this;
    },
    
    showNewMessage: function(){
    	console.log("hola");
    	if(this.messageFormView != null)
    		this.messageFormView.unbind();
    	this.messageFormView = new NewMessageFormView();
    	this.changeTo(this.messageFormView);
    },
    
    showFolderOptions: function(folder){
    	console.log(this.folderOptionsView);
    	if(this.folderOptionsView != null){
    		this.folderOptionsView.unbind();
    		this.folderOptionsView.remove();
    	}
    	this.folderOptionsView = new FolderOptionsFormView({folder:folder, context: this});
    	this.changeTo(this.folderOptionsView);
    	/*console.log("change to "+folder.get("name"))
    	if(this.folderOptionsView[folder.get("name")] == null)
    		this.folderOptionsView[folder.get("name")] = new FolderOptionsFormView({folder:folder, context: this})
    	this.changeTo(this.folderOptionsView[folder.get("name")]);*/
    },
    
    showNewFolder: function(){
    	this.newFolderFormModal.modal('show');
    }
});

var MultimediaSectionView = Backbone.View.extend({
	className: "container-fluid",
    
    initialize: function() {
      this.albumCollection = new AlbumList();
      
      
    },
    
    render: function(){
    	$(this.el).html(template.section.multimedia( this.options ));
    	
    	//Use a view because later we will pass the buttonView to the multimenu
    	/*var newMessageButtonView = new NewMessageButtonView();
    	$(this.el).find("#newButton-cont").html(newMessageButtonView.render().el);
    	*/
    	var newAlbumButtonView = null;
    	if(this.options.profileId == getViewer().get('id')){
    		var newAlbumButtonView = new NewAlbumButtonView({collection: this.albumCollection});
    		$(this.el).find("#newFolder-cont").html(newAlbumButtonView.render().el);
    	}
    	//Folder list view will create the multimenu that contains messagelist, newmessageform and folderoptions
    	
    	
    	var albumListView = new AlbumListView({collection: this.albumCollection, photoContainer: $(this.el).find("#multimenu"), newAlbumButton: newAlbumButtonView, optionsButtonContainer:$(this.el).find("#optionsButton-cont"), profileId:this.options.profileId, albumId: this.options.albumId});
    	$(this.el).find(".well").prepend(albumListView.render().el);
    	
    	/*
    	var newMessageFormView = new NewMessageFormView();
    	var folderOptionsView = new FolderOptionsFormView({folder:folder, context: this});
    	
    	
    	
    	//folderList
    	
    	return this;
    	this.menu = new MultimenuView({original:folderListView, subsections:[messageFormView,folderOptionsView], el: $(this.el).find("#multimenu")});
    	this.menu.render();
    	
		
		//FolderListView will init the messages
		
		
		//Create new folder form
		//TODO corregir esto de la ventana modal
		if($("#newFolderForm").length == 0){
			var modalTemplate = template.messagesView.newFolder();

		    this.newFolderFormModal = $(modalTemplate);
		    this.newFolderFormModal.attr({id: "newFolderForm"});
		    this.newFolderFormModal.modal({backdrop:true, keyboard: true});
		    
		    var form = this.newFolderFormModal;

		    var folderCollection = this.folderCollection;
		    //Insert the new field
		    this.newFolderFormModal.find(".primary").click(function(){
		    	//Only insert if text is written
		    	var val = form.find("input").val().trim();
		    	if(val.length){
		    		var folder = new MessageFolder({name: val});
		    		folder.save();
		    		folderCollection.add(folder);
		    		
		    	}
		    	
		    	form.modal('hide');
		    	form.find("input").val("");
		    });
		    
		    //Cancel button
		    this.newFolderFormModal.find(".secondary").click(function(){
		    	form.modal('hide');
		    	form.find("input").val("");
		    });
		    
		}else this.newFolderFormModal = $("#newFolderForm");
		///////*/
		return this;
    },
    
    showNewMessage: function(){
    	console.log("hola");
    	if(this.messageFormView != null)
    		this.messageFormView.unbind();
    	this.messageFormView = new NewMessageFormView();
    	this.changeTo(this.messageFormView);
    },
    
    showFolderOptions: function(folder){
    	console.log(this.folderOptionsView);
    	if(this.folderOptionsView != null){
    		this.folderOptionsView.unbind();
    		this.folderOptionsView.remove();
    	}
    	this.folderOptionsView = new FolderOptionsFormView({folder:folder, context: this});
    	this.changeTo(this.folderOptionsView);
    	/*console.log("change to "+folder.get("name"))
    	if(this.folderOptionsView[folder.get("name")] == null)
    		this.folderOptionsView[folder.get("name")] = new FolderOptionsFormView({folder:folder, context: this})
    	this.changeTo(this.folderOptionsView[folder.get("name")]);*/
    },
    
    showNewFolder: function(){
    	this.newFolderFormModal.modal('show');
    }
});


var MultimenuView = Backbone.View.extend({
    
    lastView: null,
    initialize: function() {
    	
  
      for(i=0; i < this.options.subsections.length; i++){
    	  this.options.subsections[i].changeTo = this.changeTo;
    	  this.options.subsections[i].backToMain = this.backToMain;
      }
      this.options.original.changeTo = this.changeTo;
	  this.options.original.backToMain = this.backToMain;
    },
	
    render: function(){
    	this.options.original.render();
    	$(this.el).html(template.appView.multimenu( {subsections:this.options.subsections} ));
    	$(this.el).find("#original").html(this.options.original.el);
    	return this;
    },
    
    backToMain: function(){
    	$(".submenu:visible").fadeOut();
		$("#original").slideDown();
		if(this.lastView != null){
    		this.lastView.unbind();
			this.lastView.remove();
    	}
    },
    changeTo: function( subsectionId, view ){
    	var subsection = $("#" + subsectionId);
    	
    	var isVisible =  subsection.is(":visible");
    	//Hide the visible subsection
    	$(".submenu:visible").hide();

    	if( isVisible ){
    		//Show because it was hidden before
    		subsection.show();
    		
    	}else{
    		//New load of this section
    		subsection.find(".subSection-content").html(view.render().el);
    		subsection.fadeIn(function(){
    			if(this.lastView != null){
    				this.lastView.unbind();
    				this.lastView.remove();
    			}
    			this.lastView = view;
    		});
    		
    		$("#" + subsectionId + " .back-but").click(function(){
        		subsection.fadeOut();
        		$("#original").slideDown();
        	});
    		
    	}
    	
    		
    	
    	$("#original:visible").slideUp();
    	
    }
});

var NewAlbumButtonView = Backbone.View.extend({
    
	subSectionId: "newFolder-sub",
	buttonClass: "info",
    events: {
    	"click button":  "doShowNewFolderForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.multimediaView.newAlbumButton( ));
    	return this;
    },
    
    doShowNewFolderForm: function( event ){
    	this.changeTo(this.subSectionId,new AlbumNewFormView({collection: this.options.collection}));
    }
});
var NewFolderButtonView = Backbone.View.extend({
    
	subSectionId: "newFolder-sub",
	buttonClass: "info",
    events: {
    	"click button":  "doShowNewFolderForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.messagesView.newFolderButton( ));
    	return this;
    },
    
    doShowNewFolderForm: function( event ){
    	this.changeTo(this.subSectionId,new MessageFolderNewFormView({collection: this.options.collection}));
    }
});
var NewMessageButtonView = Backbone.View.extend({
    
	subSectionId: "new-sub",
	buttonClass: "success",
    events: {
    	"click button":  "doShowNewMessageForm"
    },
    
    
    initialize: function() {

    },
    
    render: function(){
    	$(this.el).html(template.messagesView.newMessageButton( ));
    	return this;
    },
    
    doShowNewMessageForm: function( event ){
    	this.changeTo(this.subSectionId,new NewMessageFormView());
    }
});
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
var NewnessCommentView = Backbone.View.extend({
	tagName:"tr",
	events:{
		"click #commentRemove": "destroyModel"
	},
	
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    },
    
    remove: function() {
     },
     
     destroyModel: function(){
    	 var self = this;
    	 this.model.destroy({
    		 wait: true,
    		 success: function(model, response) {
    			 self.$el.find('#commentRemove').tooltip('hide')
    			 self.$el.remove();
    		 },
    		 error: function(model, response) {
    			  alert("Error while deleting comment")
    		 }
    	 });
    	 
    	 
     },
      
    render: function() {
    	//TODO hacer que esto cambie
    	$(this.el).html(template.newnessView.newnessComment( this.model.toJSON() ));
    	if(this.model.get("owner")){
    		/***** Hover ******/
        	if(this.model.get('owner')){
        		this.$el.unbind('hover');
    	    	var options = this.$el.find("#newnessCommentOptions");
    	    	this.$el.hover(function(){
    	    		
    	    		options.show();
    	    	},
    	    	function(){
    	    		options.hide();
    	    	});
    	    	//Tooltip
    	    	this.$el.find('#commentRemove').tooltip()
        	}
        	
    		
    	}
    	
      return this;
    }
      
});
var NewnessListView = Backbone.View.extend({
    
	newnessContainer: null,
	profileId: null,
	input: null,
	page: 1,
	linkEnabled: false,
    events: {
    //	"keypress #new-share":  "createOnEnter",
    		"focus #fakeContent input": "toogleRealContent",
    		"click .closeAllowed": "removeAllowed",
    		//"click #addLink": "addLink",
    		"click #closeUpdate": "toogleRealContent",
    		"click #shareUpdate": "shareUpdate",
    		"click #more-newness":  "loadMoreNewness"
    },
    
    
    initialize: function() {
      this.collection.bind('add',   this.addOne, this);
      this.collection.bind('reset', this.addAll, this);
      this.profileId = this.options.profileId;
      //this.options.collection.bind('all',   this.render, this);

    },
    
    render: function(){
    	$(this.el).html(template.newnessView.newnessList(this.options));
    	this.newnessContainer = $(this.el).find("#newness-container");
    	
    	this.loadMoreNewness();
    	this.input = $(this.el).find("#new-share");
    	//REMOVE WHEN ADD EVENTS
    	this.$el.find(".updateAction").css({ 'opacity' : 0.25 });

    	
    	return this;
    },
    loadMoreNewness: function(){
    	var self = this;
    	if(!this.$el.find("#more-newness").hasClass("disabled")){
	    	this.collection.fetch({ data:{page: this.page, id: this.profileId}, success: function(){
	    		if(self.collection.size() == 0){
	    			self.$el.find("#more-newness").addClass("disabled");
	    		}
	    	}});
	    	this.page = this.page + 1;
    	}
    },
    shareUpdate: function(e) {
    	var allowedGroups = new Array()
    	
    	var text = $.trim(this.input.val());
    	if(text.length > 0){
    		this.permissions.each(function(permission){
        		allowedGroups.push(permission.get("object_id"));
            });
    		
	      var newness = new Newness();
	      var collection = this.collection;
	      newness.save({body: text, groups: allowedGroups},{success: function(){
	    	  collection.add(newness);
	      }
	      });
	
	      this.input.val('');
	      this.toogleRealContent();
      }
    },
    
    addAll: function() {
      var cont = this.newnessContainer;
      this.collection.each(function(newness){
    	  var view = new NewnessView({model: newness});
          cont.prepend(view.render().el);
      });
    },
    
    addOne: function(newness) {
      var view = new NewnessView({model: newness});
      this.newnessContainer.prepend(view.render().el);
    },
    
    removeAllowed: function(event){
		$(event.target).parent().parent().remove();
		
	},
	
	/* Add default permissions */
    addAllPermissions: function(){
    	this.permissionContainer = this.$el.find("#allowedToUpdates");
    	var self = this;
    	this.permissions.each(function(permission){
		  if(permission.get("type")=="group")
			  self.addOnePermission(permission,self);
        });
    },
    
    addOnePermission: function(permission){
    	if(permission.get("read_granted") == 1 && permission.get("read_denied") == 0)
    		this.permissionContainer.append(new AlertPermissionView({model: permission}).render().el)
    },
    ////////////////////////
    
	toogleRealContent: function(){
		if(this.permissions == null){
	    	this.permissions = new PermissionList();
	    	this.permissions.url = this.permissions.url+"ItemContainer/"+getViewer().get("updatesAlbumId");
	    	//
	    	this.permissions.bind('add',   this.addOnePermission, this);
	        this.permissions.bind('reset', this.addAllPermissions, this);
	        this.permissions.fetch();
	        
	        var self = this;
	        //Autocomplete
	    	this.$el.find("#allowedToInput").typeahead({
				source: "/autocomplete/groups",
				onSelect: function(item){
					self.permissions.add(new Permission({object_id: item.id, name: item.value, read_granted: 1, read_denied: 0}))
					
				}

	    	});
		}
		
		var fakeContent = this.$el.find("#fakeContent");
		
		if(fakeContent.is(":visible")){
					this.$el.find("#fakeContent").hide();
					this.$el.find("#content").show().find("textarea").focus();
		}else{
				this.$el.find("#fakeContent").show();
				this.$el.find("#content").hide();
		}
	},
	
	addLink: function(){
			var form = this.$el.find("#addLinkForm");
			if(form.is(":visible")){
				form.hide()
				this.$el.find(".updateAction").css({ 'opacity' : 1 });
			}else{
				form.show().find("input").focus();
				this.$el.find(".updateAction").css({ 'opacity' : 0.25 });
				this.$el.find("#addLink").css({ 'opacity' : 1 });
			}
	}
});


var NewnessView = Backbone.View.extend({
	events:{
		"keypress #comment": "commentOnEnter",
		"click #doComment": "showCommentForm",
		"click #like": "doLike",
		"click #dlike": "doDlike",
		"click #cancelLike" : "cancelLike",
		"click #cancelDlike" : "cancelDlike",
		"click #updateOptions": "toogleOptions",
		"click #updateRemove": "updateRemove",
	},
    initialize: function() {
    	//this.model.bind('destroy', this.remove, this);
    	this.commentList = new NewnessCommentList();
    	
    	this.commentList.bind('add',   this.addOne, this);
        this.commentList.bind('reset', this.addAll, this);
    },
    
    
    addAll: function() {
        var cont = this.commentListContainer;
        this.commentList.each(function(comment){
      	  var view = new NewnessCommentView({model: comment});
            cont.prepend(view.render().el);
        });
      },
      
      addOne: function(comment) {
        var view = new NewnessCommentView({model: comment});
        this.commentListContainer.prepend(view.render().el);
      },
      
      
    updateRemove: function() {
    	var self = this;
    	
        $(this.el).fadeOut(function(){
        	self.$el.find('#updateRemove').tooltip('hide')
        	self.$el.remove()
        });
        this.model.destroy()
     },
     
     toogleOptions: function(){
    	 
     },
      
    render: function() {
    	$(this.el).html(template.newnessView.newness(this.model.toJSON()));
    	this.commentInput = $(this.el).find("#comment");
    	
    	//Like buttons
    	this.likeForm = $(this.el).find("#likeForm");
    	this.likeit = $(this.el).find("#likeit");
    	this.dlikeit = $(this.el).find("#dlikeit");
    	this.totalLikes = $(this.el).find("#totalLikes");
    	this.totalDlikes = $(this.el).find("#totalDlikes");
    	/////////////
    	
    	//this.commentList.fetch({data:{id: this.model.get('id') }});
    	this.commentListContainer = $(this.el).find("#comments");
    	this.commentList.reset( this.model.get("comments") );
    	/*var cont = commentListContainer = $(this.el).find("#comments");
    	this.commentList.each(function(comment){
    		var view = new NewnessCommentView({model: comment});
            cont.append(view.render().el);
    	});*/
    	
    	/***** Hover ******/
    	if(this.model.get('owner')){
	    	var options = this.$el.find("#newnessOptions");
	    	this.$el.hover(function(){
	    		
	    		options.show();
	    	},
	    	function(){
	    		options.hide();
	    	});
	    	//Tooltips
	    	this.$el.find('#updateOptions').tooltip()
	    	this.$el.find('#updateRemove').tooltip()
    	}
    	
    	
    	
      return this;
    },
    
    showCommentForm: function(){
    	if(this.commentInput.is(":visible"))
    		this.commentInput.hide();
    	else
    		this.commentInput.show();
    },
    commentOnEnter: function(e) {
        var text = this.commentInput.val();
        if (!text || e.keyCode != 13) return;

        
        var comment = new NewnessComment({updateId:this.model.get("id"), body: this.commentInput.val(), owner: true});
        var localThis = this;
        comment.save({},
        {success: function(){
        		localThis.addOne(comment);
        	}
        });
        
        this.commentInput.val('');
        this.commentInput.hide();
      },
      
      doLike: function(){
    	  var vote = new Vote();
    	  var self = this;
    	  vote.save({vote:1, objectType:"ProfileUpdate", object_id:this.model.get("id")},{
    		  wait: true,
    		  success: function(){
    			  self.likeForm.hide();
    			  self.likeit.show();
    			  var nLikes = parseInt(self.totalLikes.find("span").text()) + 1;
    			  self.totalLikes.find("span").text(nLikes);
    			  self.totalLikes.show();
    			  
    		  },error: function(){
    			  alert("Error");
    		  }
    		  
    	  });
      },
      
      doDlike: function(){
    	  var vote = new Vote();
    	  var self = this;
    	  vote.save({vote:0, objectType:"ProfileUpdate", object_id:this.model.get("id")},{
    		  wait: true,
    		  success: function(){
    			  self.likeForm.hide();
    			  self.dlikeit.show();
    			  var nDlikes = parseInt(self.totalDlikes.find("span").text()) + 1;
    			  self.totalDlikes.find("span").text(nDlikes);
    			  self.totalDlikes.show();
    		  },error: function(){
    			  alert("Error");
    		  }
    		  
    	  });
      },
      
      cancelLike: function(){
    	  var vote = new Vote({id: 1, vote:1, objectType:"ProfileUpdate", object_id:this.model.get("id")});
    	  var self = this;
    	  //Assign and id to make delete request
    	  vote.destroy({
    		  wait: true,
    		  success: function(){
    			  self.likeForm.show();
    			  self.likeit.hide();
    			  var nLikes = parseInt(self.totalLikes.find("span").text()) - 1;
    			  self.totalLikes.find("span").text(nLikes);
    			  if(nLikes == 0)
    				  self.totalLikes.hide();
    		  },error: function(){
    			  alert("Error");
    		  }
    		  
    	  });
      },
      
      cancelDlike: function(){
    	  var vote = new Vote({id: 0, vote:0, objectType:"ProfileUpdate", object_id:this.model.get("id")});
    	  var self = this;
    	  //Assign and id to make delete request
    	  vote.destroy({
    		  wait: true,
    		  success: function(){
    			  self.likeForm.show();
    			  self.dlikeit.hide();
    			  var nDlikes = parseInt(self.totalDlikes.find("span").text()) - 1;
    			  self.totalDlikes.find("span").text(nDlikes);
    			  if(nDlikes == 0)
    				  self.totalDlikes.hide();
    		  },error: function(){
    			  alert("Error");
    		  }
    		  
    	  });
      }
      
});
var NotificationListView = ListView.extend({
    
    addOne: function(notification){
    	this.list.append(new NotificationView({model:notification}).render().el);
    	
    },
    
    render: function(){
    	$(this.el).html(template.notificationView.list());
    	this.list = $(this.el).find("#notificationList");
    	this.options.collection.fetch();
    	return this;
    }
});

var NotificationView = Backbone.View.extend({
    
	tagName: "li",
    render: function() {
    	
    	$(this.el).html(template.notificationView.notification( this.model.toJSON()));

      return this;
    }
});
var PermissionManagerSimpleView = Backbone.View.extend({

	
    initialize: function() {
    	this.permissionList = new PermissionList();
    	this.permissionList.bind('add', this.addPermission, this);
    	//this.render();
    /*	this.photoContainer = this.options.photoContainer;
    	this.model.bind('change', this.modelChanged, this);
    	this.model.bind('destroy', this.removeAlbum, this);*/
    },
    
    addPermission:function(permission){
    	this.$el.find("#permissionList").append(new PermissionSimpleEntryView({model: permission}).render().el);
    },
    
    render: function() {
    	var self = this;
    	//TODO me llego por aquí, estandarizar lo de los permisos
    	$(this.el).html( template.permission.simple() );
    	this.$el.find("#contactSearch").typeahead({
    		source: "/autocomplete/contactsGroups",
    		onSelect: function(item){
    			var permission = new Permission({objectId: self.model.get('id'), objectType:"TIPO", identity_id: item.id, type: item.data, name: item.value})
    			self.permissionList.add(permission)
		
    		}

    	});

      return this;
    }
});
var PermissionRowView = Backbone.View.extend({
    tagName:"tr",

    
    
    initialize: function() {
    	

    },

    
    render: function(){
    	$(this.el).html(template.preferencesView.permissionRow( {permission: this.model.toJSON()} ));
    	return this;
    }
});

var PermissionSimpleEntryView = Backbone.View.extend({
    tagName: "tr",
    events:{
    	"click #remove-btn":"removePermission",
    	"click #save-btn":"savePermission",
    	"change .perm": "updatePermission",
    },
    
    updatePermission: function(event){
    	var target = $(event.target);
    	if(target.hasClass("rg")){
    		this.model.set({read_granted: this.model.get('read_granted')==1?0:1})
    	}else if(target.hasClass("rd")){
    		this.model.set({read_denied: this.model.get('read_denied')==1?0:1})
    	}else if(target.hasClass("wg")){
    		this.model.set({write_granted: this.model.get('write_granted')==1?0:1})
    	}else if(target.hasClass("wd")){
    		this.model.set({write_denied: this.model.get('write_denied')==1?0:1})
    	}
    },
    removePermission: function(){
    	var self = this;
    	
    	this.model.set({read_granted: 0})
		this.model.set({read_denied: 0})
		this.model.set({write_granted: 0})
		this.model.set({write_denied: 0})
		
    	this.model.save(null,{success:function(){
    		self.remove();
    	},error: function(){
    		alert("Error while removing permission")
    	}});
    },

    savePermission: function(){
    	
    	
    	//this.model.set({read_granted:})
    	var btn = this.$el.find("#save-btn");
    	var self = this;
    	this.model.save(null,{success: function(){
    		btn.tooltip('show')
        	setTimeout(function(){btn.tooltip('hide')},2000);
			self.$el.find("#remove-btn").removeClass("disabled");
    	}, error: function(){
    		alert("Error while changing permissions")
    	}});
    },
    
    render: function() {
    	$(this.el).html(template.permission.simpleEntry(this.model.toJSON()));

    	var btn = this.$el.find("#save-btn");
    	btn.tooltip({trigger: "manual"})
    	btn.tooltip('hide')
    	
      return this;
    }
});
var PersonalInformationView = Backbone.View.extend({
    
	events: {
    	"click #save-but": "saveChanges",
    	"click #close-success": "closeSuccess"
    },
	
    initialize: function() {
    	this.user = getViewer();
    },
    
      
    render: function() {
    	var user = this.user;
    	$(this.el).html(template.preferencesView.personalInformation({firstName: user.get("firstName"), lastName:user.get("lastName"), email: user.get("email")} ));
    	this.notificationSuccess = $(this.el).find("#notif-success");

      return this;
    },
    
    saveChanges: function(){
    	var body = $(this.el);
    	var notif = this.notificationSuccess;
    	this.user.save({firstName: body.find("#firstName").val(), lastName: body.find("#lastName").val()},{
    		success:function(){
    			notif.show();
    		}
    	});
    },
    
    closeSuccess: function(){
    	this.notificationSuccess.hide();
    }
});
var PhotoListView = Backbone.View.extend({
    
    events: {
    	"click #check-all": "checkAll",
    	"click #check-none": "checkNone",
    	"click #remove-btn": "removePhotos",
        "click #nextPage-btn": "nextPage",
        "click #previousPage-btn": "previousPage",
    },
    
    /*resetView: function(folder){
    	//this.options.model = folder;
    	console.log("Unbind" +this.options.folder.get('name'));
    	this.unbind("click");
    	//this.collection.unbind('reset');
    	//this.initialize();
    },*/
    initialize: function() {

      this.bind("reset", this.resetView);

      this.collection = new PhotoList(null,{folderId:this.options.album.get('id')});
      this.collection.bind('reset', this.addAll, this);
      this.optionsBut = this.options.optionsBut;
      this.isOwner = this.optionsBut != null;
    },
    
    render: function(){
    	$(this.el).html(template.multimediaView.photoList( {folder: this.options.album.get('name'), owner: this.isOwner}));
    	if(this.optionsBut != null){ //Viewer is the owner
    		$(this.el).find("#optButCont").html(this.optionsBut.render().el);
    	}

        this.startPageContainer = $(this.el).find("#start-page");
        
        this.nextButton = $(this.el).find("#nextPage-btn").parent();
        this.previousButton = $(this.el).find("#previousPage-btn").parent();
        this.collection.fetch();
        return this;
    },
    addAll: function() {
    	this.$("#photo-list").html("");
        this.totalPages = this.collection.getTotalPages();
        if(this.totalPages > 0 && this.collection.size() == 0){
        	this.previousPage();
        }else{
        	$(this.el).find("#last-page").text(this.totalPages);
        	this.startPageContainer.text(this.collection.getPage());
        	this.checkNavButtons();
        	this.collection.each(this.addOne, this);
        }
    },
    
    addOne: function(photo) {
      var view = new PhotoView({model: photo, actionButtons: [$("#move-btn"),$("#remove-btn")], isOwner: this.isOwner });
      //var view = new MessageView({model: message, actionButtons: [$("#move-btn"),$("#remove-btn")] });
      this.$("#photo-list").append(view.render().el);
    },
    
    checkAll: function(){
    	$(".ckbox:not(:checked)").click();
    },
    
    checkNone: function(){
    	$(".ckbox:checked").click();
    },
    removePhotos: function(){
    	$(".ckbox").trigger("removeIfChecked", "an event");
    	this.checkNone();
    	//TODO Puede fallar si se tarda mucho en borrar
    	this.collection.fetch();
    },
    
    checkNavButtons: function(){
    	var page = this.collection.getPage();
    	if(page >= this.totalPages){
    		this.nextButton.addClass("disabled");
    	}else{
    		this.nextButton.removeClass("disabled");
    	}
    	
    	if(page == 1){
    		this.previousButton.addClass("disabled");
    	}else{
    		this.previousButton.removeClass("disabled");
    	}
    	
    },
    nextPage: function(){
    	if(this.collection.getPage() < this.totalPages){
    		this.collection.nextPage();
    		this.startPageContainer.text(this.collection.getPage());
    	}
    },
    previousPage: function(){
    	if(this.collection.getPage() > 1){
    		this.collection.previousPage();
    		this.startPageContainer.text(this.collection.getPage());
    	}
    }
});

var PhotoSectionView = Backbone.View.extend({
    className: "container-fluid",

    permissionsFetched: false,
    modalWindow: null,
    
    events: {

        "click .right": "nextPhoto",
        "click .left": "prevPhoto",
        "click #setTitle": "setTitle",
        "click #setPhoto": "setPhotoProfile",
        "click #saveModalChanges": "saveModalWindowData",
        "click #managePermission": "managePermission",
        "click #backToPhoto:": "managePermission"
    },
    
    managePermission: function(){
    	
    	if($("#carouselContainer").is(":visible")){
    		$("#carouselContainer").hide();
    		$("#permissionContainer").fadeIn();
    	}else{
    		$("#permissionContainer").hide();
    		$("#carouselContainer").fadeIn();
    		
    	}
    	
    	if(this.permissionsFetched == false){
	    	this.permissions.fetch();
	    	var self = this
	    	this.permissionsFetched = true
	    	this.$el.find("#newPermissionEntity").typeahead({
				source: "/autocomplete/contactsGroups",
				onSelect: function(item){
					self.permissions.add(new Permission({isNew: true, read_granted:1, read_denied:0, write_granted:1, write_denied:0, object_id: self.photoId ,type: item.data, object_type: "MediaItem", entity_id: item.id, name: item.value}));
					
				}

	    	});
    	}
    	
    },
    setPhotoProfile: function(){
    	var self = this
    	viewer = getViewer();
    	viewer.save({mainMediaItem: this.photoId},
    		{
    			success: function(){
    				self.$el.find("#photoSuccess").show();
    			},
    			error: function(){
    				alert("Error");
    			}
    		}
    	);
    },
    nextPhoto: function(){
    	if(this.nextPhoto != null)
    		location.href="#photo/"+this.nextPhoto;
    },
    prevPhoto: function(){
    	if(this.prevPhoto != null)
    		location.href="#photo/"+this.prevPhoto;
    },
    
    addAllPermissions: function(){
    	this.permissionContainer = this.$el.find("#permissionsBody");
    	var self = this;
    	this.permissions.each(function(permission){
      	  self.addOnePermission(permission,self);
        });
    	//console.log(permission.get('id'))
    },
    
    addOnePermission: function(permission){
    	this.permissionContainer.append(new PermissionSimpleEntryView({model: permission}).render().el)
    },
    
    initialize: function() {
    	this.photoId = this.options.photoId;
    	this.permissions = new PermissionList();
    	this.permissions.url = this.permissions.url+"MediaItem/"+this.photoId;
    	//
    	this.permissions.bind('add',   this.addOnePermission, this);
        this.permissions.bind('reset', this.addAllPermissions, this);
    	//
    	
    	
    },
    
    saveModalWindowData: function(){
    	this.photo.set({name: this.$el.find("#newTitle").val(),
    					description: this.$el.find("#newDescription").val()});
    	this.photo.save();
    },
    setTitle: function(){
    	if(this.modalWindow == null){
    		this.modalWindow = this.$el.find("#setTitleModal").modal();
    	}else
    		this.modalWindow.modal('show');
    },
    
    photoChanged: function(photo){
    	if(photo.get('description')!= null && photo.get('description').length > 0){
    		this.$el.find(".carousel-caption").show().find("p").text(photo.get('description'));
    	}else
    		this.$el.find(".carousel-caption").hide();
    	
    	if(photo.get('name')!= null && photo.get('name').length > 0){
    		this.$el.find("#photoTitleTop").text(photo.get('name')).show();
    	}else
    		this.$el.find("#photoTitleTop").hide();
    },
    
    
    render: function(){
    	
    	
    	var self = this;
    	
    	$.getJSON("photo/"+this.options.photoId,function(data){
    				
    		$(self.el).html(template.section.photo( data ));
    		
        	self.photo = new PhotoPreview({id: data.id});
        	self.photo.on('change', self.photoChanged, self)
        	
    		var commentList = new CommentListView({photoId: data.id});

    	
    		self.nextPhoto = data.next;
    		self.prevPhoto = data.prev;
    		$(self.el).find("#commentContainer").append(commentList.render().el);
    		
    		var photo = $(self.el).find("#photoContainer").find("img");
    		var photoTagger = new PhotoTagListView({tags: data.tags,photo: photo, el: $(self.el).find("#tagList")});
    		photoTagger.render();
        	

        	self.$el.find("#tagDesc").tooltip({placement: "bottom"});
        	
        	self.photo.set({description: data.description, name: data.name})
        	
    	});
    	
    	    
		return this;
    }
    

});

var PhotoTagListView = Backbone.View.extend({
    
    initialize: function(options) {

    	//Lista de etiquetas
    	this.tagList = new PhotoTagList();
    	
        this.tagList.bind('add',   this.addOne, this);
        this.tagList.bind('reset', this.addAll, this);

        this.photo = this.options.photo;
      
    },
    
    render: function(){
    	
    	var posicion = null;
    	this.tagListContainer = $(this.el);
    	var photo = this.options.photo;

    	var tagList = this.tagList;
    	var selector = $("<div><div style='border:4px solid rgba(255, 255, 255, 0.8); width:92px; height:92px; border-radius:4px 4px 4px 4px;'></div></div>"); //Cuadrado
    	var autocomplete = $('<input type="text" data-provide="typeahead" style="margin: 0 auto;" class="span3">'); //Input
    	
    	var form = $("<div class='well span'>"); //Input decorado
    	form.append(autocomplete);
    	var tagger =$("<div id='tagger' align='center'>");//Objeto completo
    	
    	tagger.css({
    			position:"absolute"
    			
    		});
    		
    	
    	selector.css({

    			width: "100px",
    			height: "100px",
    			border: "1px solid #000000",
    			"border-radius": "4px 4px 4px 4px"
    	});
    	
    	
    	var indicador = selector.clone();
    	indicador.hide();
    	this.indicator = indicador;

    	
    	
    	
    	tagger.append(selector);
    	tagger.append(form);
    	/*photo.before(tagger);
    	photo.before(indicador);
    	*/
    	$("#content").append(tagger);
    	$("#content").append(indicador);

    	
    	
    	photo.click(reallocate);
    	tagger.click(function(e){
    		
    		if(!$(e.target).hasClass("span3"))
    			reallocate(e);
    	});
    	
    		
    		
    	function reallocate(e){
    		
    		var x = e.pageX - photo.offset().left;
    		var y = e.pageY - photo.offset().top;
    		
    		tagger.show();
    		tagger.position({
    			  my: "center top",
    			  at: "left top",
    			  of: photo,
    			  offset: x+" "+(y - (selector.height()/2)),
    			  collision: "fit"
    			});
    		
    		

    		
    		posicion = {x: x, y: y};
    		autocomplete.focus();
    		

    	}
    	var photo = this.photo;
    	autocomplete.typeahead({
    			source: "/autocomplete/contacts",
    			onSelect: function(item){
    				tagger.hide();
    				var posicionLocal = {x: posicion.x, y: posicion.y};
    				var tag = new PhotoTag();

    				tag.save({mediaItemId: photo.attr("mediaItemId"),profileId: item.id, value:item.value, left: posicionLocal.x, top: posicionLocal.y},{
    						success:function(){
    							tagList.add(tag);    							
    						}
    				});
    				indicador.hide();
    			},
    			onBlur: function(){
    				tagger.hide();
    			}
    	});
    	tagger.hide();
    	///End tagger
    	this.tagList.reset(this.options.tags);
    },
    addAll: function() {
    	var cont = $(this.el); 
    	var box = this.indicator;
    	var photo = this.photo;
    	this.tagList.each(function(tag,i){
    	  var view = new PhotoTagView({model: tag, box: box, photo: photo});
          cont.append(view.render().el);
      });  
    },
    
    addOne: function(tag) {
    	
    	var view = new PhotoTagView({model: tag, box: this.indicator, photo:this.photo});

    	$(this.el).append(view.render().el);
    }
   
});

var PhotoTagView = Backbone.View.extend({
    
	tagName: "li",
    events: {
    	"click .removeTag": "removeTag",
    },
    
    removeTag: function(){
    	this.model.destroy();
    	this.remove();
    	this.options.box.hide();
    },
    
    initialize: function(options) {
    	
    	var box = options.box;
    	var self = this;
    	var photo = options.photo;
    	
    	$(this.el).hover(function(){
    			//box.css({top: self.model.get("top") - (box.width()/2) + offset, left:  self.model.get("left") - (box.width()/2), position:"absolute"});
    			if($("#carouselContainer").is(":visible")){
	    			box.show();
	    			box.position({
	      			  my: "center",
	      			  at: "left top",
	      			  of: photo,
	      			  offset: self.model.get("left")+" "+self.model.get("top"),
	      			  collision: "fit"
	      			});
    			}
			},
			function(){
				box.hide();
			}
    	);
		
      
    },
    
    render: function(){
    	$(this.el).html("<a href='javascript:void(0)'>"+this.model.get("value")+" <span href='javascript:void(0)' class='removeTag'>(Remove)</span></a>")
        return this;
    }
    
});

var PhotoUploadResumeEntryView = Backbone.View.extend({
	
	tagName: "li",
    initialize: function() {
    
    },
    
    render: function() {
    	$(this.el).html(template.appView.resumeEntry( {id: this.options.itemId} ));

      return this;
    }
    
});
var PhotoView = Backbone.View.extend({
    
	tagName: "li",
	
	events: {
		"click #message":  "showConversation",
		"change input": "checkState",
		"removeIfChecked .ckbox": "removeIfChecked"
	},
	
    initialize: function() {
    	//this.render();
    	this.isOwner = this.options.isOwner;
    	
    },
    
      
    render: function() {
    	$(this.el).html(template.multimediaView.photo( {id: this.model.get("id"), isOwner: this.isOwner}) );
    	//$(this.el).css("padding-top","65px");
      return this;
    },
    
    checkState: function(){
    	if($(".ckbox:checked").length > 0){
	    	$.each(this.options.actionButtons, function(i,button){
	    		$(button).removeClass("disabled");
	    		
	    	});
    	}else{
    		$.each(this.options.actionButtons, function(i,button){
    			$(button).addClass("disabled");
	    	});
    	}
    	
    },
    showConversation: function(event){
    	if(!$(event.target).hasClass("ckbox"))
    		console.log(event.target);
    },
    
    removeIfChecked: function(){
    	if(this.$(".ckbox:checked").length > 0){
    		//Not necessary because list is reloaded
    		//this.remove();
    		
    		this.model.destroy();
    	}
    }
});
var PreferencesSectionView = Backbone.View.extend({
	className: "container-fluid",
	selected: null,
    events: {
    	"click #personal-lnk":  "loadPersonal",
    	"click #aboutMe-lnk":  "loadAboutMe",
    	"click #favourites-lnk": "loadFavourites",
    	"click #security-lnk": "loadSecurity",
    	"click #customize-lnk": "loadCustomize"
    },
    
    initialize: function() {
      
    },
    
    render: function(){
    	$(this.el).html(template.section.preferences());
    	this.content = $(this.el).find("#bodyContent");
    	this.selected = $(this.el).find("#personal-lnk").parent();
    	this.loadPersonal();
		return this;
    },
    
    loadPersonal: function(e){
    	
    	this.selected.removeClass("active");
    	this.selected = $(this.el).find("#personal-lnk").parent();
    	this.selected.addClass("active");
    	var view = new PersonalInformationView();
    	this.content.html(view.render().el);
    },
    
    loadAboutMe: function(){
    	this.selected.removeClass("active");
    	this.selected = $(this.el).find("#aboutMe-lnk").parent();
    	this.selected.addClass("active");
    	var view = new AboutMeEditView();
    	this.content.html(view.render().el);
    },
    
    loadFavourites: function(){
    	alert("Not available");
    },
    
    loadSecurity: function(){
    	this.selected.removeClass("active");
    	this.selected = $(this.el).find("#security-lnk").parent();
    	this.selected.addClass("active");
    	var view = new SecurityView();
    	this.content.html(view.render().el);
    },
    
    loadCustomize: function(){
    	alert("Not available");
    }
});

var ProfileSectionView = Backbone.View.extend({
	className: "container-fluid",
	user: null,
    events: {
    	"click #newness-pill": "showNewness",
    	"click #aboutMe-pill": "showAboutMe",
    	"click #sendMessage-pill": "showSendMessage",
    	"click #albums-pill": "showAlbums"
    },
    
    initialize: function() {
    	this.userId = this.options.userId;
    	this.favouriteList = new FavouriteList();
    	this.personalInfo = new PersonalInfo();
    	this.favouriteList.bind('reset', this.renderFavourites, this);
    	this.personalInfo.bind('change', this.renderPersonalInfo, this);
    },
    
    renderFavourites: function(){
    	this.favourites.html(template.profileView.favourites( {favourites:this.favouriteList.toJSON() }));
    },
    renderPersonalInfo: function(){
    	this.personalInfoCont.html(template.profileView.personalInformation( this.personalInfo.toJSON() ));
    	

    },
    
    
    
    renderForUser: function(user){
    	
	      
		/*var favouritesList;
		var photos;
		var friends;
		var profileGadget;
		//
  	var newnessList = new NewnessListView({ collection: new NewnessList()});

  	var notificationList = new NotificationListView({ collection: new NotificationList()});

  	var contactSuggestionList = new ContactSuggestionListView({ collection: new ContactSuggestionList()});

  	var nearbyTaskList = new AgendaNearbyTaskListView({ collection: new AgendaNearbyTaskList()});
  	
  	var meetingList = new MeetingListView({ collection: new MeetingList()});
		*/
	      
    },
    
    
    renderProfile: function(user){
    	//Check if the user are allowed
    	if(this.user.get("id") == 0){
    		//Redirect to the user profile
    		location.href = "#profile";
    	}else{
	      this.subSections = this.$(".subSection");
	      this.newnessList = this.$("#newness-list");
	      this.aboutMe = this.$("#aboutMe");
	      this.sendMessage = this.$("#sendMessage");
	      this.albums = this.$("#albums");
	      this.activePill = this.$(".active");
	    
	      
	      this.favourites = $(this.el).find("#favourites-cont");
	      this.favouriteList.fetch({data:{id: this.user.get("id") }});
	      
	      
	      this.personalInfoCont = $(this.el).find("#personalInfo-cont");
	      this.personalInfo.fetch({data:{id: this.user.get("id")}});
	    
	      
	      //personalInfo.html(template.profileView.personalInformation( {name:"cosas"}));
	      
	      this.showNewness(null);
    	}
    },
    
    render: function(){
    	
    	var viewer = getViewer();
    	
    	
//		params.thumbnail = "http://placehold.it/170x150";
		/*params.firstName = user.get("firstName");
		params.lastName = user.get("lastName");
		params.id = user.get("id");
		*/

    	$(this.el).html(template.section.profile({id: viewer.get('id')}));
    	
    	var isOwner = viewer.get("id") == this.userId;

    	if(isOwner){
    		$(this.el).find(".thumbnail").attr({src: "photo/public/"+viewer.get("id")});
    		$(this.el).find("#profileTitle").text( viewer.get("firstName") +" "+ viewer.get("lastName") );
			this.user = viewer;
			this.renderProfile();
    	}else{
    		//Load user data
    		var user = new User({id: this.userId});
    		var localThis = this;
    		user.fetch({success:function(){
    			$(localThis.el).find(".thumbnail").attr({src: "photo/profile/"+viewer.get("id")});
        		$(localThis.el).find("#profileTitle").text( user.get("firstName") +" "+ user.get("lastName") );
    			localThis.user = user;
    			localThis.renderProfile();
    		}});
    		
    	}
    	
	      return this;

    	
    },
    
    changeToSimple: function(subSection,event){
    	//Se hace así (en vez de pasar un objeto nuevo) para sólo cargarlos una vez
    	this.subSections.filter(":visible").hide();
    	
    	subSection.show();
    	this.activePill.removeClass("active");
    	if(event != null)
    		this.activePill = $(event.currentTarget).parent();
    	
    	this.activePill.addClass("active");
    },
    showNewness: function(event){
    	this.changeToSimple(this.newnessList,event);
    	if(this.newness == null){
    		var newness = new NewnessListView({isOwner: this.user.get("isOwner"), name:this.user.get("firstName"), profileId: this.userId, collection: new NewnessList()});
    		this.newness = newness;
    		$(this.el).find("#newness-container").html(this.newness.render().el);
    	}
    	
    	
    },
    showAboutMe: function(event){
    	this.changeToSimple(this.aboutMe,event);
    	if(this.aboutMeView == null){
    		var aboutMeCollection = new AboutMeList();
    		var that = this;
    		
    		aboutMeCollection.fetch({data:{profile: this.user.get("id")},success: function(){
    				that.aboutMeView = new AboutMeView({collection: aboutMeCollection});
    			}
    		});
    		this.aboutMeView = "no null";
    	}
    },
    showSendMessage: function(event){
    	this.changeToSimple(this.sendMessage,event);
    	if(this.sendMessageView == null){
    		/*var aboutMe = new AboutMe();
    		aboutMe.fetch({data:{profile:1}});
    		this.aboutMeView = new AboutMeView({model: aboutMe});*/
    		this.sendMessageView = new NewMessageFormView({
    				to:{ 
    					name: this.user.get("firstName") +" "+this.user.get("lastName"),
    					id: this.user.get("id")
    				}
    		});
    		
    		$(this.el).find("#sendMessage-container").html(this.sendMessageView.render().el);
    		//.html();
    	}
    },
    showAlbums: function(){
    	
    }
});

var QueryResult = Backbone.Model.extend({
	
});


var QueryResultView = Backbone.View.extend({
	
	events: {
		"click #addGroup": "addGroupDialog"
	},
    render: function(){
    	var html = template.searchView.queryResult( this.model.toJSON() );
    	
    	//TODO mejorar esto para eliminar los tag script
    	// si se quiere poner html
    		html = html.replace(/\[b\]/g, '<strong>')
    		html = html.replace(/\[\/b\]/g, '</strong>')
    	//
		$(this.el).html(html);
		$(this.el).css("min-height", "48px");
    	
		//$(this.el).find("button").
		return this;
    },
    
    addGroupDialog: function(){
    	if(this.dialog == null){
    		var self = this;
    		this.dialog = $(template.searchView.addGroupDialog());
    		var dialog = this.dialog;
    		dialog.modal();
    		
    		dialog.find(".cancel").click(function(){
    			dialog.modal('hide');
    		});
    		
    		dialog.find(".add").click(function(){
    			dialog.modal('hide');
    			self.$el.find("#addGroup").remove();
    			$.getJSON('/permission/addGroup/'+self.model.get('id')+'/'+dialog.find("#groupList").val(), function(data){
    				if(data.error)
    					alert("Error while inserting user into the group")
    				else
    					self.$el.find("#groupName").text(dialog.find("#groupList").text()).show();
    			})
    			
    			
    		});
    		
    		core.getGroups(function(groups){
    			var select = dialog.find("#groupList");
    			$.each(groups,function(i,group){
    					select.append("<option value='"+ group.get('id') +"'>"+ group.get('name') +"</option>")
    			})
    			
    		});
    	}else{
    		this.dialog.modal('show');
    	}
        
    }
});



var SearchQuery = PaginatedCollection.extend({
  model: QueryResult,
  baseUrl:"/search/",
  page: null,
  
  url: function() {
	return this.baseUrl + '?' + $.param({q: this.query});
  },
  
  initialize: function(models,options) {
	this.page = 1;
	this.query = options.query;
  }
		  
});


//TODO Hacer pagination view para esto, mensajes y fotos (de momento)
var SearchSectionView = Backbone.View.extend({
    
	query: null,
	searchQuery: null,
	
	className: "container-fluid",
    events: {
    	"click #but-search": "doSearch",
    },

    /*initialize: function() {
    	
    },*/
    
    doSearch: function(){
    	
    	var query = $.trim(this.searchQuery.val());
    	
    	if(query.length){
	    	this.query = new SearchQuery(null, {
	    				query: query 
	    	});
	    	this.query.bind('reset', this.addAll, this);
	    	this.query.fetch();
	    	
	    	$(this.el).find("#resultContainer").show().find("#resultsFor").text(query);
    	}
    	//Avoid redirection on click
    	return false;
    },
    
    addAll: function(){
    	
    	var self = this;
    	self.resultList.html("");
    	
        this.totalPages = this.query.getTotalPages();
        if(this.totalPages > 0 && this.query.size() == 0){
        	this.previousPage();
        }else{
        	this.lastPageContainer.text(this.totalPages);
        	this.startPageContainer.text(this.query.getPage());
        	this.checkNavButtons();
        	
        	self.query.each(function(result){
        		var view = new QueryResultView({model: result});
        		self.resultList.append(view.render().el);
        	});	
        }
        

    	
    },
    
    checkNavButtons: function(){
    	var page = this.query.getPage();
    	if(page >= this.totalPages){
    		this.nextButton.addClass("disabled");
    	}else{
    		this.nextButton.removeClass("disabled");
    	}
    	
    	if(page == 1){
    		this.previousButton.addClass("disabled");
    	}else{
    		this.previousButton.removeClass("disabled");
    	}
    	
    },
    
    render: function(){
		$(this.el).html(template.section.search( this.options ));
    	this.searchQuery = $(this.el).find("#search-query");
    	this.resultList = $(this.el).find("#results");
    	
        this.startPageContainer = $(this.el).find("#start-page");
        this.lastPageContainer = $(this.el).find("#last-page");
        
        this.nextButton = $(this.el).find("#nextPage-btn").parent();
        this.previousButton = $(this.el).find("#previousPage-btn").parent();
        
        if(this.options.query != null){
        	this.searchQuery.val(this.options.query)
        	this.doSearch();
        }
		return this;
    },
    nextPage: function(){
    	if(this.query.getPage() < this.totalPages){
    		this.query.nextPage();
    		this.startPageContainer.text(this.query.getPage());
    	}
    },
    previousPage: function(){
    	if(this.query.getPage() > 1){
    		this.query.previousPage();
    		this.startPageContainer.text(this.query.getPage());
    	}
    }
    

});

/*var RawData = Backbone.Model.extend({
	
});

var CommonThingList = Backbone.Collection.extend({
  model: CommonThing
});

var CityList = Backbone.Collection.extend({
	  model: City
});

var FriendList = Backbone.Collection.extend({
	  model: Friend
});


///Search results
var SearchResult = Backbone.Model.extend({
	
});

var SearchResultList = Backbone.Collection.extend({
	  url: "/search",
	  model: SearchResult
});

var SearchResultListView = Backbone.View.extend({
    
	
    //el: '#search-result',
    
    events: {
    	"click #more-results":  "loadMoreResults"
    },
    
    
    render: function(){
    	$(this.el).html(template.searchView.resultList());
    	this.options.collection.fetch({data:this.options.params});

        return this;
    
    },
    initialize: function() {
      //this.render();
      this.page = 1;
      
      this.options.collection.bind('add',   this.addOne, this);
      this.options.collection.bind('reset', this.addAll, this);
      //this.options.collection.bind('all',   this.render, this);

      var data = this.options.params;
      data.page = 1;
      
    },
    
    loadMoreResults: function(){
    	var data = this.options.params;
    	this.page = this.page + 1;
        data.page = this.page;
        
    	this.options.collection.fetch({ data:data });
    	
    },
    
    addAll: function() {
      this.options.collection.each(this.addOne);
    },
    
    addOne: function(result) {
      var view = new SearchResultView({model: result});
      this.$("#result-container").append(view.render().el);
    }
});

var SearchResultView = Backbone.View.extend({
    
    initialize: function() {
    	this.model.bind('destroy', this.remove, this);
    	
    },
    
    remove: function() {
        $(this.el).remove();
     },
     
     destroyModel: function(){
    	 this.model.destroy();
     },
      
    render: function() {

    	$(this.el).html(template.searchView.searchResult({name: this.model.get("name"), 
    													  city: this.model.get("city"),
    													  thumbnail: this.model.get("thumbnail"),
    													  things: this.model.get("thingsInCommon"),
    													  friends: this.model.get("commonFriends"),
    													  other: this.model.get("other")
    													  }));

      return this;
    }
});

//Form views
var SimpleFormView = Backbone.View.extend({
	
    events: {
    	"click .close": "removeElement"
    },

	removeElement: function(){
		this.remove();
		this.model.destroy();
		
	}
});

var CommonThingFormView = SimpleFormView.extend({
	render: function(){
		$(this.el).html(template.searchView.commonThingRow({name:this.model.get("name") }));
		return this;
	}
});

var FriendFormView = SimpleFormView.extend({
	render: function(){
		$(this.el).html(template.searchView.friendRow({name:this.model.get("name") }));
		return this;
	}
});

var CityFormView = SimpleFormView.extend({
	render: function(){
		$(this.el).html(template.searchView.cityRow({name:this.model.get("name") }));
		return this;
	}
});
////////////
var City = Backbone.Model.extend({
	
});

var Friend = Backbone.Model.extend({
	
});

var CommonThing = Backbone.Model.extend({
	
});

//Used to pack all collections
var SearchQuery = Backbone.Model.extend({
	toJSON: function(){
		var data = {};
		for (i in this.attributes){
			data[i] = this.attributes[i].toJSON();
		}
		return data;
	}
});

var SearchSectionView = Backbone.View.extend({
    
	className: "container-fluid",
    events: {
    	"click #but-search": "clickSearch",
    	"keypress #query": "checkEnter",
    	"change #years": "setAge",
    	"change #other": "setOther",
    	"change #query": "setQuery"
    },

    resultsView: null,
    initialize: function() {
    	//console.log(($("#but-search").length));
      //this.render();
      this.thingList = new CommonThingList();
      this.friendList = new FriendList();
      this.cityList = new CityList();
      
      this.searchQuery = new SearchQuery({thingList: this.thingList, friendList: this.friendList, cityList: this.cityList});
      
      //Thing list
      this.thingList.bind('add',   this.addCommonThing, this);
      this.thingList.bind('remove',   this.doSearch, this);
      //
      //Friend list
      this.friendList.bind('add',   this.addFriend, this);
      this.friendList.bind('remove',   this.doSearch, this);
      //
      //City list
      this.cityList.bind('add',   this.setCity, this);
      this.cityList.bind('remove',   this.doSearch, this);
      //
      
    	
    	//this.doSearch();
    },
    
    
    setCity: function(city){
    	var view =  new CityFormView({model: city });
        $("#city-container").append(view.render().el);
        this.doSearch();
    },
    
    addCommonThing: function(thing){
    	var view =  new CommonThingFormView({model: thing });
        $("#thing-container").append(view.render().el);
        this.doSearch();
    },
    
    addFriend: function(friend){
    	var view =  new FriendFormView({model: friend });
        $("#friend-container").append(view.render().el);
        this.doSearch();
    },
    
    clickSearch: function(context){
    	this.doSearch();
    },
    
    setAge: function(event){
    	this.searchQuery.set({age: new RawData({data:$(event.currentTarget).val()})});
    },
    setQuery: function(event){
    	this.searchQuery.set({query: new RawData({data:$(event.currentTarget).val()})});
    },
    
    setOther: function(event){
    	this.searchQuery.set({other: new RawData({data:$(event.currentTarget).val()})});
    },
    doSearch: function(){
    	//console.log("esto va "+this.mensaje);
    	//console.log(JSON.stringify(this.searchQuery.toJSON()));
    	if(this.resultsView != null)
    		this.resultsView.remove();
    	
    	this.resultsView = new SearchResultListView({collection: new SearchResultList(), params: this.searchQuery.toJSON()});
    	
    	$('#search-result').html(this.resultsView.render().el);
    },
    
    checkEnter: function(event){
    	if(event.keyCode == 13)
    		this.doSearch();
    },
    
    render: function(){
		$(this.el).html(template.section.search( this.options));
		
		//Age filter (only numbers)
		$(this.el).find("#years").keydown(function(e)
        {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
            return (
                key == 8 || 
                key == 9 ||
                key == 46 ||
                (key >= 37 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    	
		//City autocomplete
		/*Para usar con jquery ui
		var setCityCallback = this.setCity;
    	$(this.el).find("#city").autocomplete(
    			{   
    				 source: "/autocomplete/city",
    				 minLength: 2,
    				 //mustMatch: true,
	            	 
    				 select: function( event, ui ) {
    						console.log(ui.item);
    					}
    			}).data("autocomplete")._renderMenu= function( ul, items ) {
    				//var cosa = '<div class="popover fade in below" style="z-index: 1; top: -358px; left: 15px; display: block; width:50px; position: relative"><div class="arrow"></div><div class="inner"><div class="content"></div></div></div>';
    				var cosa = '<div class="popover fade in below"><div class="arrow"></div><div class="inner"><div class="content"></div></div></div>';
    				var self = this;
    				$(ul).append(cosa);
    				//var style = $(ul).attr("style");
    				//$(ul).attr("style","");
    				//$(cosa).attr("style",style);
    				$(cosa).position( {
    					of: $("#city").element
    					});
    				var content = $(cosa).find(".content");
    				//console.log(ul);
    				//console.log($(ul).attr("style"));
    				//cosa.find(".content").append(ul);
    				$.each( items, function( index, item ) {
    					content.append("<div>"+item.label+"</div>");
    					self._renderItem( ul, item );
    				});
    			};
    				/*_renderItem = function( ul, item ) {
    				return $( "<li></li>" )
    				.data( "item.autocomplete", item )
    				.append( "<a>" + item.label + "asfd<br>" + item.desc + "</a>" )
    				.appendTo( ul );
    		};
    				 
    				 
    		
		 //City autocomplete
		var cityList = this.cityList;
    	$(this.el).find("#city").autocomplete("/autocomplete/city",
    			{    minChars: 2,
    				 mustMatch: true,
	            	 formatItem: function(data, i, n) {
	                     return "<div style='height:40px'><a style='margin-left: 10px' href='javascript:void(0)'>" + data[0]+"</a></div>";
	             }

    			}).result(function(event, item) {
    				cityList.add(new City({name: item[0], id: item[1]}));
    				$(this).val("");
    	});   
    	
		
    	/*
        //Common thing autocomplete
    	$(this.el).find("#thing").autocomplete("/datos",
    			{    minChars: 2,
    				 mustMatch: true,
	            	 formatItem: function(data, i, n) {
	            		 
	            		 //return "hola";
	            		 
	            		 
	                     return "<div style='height:40px'><img style='float:left' src='" + data[2] + "'/> <a style='margin-left: 10px' href='javascript:void(0)'>" + data[0]+"</a></div>";
	             }

    			}).result(function(event, item) {
    				thingList.add(new CommonThing({name: item[0], thingId: item[0]}));
    	});   
    	//Common friends autocomplete
    	$(this.el).find("#friend").autocomplete("/datos",
    			{    minChars: 2,
    				 mustMatch: true,
	            	 formatItem: function(data, i, n) {
	            		 
	            		 //return "hola";
	            		 
	            		 
	                     return "<div style='height:40px'><img style='float:left' src='" + data[2] + "'/> <a style='margin-left: 10px' href='javascript:void(0)'>" + data[0]+"</a></div>";
	             }

    			}).result(function(event, item) {
    				friendList.add(new Friend({name: item[0], friendId: item[0]}));
    	});
      //
      
		return this;
    }
});
*/
var SecurityView = Backbone.View.extend({
    
	events: {
    	"click #manageGroups-btn":  "loadGroups"
    },
    initialize: function() {
    	this.permissions = new PermissionList();
    	this.permissions.bind('reset', this.addAll, this);
    	
    	//
    	this.profilePermissions = new PermissionList();
    	this.profilePermissions.url = this.profilePermissions.url+"UserProfile/"+getViewer().get("id");
    	//
    	this.profilePermissions.bind('add',   this.addOneProfilePermission, this);
        this.profilePermissions.bind('reset', this.addAllProfilePermissions, this);
        
        //
    	this.updatesPermissions = new PermissionList();
    	this.updatesPermissions.url = this.updatesPermissions.url+"ItemContainer/"+getViewer().get("updatesAlbumId");
    	//
    	this.updatesPermissions.bind('add',   this.addOneUpdatesPermission, this);
        this.updatesPermissions.bind('reset', this.addAllUpdatesPermissions, this);
    },
    
    loadGroups: function(){
    	this.unbind();
    	
    	var manageGroups = new ManageGroupsView();
    	var groupEdit = new GroupEditView();
    	
    	var menu = new MultimenuView({original:manageGroups, subsections:[groupEdit]});
    	
    	
    	$(this.el).html(menu.render().el);
    },
    
    
    addAll: function() {
    	
    	this.permissions.each(this.addOne);
    },
    
    addOne: function(permission, context) {
      var view = new PermissionRowView({model: permission});
      this.$("#permissionTable").append(view.render().el);
    },
    
    addAllProfilePermissions: function(){
    	
    	this.profilePermissionContainer = this.$el.find("#profilePermissionsBody");
    	var self = this;
    	this.profilePermissions.each(function(permission){
      	  self.addOneProfilePermission(permission,self);
        });
    },
    
    addOneProfilePermission: function(permission){
    	
    	this.profilePermissionContainer.append(new PermissionSimpleEntryView({model: permission}).render().el)
    },
    
    addAllUpdatesPermissions: function(){
    	this.updatesPermissionContainer = this.$el.find("#updatesPermissionsBody");
    	var self = this;
    	this.updatesPermissions.each(function(permission){
      	  self.addOneUpdatesPermission(permission,self);
        });
    },
    
    addOneUpdatesPermission: function(permission){
    	
    	this.updatesPermissionContainer.append(new PermissionSimpleEntryView({model: permission}).render().el)
    },
    
    render: function() {
    	
    	$(this.el).html(template.preferencesView.security());
    	this.permissions.fetch();
    	
    	this.profilePermissions.fetch();
    	this.updatesPermissions.fetch();
    	var self = this
    	this.$el.find("#newProfilePermissionEntity").typeahead({
			source: "/autocomplete/contactsGroups",
			onSelect: function(item){
				self.profilePermissions.add(new Permission({isNew: true, read_granted:1, read_denied:0, write_granted:1, write_denied:0, object_id: getViewer().get("id") ,type: item.data, object_type: "UserProfile", entity_id: item.id, name: item.value}));
				
			}

    	});
    	
    	this.$el.find("#newUpdatesPermissionEntity").typeahead({
			source: "/autocomplete/contactsGroups",
			onSelect: function(item){
				self.updatesPermissions.add(new Permission({isNew: true, read_granted:1, read_denied:0, write_granted:1, write_denied:0, object_id: getViewer().get("updatesAlbumId") ,type: item.data, object_type: "ItemContainer", entity_id: item.id, name: item.value}));
				
			}

    	});
    	
      return this;
    }
});
var StartSectionView = Backbone.View.extend({
    className: "container-fluid",
    initialize: function() {
    	//console.log("StarSection init")
    	this.newnessCollection = new NewnessList();
    	this.notificationCollection = new NotificationList();
    	
    	this.contactSuggestionCollection = new ContactSuggestionList();
    	this.nearbyTaskCollection = new AgendaNearbyTaskList();
    	this.meetingCollection = new MeetingList();
    	
    	//this.subSection.push({id: "profile-sub"});
    },
    
    render: function(){
    	//var params = this.options;
    	//params.thumbnail = window.getViewer().get('thumbnail');
    	$(this.el).html(template.section.start( {id: getViewer().get('id')} ));
    	
    	
    	var newnessList = new NewnessListView({ collection: this.newnessCollection, isOwner:true});
    	var meetingList = new MeetingListView({ collection: this.meetingCollection, el: $(this.el).find("#meetings")});
    	
    	//Preferred way
    	var notificationList = new NotificationListView({ collection: this.notificationCollection});
    	$(this.el).find("#notifications").html(notificationList.render().el);
    	
    	
    	
    	//var contactSuggestionList = new ContactSuggestionListView({ collection: this.contactSuggestionCollection});
    	
    	
    	this.menu = new MultimenuView({original:newnessList, subsections:[meetingList], el: $(this.el).find("#multimenu")});
    	//this.menu = new MultimenuView({original:newnessList, subsections:['profile','search'], el: $(this.el).find("#meetings")});
    	this.menu.render();
		//$(this.el).html(template.section.start( params ));
		
    	//var newnessList = new NewnessListView({ el:$(this.el).find("#newness"), collection: this.newnessCollection});
    	
    	//$(this.el).find("#newness").html(newnessList.render().el);
    	/*var notificationList = new NotificationListView({ collection: this.notificationCollection});

    	var contactSuggestionList = new ContactSuggestionListView({ collection: this.contactSuggestionCollection});

    	var nearbyTaskList = new AgendaNearbyTaskListView({ collection: this.nearbyTaskCollection});
    	
    	var meetingList = new MeetingListView({ collection: this.meetingCollection});*/
		
		return this;
    }
});

var ToolbarView = Backbone.View.extend({

	
	events: {
		//"submit form": "cancelSubmit",
		//"keypress #quick-search-input": "quickSearch"
	},
	
	
	initialize: function() {

	},
  
	quickSearch: function ( event ){
		text = $(event.currentTarget).val();
		
		if(event.keyCode == 13){
			this.options.router.navigate("search/"+text,true);
			return false;
		}
		
	},
	
	
	cancelSubmit: function(){
		console.log("asd")
		return false;
	},
	
	render: function(){
		var self = this;
		$(this.el).find("#uploadBut-cont").html(new UploaderView().render().$el);
		this.$el.find("#quick-search-input").typeahead({
			source: "/autocomplete/contacts",
			onSelect: function(item){
				self.options.router.navigate("profile/"+item.id,true);
			},
			
			onNotFound: function(text){
				self.options.router.navigate("search/"+text,true);
				return false;
			}
	});

	}
	
});
var UploadedResumeView = Backbone.View.extend({
    
	items: new Array(),
    className: "span2 popover fade bottom in",
    content: null,
    events: {
    	"click #resume-but":  "uploadStats",
    	"click .close":  "close"
    },
    
    
    initialize: function() {
    	

    },
	
    
    close: function(){
    	this.unbind();
    	this.remove();
    },
    
    addItem: function(itemId){
    	this.items.push(itemId);
    },
    uploadStats: function(){
    	if(this.content.is(":visible")){
    		this.content.hide();
    	}else{
    		this.content.show();
    	}
    	
    },
    
    render: function(){
    	
    	$(this.el).html(template.appView.uploadResume( ));
    	$(this.el).css({display: "block"})
    	this.content = $(this.el).find(".popover-content");
    	var list = this.content.find("ul");
    	while((item = this.items.shift())){
    		var view = new PhotoUploadResumeEntryView({itemId: item});
    		list.append(view.render().el);
    	}
    	
    	var button = this.options.element;
    	var pos = button.offset();
		var pop = $(this.el);
		$("#navbar").append(pop)
		var height = button.height();
		var width = button.width();
		
		var actualWidth =  pop.width();
        var actualHeight =  pop.height();
        
	    var offset = 25
	    
	    var tp = {top: pos.top + height +offset, left: pos.left + width / 2 - actualWidth / 2}
	    
	    pop.css(tp);
	    $(pop).find("#resume-but").button('toggle');
	    
    	
    }
});

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
var AboutMe = Backbone.Model.extend({
	url: function(){
		  if(this.get("id") != null)
			  return '/profile/extension?id='+this.get("id");
		  else
			  return '/profile/extension';
	  }
});
var AboutMeList = Backbone.Collection.extend({
  model: AboutMe,
  
  url: function(){
	  if(this.get("profile") != null)
		  return '/profile/extension/profile='+this.get("profile");
	  else
		  return '/profile/extension';
  }
});
var AgendaNearbyTask = Backbone.Model.extend({
	
});
var AgendaNearbyTaskList = Backbone.Collection.extend({
  model: AgendaNearbyTask,
  
  url: '/agendaNearbyTasks'
});
var Album = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != null)
			return "/multimedia/album?id="+this.get('id');
		else
			return "/multimedia/album";
	}
});
var AlbumList = Backbone.Collection.extend({
  model: Album,
  url:"/multimedia/album"
});
var CalendarEvent = Backbone.Model.extend({
	
});
var CalendarEventList = Backbone.Collection.extend({
  model: CalendarEvent
});
var Comment = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != undefined)
			return "/photo/comment?id="+this.get('id');
		else
			return "/photo/comment";
	}
});
var CommentList = PaginatedCollection.extend({
  model: Comment,
  baseUrl:"/photo/comment",
  
  initialize: function(models,options) {
	    this.page = 1;
	    this.photoId = options.photoId;
  },
  
  url: function() {
	     return this.baseUrl + '?' + $.param({page: this.page}) + '&' + $.param({photo: this.photoId});
  }

});
var ContactSuggestion = Backbone.Model.extend({
	
});
var ContactSuggestionList = Backbone.Collection.extend({
  model: ContactSuggestion,
  
  url: '/contactSuggestion'
});
var ConversationEntry = Backbone.Model.extend({
	
});
var ConversationEntryList = Backbone.Collection.extend({
  model: ConversationEntry,
  url:"/privateMessage/conversation"
});
var Favourite = Backbone.Model.extend({
	
});
var FavouriteList = Backbone.Collection.extend({
  model: Favourite,
  
  url: '/favourite'
});
var Group = Backbone.Model.extend({

	getMemberList: function(callback){
		if(this.memberList == null){
			this.memberList = new GroupMemberList();
			this.memberList.fetch({data:{id: this.get("id")}, success: callback});
		}else callback(this.memberList)
		
	}
});
var GroupList = Backbone.Collection.extend({
  model: Group,
  url:"/group"
});
var GroupMemberList = Backbone.Collection.extend({
  model: User,
  url: "/groupProfiles"
});
var Meeting = Backbone.Model.extend({
	
});
var MeetingField = Backbone.Model.extend({
	
});
var MeetingFieldList = Backbone.Collection.extend({
  model: MeetingField
});
var MeetingList = Backbone.Collection.extend({
  model: Meeting,
  
  url: '/meeting'
});
var Message = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != undefined)
			return "/privateMessage/message?id="+this.get('id');
		else
			return "/privateMessage/message";
	}
});
var MessageFolder = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != null)
			return "/privateMessage/messageFolder?id="+this.get('id');
		else
			return "/privateMessage/messageFolder";
	}
});
var MessageFolderList = Backbone.Collection.extend({
  model: MessageFolder,
  url:"/privateMessage/messageFolder"
});
var MessageList = PaginatedCollection.extend({
  model: Message,
  baseUrl:"/privateMessage/message"
});
var Newness = Backbone.Model.extend({
	url: function(){
		if(this.get('id') == null){
			return "/newness"
		}else{
			return "/newness/"+this.get('id')
		}
	}
});
var NewnessComment = Backbone.Model.extend({
	url: function(){
		if(this.get("id")){
			console.log(this.get("id"))
			return '/newness/comment/'+this.get("id")
		}
		else
			return '/newness/comment'
	}
});
var NewnessCommentList = Backbone.Collection.extend({
  model: NewnessComment,
  url:"/newness/comment"
});
var NewnessList = Backbone.Collection.extend({
  model: Newness,
  
  url: '/newness'
});
var Notification = Backbone.Model.extend({
	
});
var NotificationList = Backbone.Collection.extend({
  model: Notification,
  
  url: '/notification'
});
var PeopleList = Backbone.Collection.extend({
  model: User
});
var Permission = Backbone.Model.extend({
	url: function(){
		/*if(this.get("id"))
			return "/permission/"+this.get("type")+"/"+this.get("id");
		else
			return "/permission/"+this.get("type");*/
		
		return "/permission/"+this.get("type")+"/"+this.get("entity_id")+"/"+this.get("object_type")+"/"+this.get("object_id");
	}
	
});
var PermissionList = Backbone.Collection.extend({
  model: Permission,
  url: "/permission/",
  parse: function(response) {
	  //TODO hacer que sea homogeneo ya que en los permisos de fotos se envia una cosa y desde security otra
	  if(response.profile == null)
		  return response;
	  
	  var profile = response.profile;
	  for(i = 0; i < profile.length; i++){
		  profile[i]['type'] = "profile";
		  profile[i]['name'] = profile[i]['first_name']+" "+profile[i]['last_name'];
		  
		  var type = profile[i]['object_type'].split("\\");
		  if(type.length > 1)
			  profile[i]['object_type'] = type[type.length-1] 
	  }
	  
	  var group = response.group;
	  for(i = 0; i < group.length; i++){
		  group[i]['type'] = "group";
	  }
	  
	  return profile.concat(group);
  }

});
var PersonalInfo = Backbone.Model.extend({
	url:"/personalInfo"
});
var Photo = Backbone.Model.extend({
	url: function(){
		return "/multimedia/photo?id="+this.get('id'); 
	}
});
var PhotoList = PaginatedCollection.extend({
  model: Photo,
  baseUrl:"/multimedia/photo"
});
var PhotoPreview = Backbone.Model.extend({
	url: function(){
		return "/photo/"; 
	}
});
var PhotoTag = Backbone.Model.extend({
	url: function(){
		if(this.get('id') != null)
			return "/photo/tag/"+this.get('id');
		else
			return "/photo/tag";
	}
});
var PhotoTagList = Backbone.Collection.extend({
  model: PhotoTag,
  baseUrl:"/photo/tag",
  
  /*url: function() {
	     return this.baseUrl + '?' + $.param({page: this.page}) + '&' + $.param({photo: this.photoId});
  }*/

});
var UserList = Backbone.Collection.extend({
  model: User,
  
});
var Vote = Backbone.Model.extend({

	url: function(){
		return "/vote/"+ this.get("vote") +"/"+ this.get("objectType") + "/" + this.get("object_id");
	}
});
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

window.viewer = null;

window.getViewer = function() {
	return core._viewer;
}

core = {}
core._groupCollection = new GroupList();
core.getGroups = function(callback){
	if (core._groupCollection.length == 0){
		core._groupCollection.fetch({success: function(){
			callback(core._groupCollection.toArray())
		}})
	}else{
		callback(core._groupCollection.toArray())
	} 
	
}

function startUp(){
	var app = new AppView();
	$("#app").html(app.el);
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
} 

$(document).ready(function(){
	//Starts the magic	
	//window.viewer = new User({id:57, thumbnail:"http://placehold.it/90x90"});
	core._viewer = new User();
	core._viewer.fetch({success:function(){
		startUp();
	}});
	
	//window.viewer.fetch({url:"/whoAmI"});
	
});
