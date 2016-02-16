var isMobile = {
    Android: function(){
        return /Android/i.test(navigator.userAgent);
    }
};
//console.log(/Android/i.test(navigator.userAgent));
//console.log(isMobile.Android());
StringMorph.prototype.enableSelecting = function () {
    this.mouseDownLeft = function (pos) {
        if (isMobile.Android()){
            var input = prompt("Change input:", this.text);
            if (input != null){
                this.text = input;
                this.changed();
                this.drawNew();
                this.changed();
            }
        }
        else {
            this.clearSelection();
            if (this.isEditable && (!this.isDraggable)) {
                this.edit();
                this.root().cursor.gotoPos(pos);
                this.startMark = this.slotAt(pos);
                this.endMark = this.startMark;
                this.currentlySelecting = true;
            }
        }
    };
    this.mouseMove = function (pos) {
        if (this.isEditable &&
            this.currentlySelecting &&
            (!this.isDraggable)) {
            var newMark = this.slotAt(pos);
            if (newMark !== this.endMark) {
                this.endMark = newMark;
                this.drawNew();
                this.changed();
            }
        }
    };
};
TextMorph.prototype.setText = function(string){
    this.text = string;
    this.changed();
    this.drawNew();
    this.changed();
};
ScrollFrameMorph.prototype.addContents2 = function(morph){
    var xpos= 3, ypos = this.ypos || 15;
    morph.setPosition(new Point(xpos, this.contents.top()+ypos));
    this.addContents(morph);
    this.ypos = 50 + ypos;
};

HandMorph.prototype.processDrop = function (event) {
    /*
     find out whether an external image or audio file was dropped
     onto the world canvas, turn it into an offscreen canvas or audio
     element and dispatch the

     droppedImage(canvas, name)
     droppedSVG(image, name)
     droppedAudio(audio, name)

     events to interested Morphs at the mouse pointer
     */
    var files = event instanceof FileList ? event
            : event.target.files || event.dataTransfer.files,
        file,
        url = event.dataTransfer ?
            event.dataTransfer.getData('URL') : null,
        txt = event.dataTransfer ?
            event.dataTransfer.getData('Text') : null,
        src,
        target = this.morphAtPointer(),
        img = new Image(),
        canvas,
        i;

    function readSVG(aFile) {
        var pic = new Image(),
            frd = new FileReader();
        while (!target.droppedSVG) {
            target = target.parent;
        }
        pic.onload = function () {
            target.droppedSVG(pic, aFile.name);
        };
        frd = new FileReader();
        frd.onloadend = function (e) {
            pic.src = e.target.result;
        };
        frd.readAsDataURL(aFile);
    }

    function readImage(aFile) {
        var pic = new Image(),
            frd = new FileReader();
        while (!target.droppedImage) {
            target = target.parent;
        }
        pic.onload = function () {
            canvas = newCanvas(new Point(pic.width, pic.height));
            canvas.getContext('2d').drawImage(pic, 0, 0);
            target.droppedImage(canvas, aFile.name);
        };
        frd = new FileReader();
        frd.onloadend = function (e) {
            pic.src = e.target.result;
        };
        frd.readAsDataURL(aFile);
    }

    function readAudio(aFile) {
        var snd = new Audio(),
            frd = new FileReader();
        while (!target.droppedAudio) {
            target = target.parent;
        }
        frd.onloadend = function (e) {
            snd.src = e.target.result;
            target.droppedAudio(snd, aFile.name);
        };
        frd.readAsDataURL(aFile);
    }

    function readText(aFile) {
        var frd = new FileReader();
        while (!target.droppedText) {
            target = target.parent;
        }
        frd.onloadend = function (e) {
            target.droppedText(e.target.result, aFile.name);
        };
        frd.readAsText(aFile);
    }

    function readBinary(aFile) {
        var frd = new FileReader();
        while (!target.droppedBinary) {
            target = target.parent;
        }
        frd.onloadend = function (e) {
            target.droppedBinary(e.target.result, aFile.name);
        };
        frd.readAsArrayBuffer(aFile);
    }

    function parseImgURL(html) {
        var iurl = '',
            idx,
            c,
            start = html.indexOf('<img src="');
        if (start === -1) {return null; }
        start += 10;
        for (idx = start; idx < html.length; idx += 1) {
            c = html[idx];
            if (c === '"') {
                return iurl;
            }
            iurl = iurl.concat(c);
        }
        return null;
    }

    if (files.length > 0) {
        for (i = 0; i < files.length; i += 1) {
            file = files[i];
            if (file.type.indexOf("svg") !== -1
                && !MorphicPreferences.rasterizeSVGs) {
                readSVG(file);
            } else if (file.type.indexOf("image") === 0) {
                readImage(file);
            } else if (file.type.indexOf("audio") === 0) {
                readAudio(file);
            } else if (file.type.indexOf("text") === 0) {
                readText(file);
            } else { // assume it's meant to be binary
                readBinary(file);
            }
        }
    } else if (url) {
        if (
            contains(
                ['gif', 'png', 'jpg', 'jpeg', 'bmp'],
                url.slice(url.lastIndexOf('.') + 1).toLowerCase()
            )
        ) {
            while (!target.droppedImage) {
                target = target.parent;
            }
            img = new Image();
            img.onload = function () {
                canvas = newCanvas(new Point(img.width, img.height));
                canvas.getContext('2d').drawImage(img, 0, 0);
                target.droppedImage(canvas);
            };
            img.src = url;
        }
    } else if (txt) {
        while (!target.droppedImage) {
            target = target.parent;
        }
        img = new Image();
        img.onload = function () {
            canvas = newCanvas(new Point(img.width, img.height));
            canvas.getContext('2d').drawImage(img, 0, 0);
            target.droppedImage(canvas);
        };
        src = parseImgURL(txt);
        if (src) {img.src = src; }
    }
};

Morph.prototype.copy = function () {
 var c = copy(this);
 var gui = this.parentThatIsA(GuiMorph);
 var title;

     c.parent = null;
     c.children = [];
     if ((this.operator == "DataSet") ||  (this.operator == "View")) {
     var strings = this.children.filter(function (morph) {
     return morph instanceof StringMorph
     });
         if (strings.length > 0) {
             for (i = 0; i < strings.length; i++) {
                 title = strings[i];
                 title.color = 'white';
                 title.drawNew();
             }

         }
     }


    c.bounds = this.bounds.copy();

    



    return c;
};
