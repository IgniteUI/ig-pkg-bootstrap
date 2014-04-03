define(function (require, exports, module) {
  var ComponentPlugin = require("ide-component-plugin");
  var BootstrapComponent = BootstrapComponent || ComponentPlugin.extend({
    init: function (options) {
      this._super(options);
      // bind ti dblclick event in order to set content editables
      var ide = this.settings.ide;
      return this;
    },
    _getDefaultColSpan: function(descriptor) {
      var colComponent = this.settings.packageInfo.components[descriptor.type];
      if (!colComponent) {
        throw "Could not find column component for bootstrap package.";
      }
      if (!colComponent.properties) {
        // we are using the component before it has been dropped/fully initialized, so we need to load its info
        colComponent.loadInfo();
      }
      return colComponent.properties["columnSpan"].defaultValue;
    },
    getMarkup: function (descriptor) {
      var code = "", i;
      //return "<div id=\"" + descriptor.id + "\"></div>";
      if (descriptor.type === "row") {
        for (i = 0; i < 3; i++) {
          code += this.getMarkup({type: "column", colSpan: 4});
        }
        return "<div data-droppablechild=\"false\" data-hasdroppables=\"true\" class=\"row\">" + code + "</div>";
      } else if (descriptor.type === "column") {
        var colSpan = descriptor.colSpan;
        if (typeof (colSpan) === "undefined") {
          // get the default one
          colSpan = this._getDefaultColSpan(descriptor);
        }
        //return "<div data-droppablechild=\"true\" class=\"col-md-" + colSpan + "\"><h3>Span " + colSpan + "</h3><p>Contents</p></div>";
        return "<div data-droppablechild=\"true\" class=\"col-md-" + colSpan + "\"></div>";
      }
    },
    getCodeEditorMarkupSnippet: function (descriptor) {
      if (descriptor.type === "column") {
        var colSpan = descriptor.colSpan, indentStr = "\t\t";
        if (descriptor.extraIndent) {
          for (var i = 0; i < descriptor.extraIndent; i++) {
            indentStr += "\t";
          }
        }
        if (typeof (colSpan) === "undefined") {
          colSpan = this._getDefaultColSpan(descriptor);
        }
        return {
          codeString: indentStr + "<div class=\"col-md-" + colSpan + "\">\n" +
         //   indentStr + "\t<h3>Span " + colSpan + "</h3>\n" +
         //   indentStr + "\t<p>Contents</p>\n" +
            indentStr + "</div>\n",
          lineCount: 2
        };
      } else {
        return {
          codeString: descriptor.ide._tabStr(descriptor.extraIndent + 1) + "<div id=\"" + descriptor.id + "\" class=\"row\">\n" +
            "\t\t\t<div class=\"col-md-4\">\n" + 
          //  "\t\t\t\t<h3>Span 4</h3>\n" +
          //  "\t\t\t\t<p>Contents</p>\n" +
            "\t\t\t</div>\n" +
            "\t\t\t<div class=\"col-md-4\">\n" +
          //  "\t\t\t\t<h3>Span 4</h3>\n" +
          //  "\t\t\t\t<p>Contents</p>\n" +
            "\t\t\t</div>\n" +
            "\t\t\t<div class=\"col-md-4\">\n" +
          //  "\t\t\t\t<h3>Span 4</h3>\n" +
          //  "\t\t\t\t<p>Contents</p>\n" +
            "\t\t\t</div>\n" +
            "\t\t</div>\n",
          lineCount: 8,
          // contains offsets from parent only only
          extraMarkers: [
            {
              rowOffset: 1,
              colOffset: 0,
              rowCount: 2,
              colCount: 0
            },
            {
              rowOffset: 3,
              colOffset: 0,
              rowCount: 2, 
              colCount: 0
            },
            {
              rowOffset: 5,
              colOffset: 0,
              rowCount: 2,
              colCount: 0
            }
          ]
        };
      }
    },
    isContainer: function (descriptor) {
      if (typeof (descriptor) === "undefined" || descriptor === null) {
        return false;
      }
      //returns true for both  columns and rows
      if (descriptor.type === "row" || descriptor.type === "column") {
        return true;
      }
      // the descriptor can also be a DOM element
      if (descriptor.nodeName && $(descriptor).attr("data-container") === "true") {
        return true;
      }
      return false;
    },
    isDroppableChild: function (descriptor) {
      if (typeof (descriptor) === "undefined" || descriptor === null) {
        return false;
      }
      if (descriptor.nodeName && $(descriptor).attr("data-droppablechild") === "true") {
        return true;
      } else {
        if (descriptor.type === "row") {
          return false;
        } else if (descriptor.type === "column") {
          return true;
        }
      }
      return false;
    },
    hasDroppableChildren: function (descriptor) {
      if (typeof (descriptor) === "undefined" || descriptor === null) {
        return false;
      }
      if (descriptor.nodeName && $(descriptor).attr("data-hasdroppables") === "true") {
        return true;
      }
    },
    getDroppableChildren: function (descriptor) {
      if (typeof (descriptor) === "undefined" || descriptor === null) {
        return $();
      } else if (descriptor.nodeName) {
        return $(descriptor).find("div[data-droppablechild]");
      }
      return $();
    },
    setRuntimeMetadata: function (component) {
      var $c = $(component);
      if ($c.hasClass("row")) {
        $c.attr("data-hasdroppables", true);
        $c.children().each(function () {
          var col = $(this);
          col.attr("data-droppablechild", true);
          if (col.children("div").length === 0) {
            col.addClass("empty-container");
          }
        });
      } else if ($c.is('div[class^="col-"]')) {
        $c.attr("data-droppablechild", true);
        if ($c.children("div").length === 0) {
            $c.addClass("empty-container");
        }
      }
    },
    discoverComponents: function (descriptor) {
        console.log("discovering bootstrap");
        // we are looking for DIV elements which have a "row" class applied, and have one or more DIVs marked with a "column" class
        // if we see such a structure, we assume that it's a bootstrap row.
        // since bootstrap is HTML-only, we aren't going to parse any js
        
    }
  });
  return BootstrapComponent;
});