(function($) {

    var defaults = {
        success: function(text) {
            // alert(text);
        },
        error: function(text, errors) {
            // alert(text);
        },
        formdata_error: "Your browser is too old to support file upload from this form."
    };

    var EdicyAjaxForm = function(el, options) {
        this.$el = $(el);
        this.id = $(el).attr('id');
        this.options = $.extend(defaults, options);
        this.init();
    };

    EdicyAjaxForm.prototype = {
        init: function() {
            this.$el.submit($.proxy(this.handleSubmit, this));
            if (!window.FormData) {
                this.$el.find('.form_field_file').after('<div class="form_field_error">' + this.options.formdata_error + '</div>');
            }
        },

        handleSubmit: function(event) {
            event.preventDefault();
            var params = {
                    type: 'post',
                    url: window.location,
                    success: $.proxy(this.handleAjaxSuccess, this),
                    error: $.proxy(this.handleAjaxError, this)
                };

            if (window.FormData) {
                params.data = new FormData(this.$el.get(0));
                params.cache = false;
                params.contentType = false;
                params.processData = false;
            } else {
                params.data = this.$el.serialize();
            }

            this.clearErrors();
            $.ajax(params);
        },

        handleAjaxSuccess: function(data) {
            this.clearErrors();
            if (data && data.errors) {
                this.showErrors(data.errors);
            } else if (data.notice) {
                this.formSubmited(data.notice);
            } else {
                this.handleAjaxError();
            }
        },

        handleAjaxError: function(jqXHR, textStatus, errorThrown) {
            alert('Network error');
        },

        clearErrors: function() {
            this.$el.find('.form_field_error, .form_error, .form_notice').remove();
            this.$el.find('.form_field_with_errors').removeClass('form_field_with_errors');
        },

        showErrors: function(errors) {
            var $field;
            for (var id in errors) {
                if (errors.hasOwnProperty(id)) {
                    if (id === 'base') {
                        // Render all form notices
                        for (var eb = errors[id].length; eb--;) {
                            this.$el.find('.form_area').prepend('<div class="form_error">' + errors[id][eb] + '</div>')
                        }
                    } else {
                        // Find appropriate field and render errors to it
                        // Finds by beginning of id to comply with radiobuttons and checkboxes
                        $field = this.$el.find('[id^="field_' + id + '"]').closest('.form_field');
                        if ($field.length > 0) {
                            for (var e = 0, emax = errors[id].length; e < emax; e++) {
                                $field.eq(0).append('<div class="form_field_error">' + errors[id][e] + '</div>');
                            }
                            $field.addClass('form_field_with_errors');
                        }
                    }
                }
            }
            this.options.success((errors.base && errors.base[0]) ? errors.base[0] : "Error", errors);
        },

        formSubmited: function(notice) {
            this.$el.find('.form_area').prepend('<div class="form_notice">' + notice +'</div>');
            this.options.success(notice);
        }
    };

    $.fn.edicyAjaxForm = function (options) {
        return this.each(function () {
            var data = $(this).data('edicyAjaxForm');
            if (!data) {
                $(this).data('edicyAjaxForm', new EdicyAjaxForm(this, options));
            }
        });
    };

})(jQuery);
