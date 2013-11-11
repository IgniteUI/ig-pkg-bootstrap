define(["./_default-component"], function (BootstrapComponent) {
	var BootstrapRow = BootstrapRow || BootstrapComponent.extend({
		init: function (options) {
			this._super(options);
			return this;
		},
		render: function (container, descriptor) {
			$(container).empty();
			var $this = this;
			var parent = $("<div></div>").appendTo(container).css("padding", 10), el = descriptor.element, w = "150px";
			// don't hardcode the default number of columns but take it from the running config
			var currentVal, session = descriptor.editorSession;
			if (el.hasClass("row")) {
				currentVal = el.children().length;
			} else {
				currentVal = el.find(".row").children().length;
			}
			/*
			$("<h5></h5>").appendTo(parent).text("Number of columns: " + currentVal).css("color", "white").css("padding-bottom", 10);
			$("<div></div>").appendTo(parent).attr("id", "slider");
			$("#slider").css("width", "80%").slider({
				value: currentVal,
				min: 1,
				max: 12,
				step: 1,
				slide: function( event, ui ) {
					container.find("h5").text("Number of columns: " + ui.value);
					// update code
					// what about columns that already have contents in them - do we just delete that?
				}
			});
			*/
			$("<span class=\"label\">Id: </span><input type=\"text\" class=\"id form-control\"></input>").appendTo(parent).css("width", w);
			$("<span class=\"label\">Classes: </span><input type=\"text\" class=\"classes form-control\"></input>").appendTo(parent).css("width", w);
			$("<h3></h3>").appendTo(parent).text("Grid Layout").addClass("label").css({
				"padding-bottom": 10,
				"display": "block",
				"float": "left"
			});
			// append dropdown with list of layouts
			var dd = $("<div></div>").appendTo(parent).addClass("btn-group");
			var button = $("<button></button").appendTo(dd).attr("type", "button")
				.addClass("btn btn-primary dropdown-toggle").attr("data-toggle", "dropdown");
			button.css("width", w);
			$("<span></span>").appendTo(button).addClass("label").text("Choose Layout ");
			$("<span class=\"caret\"></span>").appendTo(button);
			var list = $("<ul></ul>").appendTo(dd).addClass("dropdown-menu")
				.attr("id", "grid-layout-dd").attr("role", "menu").css("width", w);
			// add list items
			$("<li></li>").appendTo(list).append("<a href=\"#\">6-6</a>");
			$("<li></li>").appendTo(list).append("<a href=\"#\">4-4-4</a>");
			$("<li></li>").appendTo(list).append("<a href=\"#\">4-8</a>");
			$("<li></li>").appendTo(list).append("<a href=\"#\">8-4</a>");
			$("<li></li>").appendTo(list).append("<a href=\"#\">3-3-3-3</a>");
			$("<li></li>").appendTo(list).append("<a href=\"#\">2-10</a>");
			$("<li></li>").appendTo(list).append("<a href=\"#\">10-2</a>");
			$("<li></li>").appendTo(list).append("<a href=\"#\">3-9</a>");
			$("<li></li>").appendTo(list).append("<a href=\"#\">9-3</a>");
			$("<li></li>").appendTo(list).append("<a href=\"#\">Custom</a>");
			$("<input type=\"text\" class=\"custom-layout form-control\"></input>").appendTo(parent).css({
				"width": w,
				"margin-top": 10
			}).hide();
			$("<button></button").appendTo(parent).addClass("btn btn-success").css("width", w)
				.css("margin-top", 20).text("Add Column Span").click(function () {
				var markupCode = $this.getCodeEditorMarkupSnippet({type: "column"});
				var markup = $this.getMarkup({type: "column"});
				// TODO: actually insert the new colspan :)
			});
			// attach events
			$("#grid-layout-dd > li > a").click(function (event) {
				// update value
				var text = $(this).text();
				button.find(".label").text(text);
				if (text === "Custom") {
					$(".custom-layout.form-control").show();
					event.preventDefault();
					return;
				} else {
					$(".custom-layout.form-control").hide();
				}
				// update code editor
				// change the layout based on the user selection
				// try to keep existing contents, instead of wiping them out, if possible (Twitter jetstrap style)
				// parse text
				var textarr = text.split("-");
				// for the length of textarr, create that # of spans. if they already exist, don't touch them
				var htmlrange = descriptor.htmlMarker.range;
				var r = new descriptor.rangeClass(htmlrange.start.row + 1, 0, htmlrange.end.row, 0);
				// wipe out what's already there - TODO - preserve markup
				var newColsCode = "", tmpObj, totalLineCount = 0, newHtmlCode = "";
				for (var i = 0; i < textarr.length; i++) {
					tmpObj = $this.getCodeEditorMarkupSnippet({type: "column", colSpan: textarr[i], extraIndent: 1});
					totalLineCount += tmpObj.lineCount;
					newColsCode += tmpObj.codeString;
					newHtmlCode += $this.getMarkup({type: "column", colSpan: textarr[i]});
				}
				//1. update code editor
				//do we use the totalLineCount for sth?
				session.replace(r, newColsCode);
				// now update the DOM of the designer/view
				el.html(newHtmlCode);
				// now update the markup 
				event.preventDefault();
			});
			// "change" is the better event here, but "keyup" is just so much cooler ! 
			$(".id.form-control").keyup(function (event) {
				el.attr("id", this.value);
				// update code editor
				// locate code fragment by marker
				// we only need the htmlmarker here
				var htmlrange = descriptor.htmlMarker.range;
				var r = new descriptor.rangeClass(htmlrange.start.row, 0, htmlrange.start.row, 1000);
				//get the first line from the segment and change the id
				var code = session.getTextRange(r);
				// check if we have an ID set already
				if (code.indexOf("id=") !== -1) {
					if (this.value === "") {
						code = code.replace(/id="(.*?)"/, "");
					} else {
						code = code.replace(/id="(.*?)"/, "id=\"" + this.value + "\"");
					}
				} else {
					code = code.replace("<div ", "<div id=\"" + this.value + "\" ");
				}
				session.replace(r, code);
			});
			//"change" evt better
			$(".classes.form-control").keyup(function (event) {
				el.attr("class", this.value);
				// update code editor
				// we are using very similar code to the one above
				// think about refactoring !
				var htmlrange = descriptor.htmlMarker.range;
				var r = new descriptor.rangeClass(htmlrange.start.row, 0, htmlrange.start.row, 1000);
				var code = session.getTextRange(r);
				// check if we have an ID set already
				if (code.indexOf("class=") !== -1) {
					if (this.value === "") {
						code = code.replace(/class="(.*?)"/, "class=\"row\"");
					} else {
						code = code.replace(/class="(.*?)"/, "class=\"row " + this.value + "\"");
					}
				} else {
					code = code.replace("<div ", "<div class=\"" + this.value + "\" ");
				}
				session.replace(r, code);
			});
			$(".custom-layout.form-control").change(function (event) {
				// update code editor
				
			});
		}
	});
	return BootstrapRow;
});