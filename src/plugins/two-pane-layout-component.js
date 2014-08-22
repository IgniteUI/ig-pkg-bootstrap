define(["./_default-component"], function (BootstrapComponent) {
	var TwoPaneLayout = TwoPaneLayout || BootstrapComponent.extend({
		init: function (options) {
			this._super(options);
			return this;
		},
		getMarkup: function (descriptor) {
			return 	"<div id=\"twopane1\" data-droppablechild=\"false\" style=\"height: 80%; border: 1px solid #2ECCFA;\">" +
					"<div id=\"tabsContainer\" class=\"col-md-3 tabscontainer\">" + 
					"<ul class=\"nav nav-tabs nav-stacked\" role=\"tablist\" style=\"outline: 1px;\">" +
				  	"<li class=\"active twopanetab\"><a href=\"#pane0\" role=\"tab\" data-toggle=\"tab\">Tab 1</a></li>" +
				  	"<li class=\"twopanetab\"><a href=\"#pane1\" role=\"tab\" data-toggle=\"tab\">Tab 2</a></li>" +
				  	"<li class=\"twopanetab\"><a href=\"#pane2\" role=\"tab\" data-toggle=\"tab\">Tab 3</a></li></ul></div>" +
					"<div class=\"tab-content col-md-9\" data-droppablechild=\"false\" data-hasdroppables=\"true\">" +
			  		"<div class=\"tab-pane active\" id=\"pane0\" data-droppablechild=\"true\"></div>" +
			  		"<div class=\"tab-pane\" id=\"pane1\" data-droppablechild=\"true\"></div>" +
			  		"<div class=\"tab-pane\" id=\"pane2\" data-droppablechild=\"true\"></div></div></div>";
		},
		requiresInitialization: function () {
			return true;
		},
		initComponent: function (descriptor) {
			window.frames[0].$(descriptor.placeholder).find("a").on("click", function () {
				return false;
			});
		},
		getCodeEditorMarkupSnippet: function (descriptor) {
			return {
				codeString: descriptor.ide._tabStr(descriptor.extraIndent + 1) + "<div id=\"" + descriptor.id + "\">\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 2) + "<div id=\"tabsContainer\" class=\"col-md-3 tabscontainer\">\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 3) + "<ul class=\"nav nav-tabs nav-stacked\" role=\"tablist\" style=\"outline: 1px;\">\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 4) + "<li class=\"active twopanetab\"><a href=\"#pane0\" role=\"tab\" data-toggle=\"tab\">Tab 1</a></li>\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 4) + "<li class=\"twopanetab\"><a href=\"#pane1\" role=\"tab\" data-toggle=\"tab\">Tab 2</a></li>\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 4) + "<li class=\"twopanetab\"><a href=\"#pane2\" role=\"tab\" data-toggle=\"tab\">Tab 3</a></li>\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 3) + "</ul>\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 2) + "</div>\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 2) + "<div class=\"tab-content col-md-9\">\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 3) + "<div class=\"tab-pane active\" id=\"pane0\">\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 3) + "</div>\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 3) + "<div class=\"tab-pane\" id=\"pane1\">\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 3) + "</div>\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 3) + "<div class=\"tab-pane\" id=\"pane2\">\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 3) + "</div>\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 2) + "</div>\n" +
				descriptor.ide._tabStr(descriptor.extraIndent + 1) + "</div>\n",
				lineCount: 17,
				extraMarkers: [
					{
		              rowOffset: 1,
		              colOffset: 0,
		              rowCount: 8,
		              colCount: 0
            		},
            		{
		              rowOffset: 9,
		              colOffset: 0,
		              rowCount: 8, 
		              colCount: 0
		            }
				]
			};
		},

		render: function (container, descriptor) {
			var $this = this, i, elementID = descriptor.element.attr("id") !== undefined ? descriptor.element.attr("id") : "",
				parent = container.addClass("bootstrap-row-adorner"), 
				el = descriptor.element, w = "150px";

			container.empty(); // 168980
			container.siblings(".adorner-custom-footer").hide();

			var session = descriptor.editorSession;

			this._createMarkup(parent, w, descriptor);

			// attach events
			//'Set as Default Selected' clicked

			//'Remove Tab & Associated Pane' clicked

			//'Add tab' clicked

			//'Inner HTML' keyup

			//'CSS Classes' keyup

			//'ID' keyup
			$(".id.form-control").val(elementID);
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
		},

		_createMarkup: function (parent, width, descriptor) {
			var markup = "";
			markup += "<div class=\"adorner-twopane-label\">ACTIONS</div>";
			markup += "<div><a class=\"adorner-set-default\" href=\"#\">Set as Default Selected</a></div>\n";
			markup += "<div><a class=\"adorner-remove-tab\" href=\"#\">Remove Tab & Associated Pane</a></div>";
			markup += "<div><a class=\"adorner-add-tab\" href=\"#\">Add Tab</a></div>";
			markup += "<label class=\"adorner-movetabs-label\">Use up/down arrow keys to move tabs.</label>";
			markup += "<div class=\"adorner-twopane-label\">PROPERTIES</div>";
			markup += "<div class=\"adorner-label\">Inner HTML </div><input type=\"text\" class=\"innerhtml form-control\"></input>";
			markup += "<div class=\"adorner-label\">CSS Classes: </div><input type=\"text\" class=\"cssclasses form-control\"></input>";
			markup += "<div class=\"adorner-label\">Id: </div><input type=\"text\" class=\"id form-control\"></input>";

			parent.empty().append(markup);
		}
	});
	return TwoPaneLayout;
});