define(["./_default-component"], function (BootstrapComponent) {
	var BootstrapRow = BootstrapRow || BootstrapComponent.extend({
		init: function (options) {
			this._super(options);
			return this;
		},
		render: function (container, descriptor) {
			var $this = this, i, elementID = descriptor.element.attr("id") !== undefined ? descriptor.element.attr("id") : "",
				parent = container.addClass("bootstrap-row-adorner"), 
				el = descriptor.element, w = "150px";

			container.empty(); // 168980
			container.siblings(".adorner-custom-footer").hide();
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
			this._createMarkup(parent, w, descriptor);
			// hide Add column span button
			/*
			$("<button></button").appendTo(parent).addClass("btn btn-success").css("width", w)
				.css("margin-top", 10).text("Add Column Span").click(function () {
				var markupCode = $this.getCodeEditorMarkupSnippet({type: "column"});
				var markup = $this.getMarkup({type: "column"});
				// TODO: actually insert the new colspan :)
			});
			*/
			// attach events
			$("#grid-layout-dd > li > a").click(function (event) {
				// update value
				var text = $(this).text();
				descriptor.comp.config = text;
				$('.btn-primary.dropdown-toggle').find(".label").text(text);
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
				var r = new descriptor.rangeClass(htmlrange.start.row + 1, 0, htmlrange.end.row - 1, 0);
				// wipe out what's already there - TODO - preserve markup
				var newColsCode = "", tmpObj, totalLineCount = 0, newHtmlCode = "";
				for (i = 0; i < textarr.length; i++) {
					tmpObj = $this.getCodeEditorMarkupSnippet({type: "column", colSpan: textarr[i], extraIndent: 1});
					totalLineCount += tmpObj.lineCount;
					newColsCode += tmpObj.codeString;
					newHtmlCode += $this.getMarkup({type: "column", colSpan: textarr[i]});
				}
				//regenerate markers
				var childMarkers = descriptor.htmlMarker.extraMarkers;
				childMarkers.children = [];
				// regenerate markers
				var offset = htmlrange.start.row + 1;
				var total = 0;
				//1. update code editor
				//do we use the totalLineCount for sth?
				session.replace(r, newColsCode);
				// finally update the parent marker so that it's also correct
				$this.settings.ide.session.removeMarker(descriptor.htmlMarker.id);
				for (i = 0; i < textarr.length; i++) {
					var mkr = $this.settings.ide.createAndAddMarker(offset + i*2 + 1, 0, offset + i*2 + 2, 0);
					total += 2;
					childMarkers.children.push(mkr);
				}
				//recreate it
				descriptor.htmlMarker.range = $this.settings.ide.createAndAddMarker(offset - 1, 0,  offset + total + 1, 0);
				// now update the DOM of the designer/view
				el.html(newHtmlCode);
				// now update the markup 
				event.preventDefault();
			});
			$(".id.form-control").val(elementID);
			// "change" is the better event here, but "keyup" is just so much cooler ! 
			$(".id.form-control").keyup(function (event) {
				var oldVal = el.attr("id");
				el.attr("id", this.value);
				// update code editor
			    // locate code fragment by marker
				if (event.keyCode === 13) {
				    $(event.target).blur();
				}
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
				// we need to replace the previous with the new value in the componentIds array, otherwise we may not be able to retrieve the 
				// component object any more
				$this.settings.ide._updateId(oldVal, this.value);
			});
			//"change" evt better
			$(".classes.form-control").keyup(function (event) {
				if (event.keyCode === 13) {
				    $(event.target).blur();
				}
			    // update code editor
				el.attr("class", "row ig-component " + this.value);
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
		},
		_createMarkup: function (parent, width, descriptor) {
			var markup = "", layoutText = "4-4-4"; // default layoutText
			markup += "<div class=\"adorner-label\">Id: </div><input type=\"text\" class=\"id form-control\"></input>";
			markup += "<div class=\"adorner-label\">Classes: </div><input type=\"text\" class=\"classes form-control\"></input>";
			markup += "<div class='adorner-label'>Grid Layout</div>";
			markup += "<div class='btn-group'>";
			if (descriptor.comp.config) {
				layoutText = descriptor.comp.config;
			}
			markup += "<button class='btn btn-primary dropdown-toggle' data-toggle='dropdown'><span class='label'>" + layoutText + "</span><span class=\"caret\"></span></button>";
			// disable changing the layout, if bootstrap columns aren't empty
			var empty = true;
			var cols = descriptor.element.children();
			for (var i = 0; i < cols.length; i++) {
				if ($(cols[i]).children().length > 0) {
					empty = false;
					break;
				}
			}
			if (empty) {
				markup += "<ul id='grid-layout-dd' class='dropdown-menu' data-role='menu'>";
				// add list items
				markup += "<li><a href=\"#\">6-6</a></li>";
				markup += "<li><a href=\"#\">4-4-4</a></li>";
				markup += "<li><a href=\"#\">4-8</a></li>";
				markup += "<li><a href=\"#\">8-4</a></li>";
				markup += "<li><a href=\"#\">3-3-3-3</a></li>";
				markup += "<li><a href=\"#\">2-10</a></li>";
				markup += "<li><a href=\"#\">10-2</a></li>";
				markup += "<li><a href=\"#\">3-9</a></li>";
				markup += "<li><a href=\"#\">9-3</a></li>";
				//A.T. 168952
				//markup += "<li><a href=\"#\">Custom</a></li>";
				markup += "</ul>";
			}
			markup += "</div>";
			markup += "<input type=\"text\" class=\"custom-layout form-control\" style='display: none;' />";
			parent.empty().append(markup);
			if (!empty) {
				parent.find(".btn-group").attr("title", "Cannot modify layout because default content has been modified.");
				parent.find("button").attr("disabled", "").css("color", "white");
			}
		}
	});
	return BootstrapRow;
});