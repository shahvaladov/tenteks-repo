const wwsLoader = `<div class="wws-spinner">
    <div class="wws-bounce1 wws--bg-color"></div>
    <div class="wws-bounce2 wws--bg-color"></div>
    <div class="wws-bounce3 wws--bg-color"></div>
</div>`;

const wwsWidget = {

    popup: jQuery( '.wws-popup' ),
    popupGradient: jQuery( '.wws-gradient' ),

    /*
     * Popup show and hide
     */
    trigger: function() {

        // Popup not open
        if ( this.popup.attr( 'data-wws-popup-status' ) == 0 ) {
            this.popup.slideDown();
            this.popup.attr( 'data-wws-popup-status', 1 );
            this.popupGradient.show();

        } else { // Popup open
            this.popup.slideUp();
            this.popup.attr( 'data-wws-popup-status', 0 );
            this.popupGradient.hide();
        }

    },

    isPopupOpen: function() {
        return ( jQuery( this.popup ).attr( 'data-wws-popup-status' ) == 1 ) ? true : false; 
    },

    /*
     * Auto popup 
     */
    autoPopup: function( delayInSeconds ) {

        if ( sessionStorage.wwsAutoPopup != 1 ) {
            if ( this.isPopupOpen() == false ) {
                setTimeout( function() {
                    wwsWidget.trigger();
                    sessionStorage.wwsAutoPopup = 1;
                }, Number( delayInSeconds * 1000 ) );
            }
        }

    },

    /*
     * Send message
     */
    sendMessage: function( message = '', whatsappNumber = '' ) {

        if ( message == '' || whatsappNumber == '') {
            return false;
        }

        if ( this.isMobile.any() ) {
            window.open('https://api.whatsapp.com/send?phone='+whatsappNumber+'&text='+message+'');
        } else {
            window.open('https://web.whatsapp.com/send?phone='+whatsappNumber+'&text='+message+'');
        }

        return true;

    },

    /*
     * Send group invitation
     */
    sendGroupInvitation: function( groupID ) {

        window.open('https://chat.whatsapp.com/' + groupID );

    },

    /* 
     * Mobile detection
     */
    isMobile: {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return ( wwsWidget.isMobile.Android() || wwsWidget.isMobile.BlackBerry() || wwsWidget.isMobile.iOS() || wwsWidget.isMobile.Opera() || wwsWidget.isMobile.Windows());
        },
    },


}



