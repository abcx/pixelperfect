/*
 * // init pixelPerfect widget
 * $.getScript( "http://bi.im-g.pl/adamTest/pixelperfect.js");
 */
var gazeta_pl = gazeta_pl || {};

/* append stylesheet */
$('<link/>', {rel: 'stylesheet', href: 'https://abcx.github.io/pixelperfect/pixelperfect.css'}).appendTo( 'head');

$.getScript( "https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js", function( data, textStatus, jqxhr ) {
	//console.log( data ); // Data returned
	//console.log( textStatus ); // Success
	//console.log( jqxhr.status ); // 200

    var pp = gazeta_pl.pixelPerfect.init();

    // http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
    //
    // We start by checking if the browser supports the 
    // Clipboard object. If not, we need to create a 
    // contenteditable element that catches all pasted data 
    if (!window.Clipboard) {
       var $pasteCatcher = $( '#pixelperfect_image' );
    
       // Firefox allows images to be pasted into contenteditable elements
       $pasteCatcher.attr("contenteditable", "");
        
       // We can hide the element and append it to the body,
       //$pasteCatcher.css( 'opacity', $( '.pixelperfect' ).find( 'input[name=pp_opacity]' ).val() );
     
       // as long as we make sure it is always in focus
       $pasteCatcher.focus();
       
       //$('body').click(function() { $pasteCatcher.focus(); });
    } 
    // Add the paste event listener
    window.addEventListener("paste", pasteHandler);
     
    /* Handle paste events */
    function pasteHandler(e) {
       // We need to check if event.clipboardData is supported (Chrome)
       if (e.clipboardData) {
          // Get the items from the clipboard
          var items = e.clipboardData.items;
          if (items) {
             // Loop through all items, looking for any kind of image
             for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                   // We need to represent the image as a file,
                   var blob = items[i].getAsFile();
                   // and use a URL or webkitURL (whichever is available to the browser)
                   // to create a temporary URL to the object
                   var URLObj = window.URL || window.webkitURL;
                   var source = URLObj.createObjectURL(blob);
                    
                   // The URL can then be used as the source of an image
                   createImage(source);
                }
             }
          }
       // If we can't handle clipboard data directly (Firefox), 
       // we need to read what was pasted from the contenteditable element
       } else {
          // This is a cheap trick to make sure we read the data
          // AFTER it has been inserted.
          setTimeout(checkInput, 1);
       }
    }
     
    /* Parse the input in the paste catcher element */
    function checkInput() {
       // Store the pasted content in a variable
       var child = pasteCatcher.childNodes[0];
     
       // Clear the inner html to make sure we're always
       // getting the latest inserted content
       pasteCatcher.innerHTML = "";
        
       if (child) {
          // If the user pastes an image, the src attribute
          // will represent the image as a base64 encoded string.
          if (child.tagName === "IMG") {
             createImage(child.src);
          }
       }
    }
     
    /* Creates a new image from a given source */
    function createImage(source) {
		
		var pastedImage = new Image();
		 
		pastedImage.onload = function() {
            
            var scrolly = $(window).scrollTop() + 'px',
                $ppi = $( '#pixelperfect_image' );
            
			$ppi.attr( 'src', source );
			// save to localstorage
			imgData = gazeta_pl.pixelPerfect.getBase64Image( $ppi.get( 0 ) );
			localStorage.setItem( 'pixelperfect_image', imgData );
            $ppi.parent().css( 'top', scrolly );
            gazeta_pl.pixelPerfect.$pixelperfect.find( 'input[name=pp_movey]' ).val( scrolly );
			console.log('--- pixelperfect: save image to localstorage');
		}
		pastedImage.src = source;
    }
});


