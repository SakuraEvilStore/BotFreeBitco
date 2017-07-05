$.fn.addSliderSegments = function (amount, orientation) {
    return this.each(function () {
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

(function ($) {
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
            create: function () {
                $bet_amount.val(($(this).slider("value") / 100000000).toFixed(8));
            },
            slide: function (event, ui) {
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
            value: 0.00000008 * 100000000,
            orientation: "horizontal",
            range: "min",
            create: function () {
                $max_bet_amount.val(($(this).slider("value") / 100000000).toFixed(8));
            },
            slide: function (event, ui) {
                $max_bet_amount.val((ui.value / 100000000).toFixed(8));
            }
        }).addSliderSegments($max_bet_amount_slide.slider("option").max);
    }
    var $max_lost_slide = $("#max-lost-slide");
    var $max_lost = $("#max-lost");
    if ($max_lost_slide.length > 0) {
        $max_lost_slide.slider({
            min: 1,
            max: 10,
            value: 4,
            orientation: "horizontal",
            range: "min",
            create: function () {
                $max_lost.val($(this).slider("value"));
            },
            slide: function (event, ui) {
                $max_lost.val(ui.value);
            }
        }).addSliderSegments($max_lost_slide.slider("option").max);
    }

    var popup = {
        key: 'popup',
        el: {
            popup: $('#customjs'),
            popupForm: $('#popup-form'),
            autoType: $('#auto-type'),
            betAmountSlide: $("#bet-amount-slide"),
            betAmount: $('#bet-amount'),
            maxBetAmountSlide: $("#max-bet-amount-slide"),
            maxBetAmount: $('#max-bet-amount'),
            maxLostSlide: $("#max-lost-slide"),
            maxLost: $('#max-lost'),
            saveBtn: $('#save-setting'),
            hostSelect: $('#host'),
        },
        host: undefined,
        emptyDataPattern: {
            config: {
                autoType: 0,
                betAmount: 0.00000001,
                maxBetAmount: 0.00000008,
                maxLost: 4,
            },
        },
        data: null,
        storage: {
            data: {
                private: {},
                global: {}
            },
            MODE: {
                private: 1,
                global: 2,
            },
            setMode: function (mode) {
                if (mode === this.MODE.private) {
                    this.key = popup.key + "-" + popup.protocol + "//" + popup.host;
                    this.mode = this.MODE.private;
                }

                if (mode === this.MODE.global) {
                    this.key = popup.key;
                    this.mode = this.MODE.global;
                }
            },
            load: function () {
                this.setMode(this.MODE.private);
                this._setData(JSON.parse(localStorage.getItem(this.key) || "{}"));

                this.setMode(this.MODE.global);
                this._setData(JSON.parse(localStorage.getItem(this.key) || "{}"));
            },
            _getData: function (key) {
                var storage = popup.storage;
                if (storage.mode == storage.MODE.private) {
                    if (key) {
                        return storage.data.private[key];
                    } else {
                        return storage.data.private;
                    }
                }
                if (storage.mode == storage.MODE.global) {
                    if (key) {
                        return storage.data.global[key];
                    } else {
                        return storage.data.global;
                    }
                }
            },
            _setData: function (data, key) {
                var storage = popup.storage;
                if (storage.mode == storage.MODE.private) {
                    if (key) {
                        storage.data.private[key] = data;
                    } else {
                        storage.data.private = data;
                    }
                }
                if (storage.mode == storage.MODE.global) {
                    if (key) {
                        storage.data.global[key] = data;
                    } else {
                        storage.data.global = data;
                    }
                }
            },
            get: function (key) {
                return this._getData(key);
            },
            set: function (arg1, arg2) {
                // arg1 is a key
                if (typeof arg1 === 'string') {
                    this._setData(arg2, arg1);
                }
                // arg1 is data
                else {
                    this._setData(arg1);
                }

                var str = JSON.stringify(this._getData() || {});
                localStorage.setItem(this.key, str);
            },

            remove: function (key) {
                if (key) {
                    var data = this._getData();
                    delete data[key];

                    if ($.isEmptyObject(data)) {
                        this.remove();
                    } else {
                        var str = JSON.stringify(this._getData());
                        localStorage.setItem(this.key, str);
                    }
                } else {
                    localStorage.removeItem(this.key);
                    this._setData({});
                }
            }
        },
        apiclb: {
            onSelectedTab: function (tab) {
                popup.tabId = tab.id;
                chrome.tabs.sendRequest(popup.tabId, {
                    method: "getData",
                    reload: false
                }, popup.apiclb.onGetData);
            },
            onGetData: function (response) {
                if (!response || typeof response.host !== 'string') {
                    window.close();
                    return;
                }

                popup.host = response.host;
                popup.protocol = response.protocol;
                // Load storage (global, local) IMPORTANT: Must be called first of all storage operations
                popup.storage.load();

                // Set storage to store data accessible from all hosts
                popup.storage.setMode(popup.storage.MODE.global);

                var hosts = popup.storage.get('hosts') || [],
                    url = popup.protocol + "//" + response.host;
                // Add current host to list
                if (hosts.indexOf(url) === -1) {
                    hosts.push(url);
                }

                // Fill 'hosts select'
                hosts.forEach(function (host) {
                    var option = $('<option>' + host + '</option>');
                    if (host === url) {
                        option.attr('selected', 'selected');
                    }
                    popup.el.hostSelect.append(option);
                });

                // Store host (current included in array) if is customjs defined
                if (response.customjs) {
                    popup.storage.set('hosts', hosts);
                }

                // Set-up data pattern if empty
                if (!popup.data) {
                    popup.data = $.extend(true, {}, popup.emptyDataPattern);
                }

                // Merge host's data to defaults
                popup.data = $.extend(popup.data, response.customjs);

                // Set storage to store data accessible ONLY from current host
                popup.storage.setMode(popup.storage.MODE.private);

                // Save local copy of live data
                if (response.customjs) {
                    popup.storage.set('data', popup.data);
                }

                // Apply data
                popup.applyData();

                if (response.host !== 'freebitco.in') {
                    window.close();
                    return;
                }
            }
        },
        applyData: function (data) {
            data = data || this.data;
            console.log(data);
            popup.el.autoType.val(data.config.autoType);
            popup.el.betAmountSlide.slider("option", "value", data.config.betAmount * 100000000);
            popup.el.betAmount.val(parseFloat(data.config.betAmount).toFixed(8));
            popup.el.maxBetAmountSlide.slider("option", "value", data.config.maxBetAmount * 100000000);
            popup.el.maxBetAmount.val(parseFloat(data.config.maxBetAmount).toFixed(8));
            popup.el.maxLostSlide.slider("option", "value", data.config.maxLost);
            popup.el.maxLost.val(data.config.maxLost);
        },
        getCurrentData: function () {
            return {
                config: {
                    autoType: popup.el.autoType.val(),
                    betAmount: popup.el.betAmount.val(),
                    maxBetAmount: popup.el.maxBetAmount.val(),
                    maxLost: popup.el.maxLost.val(),
                }
            };
        },
        save: function (e) {
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
            popup.storage.setMode(popup.storage.MODE.private);
            popup.storage.set('data', popup.data);

            // Close popup
            window.close();

            return false;
        },
    }
    window.popup = popup;

    chrome.tabs.getSelected(null, popup.apiclb.onSelectedTab);

    popup.el.saveBtn.on('click', popup.save);

})(jQuery);