;(function( $ ) {
    "use strict";

    jQuery( document ).ready(function() {

        function isNumber( number ) {
            var validation = /^[+0-9][0-9\s]+$/; 
            
            if ( number.match( validation ) ) { 
                return true; 
            } else {  
                return false; 
            } 
        }

        function sendAnalytics( message = 'N/A', number = 'N/A' ) {

            jQuery.ajax({
                url: wwsObj.adminAjaxURL,
                type: 'post',
                data: {
                    'action':   'wws_click_analytics',
                    'message':  message,
                    'number':   number,
                }
            });

        }


        // Google and Facebook Pixel Analytics
        function wws_google_click_analytics() {

            var fbGaAnalytics = jQuery.parseJSON( wwsObj.fbGaAnalytics );

            if ( fbGaAnalytics.ga_click_tracking_status == 1 ) {

                try {
                    gtag( 
                        'event', 
                        fbGaAnalytics.ga_click_tracking_event_name, {
                            'event_category': fbGaAnalytics.ga_click_tracking_event_category,
                            'event_label': fbGaAnalytics.ga_click_tracking_event_label,
                        } 
                    );
                } catch ( error ) {
                    if ( wwsObj.isDeveloper == '1' ) {
                        window.console && console.log( 'WordPress WhatsApp Support Google or Facebook analytics error message: ' + error.message );
                    }
                }
                
                try {
                    ga( 
                        'send', 
                        'event', 
                        fbGaAnalytics.ga_click_tracking_event_category, 
                        fbGaAnalytics.ga_click_tracking_event_name, 
                        fbGaAnalytics.ga_click_tracking_event_label
                    );
                } catch ( error ) {
                    if ( wwsObj.isDeveloper == '1' ) {
                        window.console && console.log( 'WordPress WhatsApp Support Google or Facebook analytics error message: ' + error.message );
                    }
                }
                
                try {
                    _gaq.push([ 
                        '_trackEvent', 
                        fbGaAnalytics.ga_click_tracking_event_category, 
                        fbGaAnalytics.ga_click_tracking_event_name, 
                        fbGaAnalytics.ga_click_tracking_event_label 
                    ]);
                }
                catch ( error ) {
                    if ( wwsObj.isDeveloper == '1' ) {
                        window.console && console.log( 'WordPress WhatsApp Support Google or Facebook analytics error message: ' + error.message );
                    }
                }
                
                try {
                    dataLayer.push({
                        'event': 'customEvent',
                        'eventCategory': fbGaAnalytics.ga_click_tracking_event_category,
                        'eventAction': fbGaAnalytics.ga_click_tracking_event_name,
                        'eventLabel': fbGaAnalytics.ga_click_tracking_event_label
                    });
                }
                catch ( error ) {
                    if ( wwsObj.isDeveloper == '1' ) {
                        window.console && console.log( 'WordPress WhatsApp Support Google or Facebook analytics error message: ' + error.message );
                    }
                }

            }

            if ( fbGaAnalytics.fb_click_tracking_status == 1 ) {

                var FBpixeled = false;
                try {
                    if ( ! FBpixeled ) {
                        fbq( 'trackCustom', 'WordPressWhatsAppSupport', {
                            event: fbGaAnalytics.fb_click_tracking_event_name,
                            account: fbGaAnalytics.fb_click_tracking_event_label
                        });
                        FBpixeled = true;
                    }
                }
                catch ( error ) {
                    if ( wwsObj.isDeveloper == '1' ) {
                        window.console && console.log( 'WordPress WhatsApp Support Google or Facebook analytics error message: ' + error.message );
                    }
                }

            }


        }


        function isGDPRChecked() {

            if ( wwsObj.isGDPR != 1 ) {
                return;
            }

            if ( jQuery('.wws-gdpr input').is(':checked') == false ) {
                jQuery( '.wws-gdpr > div' ).addClass('wws-shake-animation');
                setTimeout( function() { 
                    jQuery( '.wws-gdpr > div' ).removeClass('wws-shake-animation');
                }, 300 );
                return false;
            } else {
                return true;
            }

        }
        

        // Open and close the wws popup
        jQuery( '.wws-popup__open-btn, .wws-popup__close-btn' ).on('click', function(event) {
            event.preventDefault();

            wwsWidget.trigger();

        });


        // send message
        jQuery( document ).on('click', '.wws-popup__send-btn', function(event) {
            event.preventDefault();

            
            // If popup template is 7th
            if ( wwsObj.popupTemplate == 7 ) {

                var message         = jQuery( '.wws-popup__input' ).val();
                var number          = jQuery( '.wws-popup__fields-number' ).val();
                var whatsappNumber  = wwsObj.supportNumber;

                if ( isGDPRChecked() == false ) return;

                setTimeout( function() {
                    jQuery( '.wws-popup__fields-textarea-wrapper, .wws-popup__fields-number' ).removeClass( 'wws-shake-animation' );
                }, 300 );

                if ( number == '' || isNumber( number ) == false ) {
                    jQuery( '.wws-popup__fields-number' ).addClass( 'wws-shake-animation' );
                    return;
                }

                if ( message == '' ) {
                    jQuery( '.wws-popup__fields-textarea-wrapper' ).addClass( 'wws-shake-animation' );
                    return;
                }

                if( wwsWidget.sendMessage( ( message + wwsObj.preDefinedText ), whatsappNumber ) == true ) {
                    
                    sendAnalytics( message, number );

                }

            }

            if ( wwsObj.popupTemplate == 6 ) {

                var message         = jQuery( '.wws-popup__input' ).val();
                var preMessage      = jQuery( '.wws-popup-multi-support-pre-essage' ).val();
                var number          = jQuery( '.wws-popup__fields-number' ).val();
                var whatsappNumber  = jQuery( '.wws-popup-multi-support-number' ).val();

                if ( isGDPRChecked() == false ) return;

                setTimeout( function() {
                    jQuery( '.wws-popup__fields-textarea-wrapper, .wws-popup__fields-number' ).removeClass( 'wws-shake-animation' );
                }, 300 );

                if ( number == '' || isNumber( number ) == false ) {
                    jQuery( '.wws-popup__fields-number' ).addClass( 'wws-shake-animation' );
                    return;
                }

                if ( message == '' ) {
                    jQuery( '.wws-popup__fields-textarea-wrapper' ).addClass( 'wws-shake-animation' );
                    return;
                }

                if( wwsWidget.sendMessage( ( message + preMessage ), whatsappNumber ) == true ) {
                    
                    sendAnalytics( message, number );

                }

            }

            // if popup template is 1st, 2nd, or 3rd
            if ( wwsObj.popupTemplate == 1 || wwsObj.popupTemplate == 2 || wwsObj.popupTemplate == 3 ) {

                var message         = jQuery( '.wws-popup__input' ).val();
                var whatsappNumber  = wwsObj.supportNumber;

                if ( isGDPRChecked() == false ) return;

                setTimeout( function() {
                    jQuery( '.wws-popup__input-wrapper' ).removeClass( 'wws-shake-animation' );
                }, 300 );

                if ( message == '' ) {
                    jQuery( '.wws-popup__input-wrapper' ).addClass( 'wws-shake-animation' );
                    return;
                }

                if( wwsWidget.sendMessage( ( message + wwsObj.preDefinedText ), whatsappNumber ) == true ) {
                    
                    sendAnalytics( message );
                    wws_google_click_analytics('hi');

                }

            } 

            // if popup template is 4th
            if ( wwsObj.popupTemplate == 4 ) {

                var message         = jQuery( '.wws-popup__input' ).val();
                var whatsappNumber  = wwsObj.supportNumber;

                if( wwsWidget.sendMessage( ( message + wwsObj.preDefinedText ), whatsappNumber ) == true ) {
                    
                    sendAnalytics();
                    wws_google_click_analytics();

                }

            } 


        });

        // Hit enter to send a message.
        jQuery('.wws-popup__input').on( 'keypress', function (e) {
            
            var key = e.which;

            if(key == 13) { // the enter key code
                jQuery('.wws-popup__send-btn').click();
                return false;  
            }

        });

        // Group invitation
        jQuery( '.wws-popup-group-invitation__button' ).on( 'click', function() {
            wwsWidget.sendGroupInvitation( wwsObj.groupInvitationID );
            sendAnalytics();
            wws_google_click_analytics()
        });

        // Multi person support analytics
        jQuery( '.wws-popup__support-person-link' ).on('click', function( event ) {

            if ( isGDPRChecked() == false ) {
                event.preventDefault();
                return;
            }

            sendAnalytics();
            wws_google_click_analytics()
        });

        // autoPopup
        if ( wwsObj.autoPopup == '1' ) {
            wwsWidget.autoPopup( wwsObj.autoPopupTime );
        }


        // popup button display by scroll lenght
        if ( wwsObj.scrollLenght != null ) {

            jQuery(document).on( 'scroll', function () {

                var y = jQuery(window).scrollTop() + jQuery(window).height();
                var documentHeight = jQuery(document).height() * wwsObj.scrollLenght / 100;

                if (y >= documentHeight - 10 ) {
                    jQuery('.wws-popup-container').fadeIn();
                } else {
                    jQuery('.wws-popup-container').fadeOut();
                }

            });

        }


        // Layout 6 - open selected support person.
        jQuery( document ).on( 'click', '[data-wws-multi-support-person-id]', function() {
            
            var multiSupportPersonID = jQuery( this ).attr( 'data-wws-multi-support-person-id' );
            
            jQuery( '.wws-popup__support-person-wrapper' ).hide();
            jQuery( '.wws-popup__support-person-form' ).show();

            jQuery( '.wws-popup__support-person-form' ).html( wwsLoader );

            jQuery.ajax({
                url: wwsObj.adminAjaxURL,
                type: 'post',
                data: {
                    'action':   'wws_view_multi_person_form',
                    'support_person_id': multiSupportPersonID,
                    'post_id' : wwsObj.currentPageID,
                }
            }).done(function( response ) {
                jQuery( '.wws-popup__support-person-form' ).html( response );
            });
            
        } );
        

        // Layout 6 - close selected support person.
        jQuery( document ).on( 'click', '[data-wws-multi-support-back]', function() {

            jQuery( '.wws-popup__support-person-wrapper' ).show();
            jQuery( '.wws-popup__support-person-form' ).hide();

        } );



    }); // Document ready end here.

    
    
    

})(jQuery)