gazeta_pl.pixelPerfect = {
    /*
     * pixelPerfect 1.0 widget [abcx]
     * 
     * compatiblity: newest Chrome, Firefox, IE11+
     */
    $pixelperfect: {},
    $pixelperfect_img: {},
    $pixelperfect_img_parent: {},
    mobile: false,
    
    init: function() {
		
        var me = gazeta_pl.pixelPerfect,
            $body = $( 'body' );

        if ( $body.hasClass( 'responsive' ) ) {
            gazeta_pl.pixelPerfect.mobile = true;
            console.log( "--- pixelperfect MOBILE: started..." );
        }
        else {
            console.log( "--- pixelperfect: started..." );
        }

        me.draw( $body );
		
		var	coords = JSON.parse( localStorage.getItem( 'pixelperfect_coords' ) );
		
        me.onLoad();
		
		if ( coords !== null ) {
            me.$pixelperfect_img_parent.css({
				'top': coords.top,
				'left': coords.left
			});
			me.$pixelperfect_img_parent.css({
				'opacity': coords.opacity
			});
			me.$pixelperfect.find( 'input[name=pp_opacity]' ).val( coords.opacity );
			
			me.printCoords( me.$pixelperfect_img_parent );
			console.log('--- pixelperfect: set position from localstorage' );
        }
        me.onChange();
        me.onClick();
        //me.onScroll();
        me.onKeyDown();
		me.onMinify();
    },
    
    draw: function( $body ) {

        var me = gazeta_pl.pixelPerfect,
            html =  '<div class="pixelperfect">' +
                    //'   <h3>PixelPerfect<span>zwi\u0144</span></h3>';
                    '   <h3>PixelPerfect<span>na d\u00f3\u0142</span></h3>';
        if ( !gazeta_pl.pixelPerfect.mobile ) {
            html += '   <p>Copy image to clipboard <strong>[CTRL+C]</strong> and paste to browser window <strong>[CTRL+V]</strong>.</p><p>Move image <strong>ARROW</strong> keys<br>or <strong>SHIFT + ARROW</strong> keys.</p>';
        }
        //else {
        //    html += me.drawMobileArrows( $body );
        //}
        html +=     '   <div class="pp_hide">Hide image</div>' +
                    '   <div class="pp_item pp_opacity"><span>Opacity</span> <input type="text" name="pp_opacity" value="0.75"></div>';
        if ( !gazeta_pl.pixelPerfect.mobile ) {
        html +=     '   <div class="pp_item pp_movex"><span>X</span> <input type="text" name="pp_movex" value="0"></div>' +
                    '   <div class="pp_item pp_movey"><span>Y</span> <input type="text" name="pp_movey" value="0"></div>';
                    //'   <div class="pp_item pp_scrolly"><span>ScrollY</span> <input type="text" name="pp_scrolly" value="0" disabled="disabled"></div>';
        }
        html +=     '</div>',
            image =
        '<div class="pixelperfect_img">' +
        '   <img id="pixelperfect_image" style="max-width: none;">' +
        '</div>';

        $body.append( html );
        
        $body.append( image );
        
        me.$pixelperfect = $( '.pixelperfect' );
        me.$pixelperfect_img = $( '#pixelperfect_image' );
        me.$pixelperfect_img_parent = $( '.pixelperfect_img' );
    },
    
    drawMobileArrows: function( $body ) {
        
        return  '<div class="arrows">' +
                '   <span class="up"></span>' +
                '   <span class="right"></span>' +
                '   <span class="bottom"></span>' +
                '   <span class="left"></span>' +
                '</div>';
    },
	
    printCoords: function( $pp ) {
        $( '.pp_movex input' ).val( $pp.css( 'left' ) );
        $( '.pp_movey input' ).val( $pp.css( 'top' ) );
		localStorage.setItem( 'pixelperfect_coords', JSON.stringify({
			'opacity': $pp.css( 'opacity' ) || 0.75,
			'top': $pp.css( 'top' ),
			'left': $pp.css( 'left' )
		}));
        //console.log( 'X:', $pp.css( 'left' ) );
        //console.log( 'Y:', $pp.css( 'top' ) );
    },
	
    onLoad: function() {
        /* change image opacity on load */
        var me = gazeta_pl.pixelPerfect,
			dataImage = localStorage.getItem( 'pixelperfect_image' ),
			bannerImg = {};

		if ( dataImage ) {
			// load from localstorage
			bannerImg = document.getElementById( 'pixelperfect_image' );
			bannerImg.src = "data:image/png;base64," + dataImage;
			console.log('--- pixelperfect: load image from localstorage');
		}
    },
	
    onChange: function() {
        /* change image opacity on change */
        var me = gazeta_pl.pixelPerfect,
			$pp_opacity = me.$pixelperfect.find( 'input[name=pp_opacity]' ),
			$pp_movex = me.$pixelperfect.find( 'input[name=pp_movex]' ),
			$pp_movey = me.$pixelperfect.find( 'input[name=pp_movey]' );
        
        $pp_opacity.bind( 'change', function() {
            me.$pixelperfect_img_parent.css( 'opacity', $pp_opacity.val() );
			me.printCoords( me.$pixelperfect_img_parent );
        });
		
        $pp_movex.bind( 'change', function() {
            me.$pixelperfect_img_parent.css( 'left', $pp_movex.val() );
        });
		
        $pp_movey.bind( 'change', function() {
            me.$pixelperfect_img_parent.css( 'top', $pp_movey.val() );
        });
    },
	
    onClick: function() {
        /* hide/show image */
        var me = gazeta_pl.pixelPerfect,
            $this = me.$pixelperfect,
            $pp = me.$pixelperfect_img_parent,
            move = 1;
            
        //if ( e.shiftKey ) {
        //    move = 10;
        //}
        $this.find( '.pp_hide' ).bind( 'click', function() {
            var $pp = me.$pixelperfect_img.parent();
            $pp.toggleClass( 'pp_hide_image' );
			if ( $pp.hasClass( 'pp_hide_image' ) ) {
				$this.find( '.pp_hide' ).text( 'Show image' );
			}
			else {
				$this.find( '.pp_hide' ).text( 'Hide image' );
			}
        });
        
        //$this.find( '.arrows span.up' ).bind( 'click', function() {
        //    $pp.css( 'top', '-=' + move + 'px' );
        //    me.printCoords( $pp );
        //});
        //$this.find( '.arrows span.right' ).bind( 'click', function() {
        //    $pp.css( 'left', '+=' + move + 'px' );
        //    me.printCoords( $pp );
        //});
        //$this.find( '.arrows span.bottom' ).bind( 'click', function() {
        //    $pp.css( 'top', '+=' + move + 'px' );
        //    me.printCoords( $pp );
        //});
        //$this.find( '.arrows span.left' ).bind( 'click', function() {
        //    $pp.css( 'left', '-=' + move + 'px' );
        //    me.printCoords( $pp );
        //});
    },
    
    //onScroll: function() {
    //    /* print scrollTop */
    //    $(window).scroll(function() {
    //        $( '.pp_scrolly input' ).val( $( '.pp_movey' ).val() - $(window).scrollTop() );
    //    });
    //},
	
	onMinify: function() {
		/* toggle pixelperfect minification */
        var me = gazeta_pl.pixelPerfect,
            $this = me.$pixelperfect;
        
        $this.find( 'h3' ).bind( 'click', function(e) {
            e.stopImmediatePropagation();
			$this.toggleClass( 'minify' );
//			if ( $this.hasClass( 'minify' ) ) {
//                $this.find( 'h3 span').text( 'rozwi\u0144' );
//            }
//			else {
//				$this.find( 'h3 span').text( 'zwi\u0144' );
//			}
		});
        $this.find( 'h3 span' ).bind( 'click', function(e) {
            e.stopImmediatePropagation();
            $this.toggleClass( 'move' );
			if ( $this.hasClass( 'move' ) ) {
                $this.find( 'h3 span').text( 'do g\u00f3ry' );
            }
			else {
				$this.find( 'h3 span').text( 'na d\u00f3\u0142' );
			}
        });
	},
	
    onKeyDown: function() {
        /* moving image */
        var me = gazeta_pl.pixelPerfect,
            $pp = me.$pixelperfect_img_parent;
        
        $('body').keydown(function(e) {
            var move = 1;
            if ( e.shiftKey ) {
                move = 10;
            }
            switch ( e.keyCode ) {
                case 37: // left arrow
                    e.preventDefault();
                    $pp.css( 'left', '-=' + move + 'px' );
                    me.printCoords( $pp );
                break;
                case 39: // right arrow
                    e.preventDefault();
                    $pp.css( 'left', '+=' + move + 'px' );
                    me.printCoords( $pp );
                break;
                case 38 : // top arrow
                    e.preventDefault();
                    $pp.css( 'top', '-=' + move + 'px' );
                    me.printCoords( $pp );
                break;
                case 40: // down arrow
                    e.preventDefault();
                    $pp.css( 'top', '+=' + move + 'px' );
                    me.printCoords( $pp );
                break;
            }
        }); 
    },
	
	getBase64Image: function( img ) {
		
		var canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height,
			ctx = canvas.getContext("2d");

		ctx.drawImage(img, 0, 0);
		var dataURL = canvas.toDataURL("image/png");
		return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
	}
}
