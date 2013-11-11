define(function (require, exports, module) {
	var BootstrapComponent = require("./_default-component");
	var BootstrapColumn = BootstrapColumn ||  BootstrapComponent.extend({
		init: function (options) {
			this._super(options);
			return this;
		},
		render: function (container, descriptor) {
			// render a slider from where the user can increase the number of columns a bootstrap column spans
			$(container).empty();
			var parent = $("<div></div>").appendTo(container).css("padding-left", 10), el = descriptor.element;
			// calculate currentVal
			var currentVal;
			if (!el.hasClass("ig-component")) {
				el = el.find("div:regex(class, col-.*)");
			}
			var css = el.attr("class").split(" ");
			// parse class
			for (var i = 0; i < css.length; i++) {
				if (css[i].indexOf("col-") !== -1) {
					css = css[i];
					break;
				}
			}
			css = css.split("-");
			currentVal = parseInt(css[css.length - 1], 10);
			$("<h5></h5>").appendTo(parent).text("Column Span: " + currentVal).css("color", "white").css("padding-bottom", 10);
			$("<div></div>").appendTo(parent).attr("id", "slider");
			$("#slider").css("width", "80%").slider({
				value: currentVal,
				min: 1,
				max: 12,
				step: 1,
				slide: function( event, ui ) {
					container.find("h5").text("Column Span: " + ui.value);
					// update code
					
				}
			});
		},
	});
	return BootstrapColumn;
});