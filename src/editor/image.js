(function($, undefined) {

// Imports ================================================================
var kendo = window.kendo,
    Class = kendo.Class,
    extend = $.extend,
    Editor = kendo.ui.Editor,
    registerTool = Editor.EditorUtils.registerTool,
    RangeUtils = Editor.RangeUtils
    Command = Editor.Command;

var ImageCommand = Command.extend({
    init: function(options) {
        Command.fn.init.call(this, options);

        this.async = true;
        this.attributes = null;
    },

    insertImage: function(img, range) {
        var attributes = this.attributes;
        if (attributes.src && attributes.src != 'http://') {
            if (!img) {
                img = dom.create(RangeUtils.documentFromRange(range), 'img', attributes);
                img.onload = img.onerror = function () {
                    img.removeAttribute('complete');
                    img.removeAttribute('width');
                    img.removeAttribute('height');
                }
                range.deleteContents();
                range.insertNode(img);
                range.setStartAfter(img);
                range.setEndAfter(img);
                RangeUtils.selectRange(range);
                return true;
            } else
                dom.attr(img, attributes);
        }

        return false;
    },

    redo: function () {
        var range = this.lockRange();
        if (!this.insertImage(RangeUtils.image(range), range))
            this.releaseRange(range);
    },

    exec: function () {
        var self = this,
            range = self.lockRange(),
            applied = false,
            img = RangeUtils.image(range);

        function apply(e) {
            self.attributes = {
                src: $('#k-editor-image-url', dialog.element).val(),
                alt: $('#k-editor-image-title', dialog.element).val()
            };

            applied = insertImage(img, range);

            close(e);

            if (self.change)
                self.change();
        }

        function close(e) {
            e.preventDefault();
            dialog.destroy();

            dom.windowFromDocument(RangeUtils.documentFromRange(range)).focus();
            if (!applied)
                self.releaseRange(range);
        }

//        var fileBrowser = this.editor.fileBrowser;
//        var showBrowser = fileBrowser && fileBrowser.selectUrl !== undefined;
//        
        function activate() {  
//            if (showBrowser) {
//                new $t.imageBrowser($(this).find(".k-image-browser"), $.extend(fileBrowser, { apply: apply, element: self.editor.element, localization: self.editor.options.localization }));
//            }
        }        
        
        var dialog = $t.window.create(extend({ width: 750 }, this.editor.options.dialogOptions, {
            title: "Insert image",
            html: new $.telerik.stringBuilder()
                        .cat('<div class="k-editor-dialog">')                        
                            .catIf('<div class="k-image-browser"></div>', showBrowser)
                            .cat('<ol>')
                                .cat('<li class="k-form-text-row"><label for="k-editor-image-url">Web address</label><input type="text" class="k-input" id="k-editor-image-url"/></li>')
                                .cat('<li class="k-form-text-row"><label for="k-editor-image-title">Tooltip</label><input type="text" class="k-input" id="k-editor-image-title"/></li>')
                            .cat('</ol>')
                            .cat('<div class="k-button-wrapper">')
                                .cat('<button class="k-dialog-insert k-button">Insert</button>')
                                .cat('&nbsp;or&nbsp;')
                                .cat('<a href="#" class="k-dialog-close k-link">Close</a>')
                            .cat('</div>')
                        .cat('</div>')
                    .string(),
            onClose: close,
            onActivate: activate
        }))
        .hide()
        .find('.k-dialog-insert').click(apply).end()
        .find('.k-dialog-close').click(close).end()
        .find('.k-form-text-row input').keydown(function (e) {
            if (e.keyCode == 13)
                apply(e);
            else if (e.keyCode == 27)
                close(e);
        }).end()                
        //.toggleClass("k-imagebrowser", showBrowser)
        // IE < 8 returns absolute url if getAttribute is not used
        .find('#k-editor-image-url').val(img ? img.getAttribute('src', 2) : 'http://').end()
        .find('#k-editor-image-title').val(img ? img.alt : '').end()
        .show()
        .data('tWindow').center();

        $('#k-editor-image-url', dialog.element).focus().select();
    }

});

extend(kendo.ui.Editor, {
    ImageCommand: ImageCommand
});

registerTool("insertImage", new Editor.Tool({ command: ImageCommand }));

})(jQuery);