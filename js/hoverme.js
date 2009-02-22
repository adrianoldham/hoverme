var HoverMe = Class.create({
    options: {
	    hideOriginal: false,                                            // whether to hide the original image or not
	    disableAnimation: false,                                        // disable of all animation regardless
	    disableAnimationForIE: true,                                    // disable any animation if in IE6 or 7
        effect: { show: Effect.Appear, hide: Effect.Fade, options: {} } // options is the options passed into the Effect constructor
    },
    
    initialize: function(selector, options) {
        this.options = Object.extend(Object.extend({ }, this.options), options || { });
        this.images = $$(selector);
        
        // Setup the images
        this.images = this.images.map(function(image) {
            return new HoverMe.Image(image, this.options);
        }.bind(this));
    }
});

HoverMe.Image = Class.create({
    options: {
    },
    
    initialize: function(image, options) {
        this.options = Object.extend(Object.extend({ }, this.options), options || { });
        
        this.image = $(image);
        
        this.setupEffect();
        this.setupBrowsers();
        this.setupImage();
        this.setupHoverImage();
    },
    
    setupEffect: function() {
        this.effectOptions = Object.extend({}, this.options.effect.options);
    },
    
    setupBrowsers: function() {
        this.disableAnimation = this.options.disableAnimation;
        
        // disable animation if it's IE and we want to disable it for IE
        this.disableAnimation = this.options.disableAnimation || 
            ((Prototype.Browser.IE6 || Prototype.Browser.IE7) && this.options.disableAnimationForIE);
    },
    
    setupImage: function() {
        this.image.observe("mouseover", this.showHoverImage.bindAsEventListener(this));
        this.image.observe("mouseout", this.hideHoverImage.bindAsEventListener(this));
        
        this.image.iePNGFix();
    },
    
    setupHoverImage: function() {
        // create the hover image out of the longdesc of the original image
        this.hoverImage = $(new Image());
        this.hoverImage.setAttribute("src", this.image.readAttribute('longdesc'));
        this.hoverImage.setAttribute("alt", this.image.readAttribute('alt'));
        
        this.hoverImage.setStyle({
            position: "absolute",
            display: "none"
        });
        
        // make sure it's absolute position will be relative to the image
        $(this.image.parentNode).insert(this.hoverImage);
        
        // mouseout of hover image (since it's on top of original image) will hide it
        this.hoverImage.observe("mouseout", this.hideHoverImage.bindAsEventListener(this));
        
        this.hoverImage.iePNGFix();
    },
    
    showHoverImage: function(event) { 
        // show only if we move into of the "image" from the outside 
        if (event.relatedTarget == this.image || event.relatedTarget == this.hoverImage) return;

        var position = this.image.positionedOffset();
        
        this.hoverImage.width = this.image.width;
        this.hoverImage.height = this.image.height;
        
        this.hoverImage.setStyle({
            width: this.image.width + "px",
            height: this.image.height + "px",
            left: position.left + "px",
            top: position.top + "px",
            opacity: 1,
            display: "none"
        });
        
        // if hide original image is on, then hide it before showing hover image
        if (this.options.hideOriginal) {
            this.image.setOpacity(0);
        }
        
        // show the image using the effect given
        if (this.disableAnimation) {
            this.hoverImage.show();
        } else {
            if (this.effect && this.effect.cancel) this.effect.cancel();
            this.effect = new this.options.effect.show(this.hoverImage, this.effectOptions);
        }
    },
    
    hideHoverImage: function(event) {
        // hide only if we move out of the "image"
        if (event.relatedTarget == this.image || event.relatedTarget == this.hoverImage) return;
        
        // if hide original image is on, then show it before hiding hover image
        if (this.options.hideOriginal) {
            this.image.setOpacity(1);
        }
        
        // hide the image using the effect given
        if (this.disableAnimation) {
            this.hoverImage.hide();
        } else {
            if (this.effect && this.effect.cancel) this.effect.cancel();
            this.effect = new this.options.effect.hide(this.hoverImage, this.effectOptions);
        }
    }
});