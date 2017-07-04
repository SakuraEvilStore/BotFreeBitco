$.fn.addSliderSegments = function(amount, orientation) {
    return this.each(function() {
        if (orientation == "vertical") {
            var output = '',
                i;
            for (i = 1; i <= amount - 2; i++) {
                output += '<div class="ui-slider-segment" style="top:' + 100 / (amount - 1) * i + '%;"></div>';
            };
            $(this).prepend(output);
        } else {
            var segmentGap = 100 / (amount - 1) + "%",
                segment = '<div class="ui-slider-segment" style="margin-left: ' + segmentGap + ';"></div>';
            $(this).prepend(segment.repeat(amount - 2));
        }
    });
};

(function($) {
    $("select").select2({
        dropdownCssClass: 'dropdown-inverse'
    });
    var $bet_amount_slide = $("#bet-amount-slide");
    var $bet_amount = $("#bet-amount");
    if ($bet_amount_slide.length > 0) {
        $bet_amount_slide.slider({
            min: 0.00000001 * 100000000,
            max: 200 * 0.00000001 * 100000000,
            value: 0.00000001 * 100000000,
            orientation: "horizontal",
            range: "min",
            create: function() {
                $bet_amount.val(($(this).slider("value") / 100000000).toFixed(8));
            },
            slide: function(event, ui) {
                $bet_amount.val((ui.value / 100000000).toFixed(8));
            }
        }).addSliderSegments($bet_amount_slide.slider("option").max);
    }
    var $max_bet_amount_slide = $("#max-bet-amount-slide");
    var $max_bet_amount = $("#max-bet-amount");
    if ($max_bet_amount_slide.length > 0) {
        $max_bet_amount_slide.slider({
            min: 0.00000001 * 100000000,
            max: 200 * 0.00000001 * 100000000,
            value: 0.00000001 * 100000000,
            orientation: "horizontal",
            range: "min",
            create: function() {
                $max_bet_amount.val(($(this).slider("value") / 100000000).toFixed(8));
            },
            slide: function(event, ui) {
                $max_bet_amount.val((ui.value / 100000000).toFixed(8));
            }
        }).addSliderSegments($max_bet_amount_slide.slider("option").max);
    }
    $("#double-if-lost").bootstrapSwitch();


    var popup = {
        key: 'popup',
        el: {
            popup: $('#customjs'),
            popupForm: $('#popup-form'),
            autoType: $('#auto-type'),
            betAmount: $('#bet-amount'),
            doubleIfLost: $('#double-if-lost'),
            maxBetAmount: $('#max-bet-amount'),
            saveBtn: $('#save-setting'),
        },
        data: null,
        storage: {
            data: {},
            load: function() {
                this._setData(JSON.parse(localStorage.getItem("bot-config") || "{}"));
            },
            _getData: function() {
                var storage = popup.storage;
                return storage.data;
            },
            _setData: function(data, key) {
                var storage = popup.storage;
                if (key) {
                    storage.data[key] = data;
                } else {
                    storage.data = data;
                }
            },
            get: function(key) {
                return this._getData();
            },
            set: function(arg1, arg2) {
                // arg1 is a key
                if (typeof arg1 === 'string') {
                    this._setData(arg2, arg1);
                }
                // arg1 is data
                else {
                    this._setData(arg1);
                }

                var str = JSON.stringify(this._getData() || {});
                localStorage.setItem("bot-config", str);
            },
            remove: function(key) {
                if (key) {
                    var data = this._getData();
                    delete data[key];

                    if ($.isEmptyObject(data)) {
                        this.remove();
                    } else {
                        var str = JSON.stringify(this._getData());
                        localStorage.setItem("bot-config", str);
                    }
                } else {
                    localStorage.removeItem("bot-config");
                    this._setData({});
                }
            }
        },
        applyData: function(data, notDraft) {

            if (data && !notDraft) {
                this.el.draftRemoveLink.removeClass('is-hidden');
            }

            data = data || this.data;

            // Default value for 'extra include'
            if (!data.config.extra) {
                data.config.extra = '# ' + popup.title.include.textarea + "\n";
                popup.include.extra.forEach(function(url) {
                    data.config.extra += '# ' + url + "\n";
                });
            }
            // Readable format for 'extra include'
            else {
                data.config.extra = data.config.extra.replace(';', "\n");
            }

            // Default value for source
            if (!data.source) {
                data.source = popup.editor.defaultValue;
            }

            // Set 'predefined include' value
            popup.el.includeSelect.val(data.config.include);

            // Set enable checkbox
            popup.el.enableCheck.prop('checked', data.config.enable);

            // Fill 'extra include' textarea
            popup.el.includeTextarea.val(data.config.extra);

            // Apply source into editor
            popup.editor.apply(data.source);
        },
        getCurrentData: function() {
            return {
                autoType: popup.el.autoType.val(),
                betAmount: popup.el.betAmount.val(),
                doubleIfLost: popup.el.betAmount.prop('checked'),
                maxBetAmount: popup.el.maxBetAmount.val(),
            };
        },
        removeDraft: function() {
            popup.storage.remove('draft');

            popup.applyData();
            popup.el.draftRemoveLink.addClass('is-hidden');
        },
        save: function(e) {
            e.preventDefault();

            var data = popup.getCurrentData();

            // Transform source for correct apply
            // data.config.extra = data.config.extra.replace("\n", ';');
            // data.source = popup.generateScriptDataUrl(data.source);

            // Send new data to apply
            chrome.tabs.sendRequest(popup.tabId, {
                method: "setData",
                customjs: data,
                reload: true
            });

            // Save local copy of data
            popup.storage.set('data', popup.data);

            // Clear draft
            popup.removeDraft();

            // Close popup
            window.close();

            return false;
        },
    }

})(jQuery);