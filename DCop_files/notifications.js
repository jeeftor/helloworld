$(document).ready(function(){    
    // --- GLOBAL VARIABLES ---
    var containerWidth = $('#notifications_container').width();
    var dismissWidth = 39;
    var timerWidthIncrement = 45;
    var divStartX = 0;
    var notifications = [];

    
    // --- NOTIFICATION PROTOTYPE ---
    var Notification = function (lblType, lblTxt, noteTxt, divID) {
        this.divID = divID;
        
        var countdownhtml = "<div class='countdown' id='countdown_" + this.divID + "'></div>";
        var labelhtml   = "<div class='" + lblType + "'>" +
                            "<div class='label_text'>" + lblTxt + 
                                countdownhtml + 
                            "</div>" + 
                         "</div>";
        var snoozehtml = "<div class='snooze'><div class='snooze_text'></div></div>";
        var notehtml = generateNoteHTML(noteTxt, this.divID);
        var dismisshtml = "<div class='dismiss' id='dismiss_" + this.divID + "'><img src='images/dismiss_preview.png'></div>";
                            
        $('#notifications_container').append("<div class='notification' id='" + this.divID + "'>" +
                                                "<div class='content' id='content_" + this.divID + "'>" +
                                                    snoozehtml + notehtml + labelhtml +
                                                "</div>" +
                                                dismisshtml +
                                             "</div>");
        var p = $('.content', '#'+this.divID).position();
        this.originX = p.left;
    };
    
    Notification.prototype.snooze = function (repetitions) {
        $('#'+this.divID).css({ opacity: 0.6 });
        $('#countdown_'+this.divID).html(repetitions + " min");
        
        var x = 1;
        var id = this.divID;
        var snoozeID = window.setInterval(function () {
            $('#countdown_'+this.divID).html((repetitions - x) + " min");            
            if (++x === repetitions + 1) {
                $('#'+this.divID).css({ opacity: 1.0 });
                $('#countdown_'+this.divID).html("");
                window.clearInterval(snoozeID);
                
                //return to the neutral position
                var p = $('#content_'+this.divID).position();
                var delta = this.originX - p.left;          
                $('#content_'+this.divID).animate({
                    opacity: 1,
                    left: "+=" + delta
                    }, 500, function() {
                        $('#dismiss_'+id).position({
                            my: "left top",
                            at: "left top",
                            of: $(this)  
                            });
                    });
            }
        }.bind(this), 2000);        
        this.snoozeID = snoozeID;
    }
    
    Notification.prototype.killSnooze = function(){
        window.clearInterval(this.snoozeID);
        $('#'+this.divID).css({ opacity: 1.0 });
        $('#countdown_'+this.divID).html("");
    };
    
    
    // --- GENERATE NOTIFICATIONS ---
    var notification1 = new Notification('red_label', 'TFR', "12 o'clock & 10 miles", 'notification1');
        notifications["notification1"] = notification1;
    var notification2 = new Notification('green_label', '125.17', 'SFO ATIS', 'notification2');
        notifications["notification2"] = notification2;
    var notification3 = new Notification('green_label', 'GUMPS', 'button', 'notification3');
        notifications["notification3"] = notification3;
        
    
    // --- EVENT HANDLING ---
    $( ".content" ).mousedown(function(){
        var p = $(this).position();
        divStartX = p.left;
    });
    
    $( ".content" ).draggable({ 
        axis: "x",
        
        drag: function(event, obj){
            var p = $(this).position();
            var delta = p.left - divStartX;        
            
            //restrict the drag for the stretch timer
            if(obj.position.left < timerWidthIncrement * -5){
               obj.position.left = timerWidthIncrement * -5;
            } 
            
            //if dragging to the left of the neutral position set the stretch timer...
            if (obj.position.left < 0) {
                //snooze labeling
                var timerSetting = Math.floor(Math.abs(obj.position.left) / timerWidthIncrement);
                if (timerSetting === 0) {
                    $('.snooze', this).css({ opacity: 0.5 });
                } else {
                    $('.snooze', this).css({ opacity: 1.0 });
                }
                $('.snooze_text', '.snooze', this).html("<img src='images/" + timerSetting + ".png'>");
                $(this).siblings('.dismiss').css({ opacity: 0.0 });
            
            //... if dragging and you have moved at least x pixels then show the dismiss cue...
            } else if (delta > dismissWidth) {
                $(this).siblings('.dismiss').position({
                      my: "right top",
                      at: "left top",
                      of: $(this)  
                });
                $(this).siblings('.dismiss').html("<img src='images/dismiss.png'>");
                $(this).siblings('.dismiss').css({ opacity: 1.0 });
            } else if (delta > 0) {
                $(this).siblings('.dismiss').html("<img src='images/dismiss_preview.png'>");
                $(this).siblings('.dismiss').css({ opacity: 1.0 });
            }
        },
        
        stop: function(event, obj){
            var id = $(this).parent().attr('id');
            var p = $(this).position();
            var delta = p.left - divStartX;
                        
            //IF CURRENT POSITION IS MORE THAN timerWidthIncrement PIXELS FROM THE POSITION WHEN THE DRAG STARTED, THEN DISMISS   
            if(delta > timerWidthIncrement) {
                notifications[id].killSnooze();
                $(this).animate({
                    opacity: 0.0,
                    left: "+=1000"
                    }, 1000, function() {
                        $(this).siblings('.dismiss').remove();
                        $(this).parent().hide(500);
                    });
               $(this).siblings('.dismiss').animate({
                    opacity: 0.0,
                    left: "+=1000",
                    }, 1000, function() {
                    });
                
            //... IF THE CONTENT IS FAR ENOUGH TO THE LEFT OF THE ORIGINAL POSITION SET THE SNOOZE AND MOVE TO THE TAG POSITION 
            } else if (obj.position.left < -timerWidthIncrement) {
                notifications[id].killSnooze();
                
                // set snooze
                var timerSetting = Math.floor(Math.abs(obj.position.left) / timerWidthIncrement);
                notifications[id].snooze(timerSetting);
                
                //determine note width & delta to set tag position so that just the colored label shows
                var noteWidth = getNoteWidth($('#note_'+id).text());
                delta = notifications[id].originX - p.left + noteWidth;
                
                //move to tag position
                $(this).animate({
                    opacity: 1,
                    left: "+=" + delta
                    }, 500, function() {
                        $(this).siblings('.dismiss').position({
                            my: "left top",
                            at: "left top",
                            of: $(this)  
                            });
                    });

            //... OTHERWISE YOU ARE NEITHER SETTING THE SNOOZE NOR DISMISSING SO RETURN TO THE NEUTRAL OR TAG POSITION AS APPRORIATE
            } else {
                if (obj.position.left < 0) {
                    notifications[id].killSnooze();
                    delta = notifications[id].originX - p.left;
                } else {
                    //not killing timers here - leave the setting as is
                    delta = divStartX - p.left;
                }
                $(this).animate({
                    opacity: 1,
                    left: "+=" + delta
                  }, 500, function() {
                    $(this).siblings('.dismiss').position({
                        my: "left top",
                        at: "left top",
                        of: $(this)  
                        });
                  });
            }
        }
    });
    

    // --- GENERAL USE FUNCTIONS ---
    function getNoteWidth (txt) {
        var divHTML = "";
        if (txt === "open") {
            divHTIL = generateNoteHTML("button", "x-x");
        } else {
            divHTIL = generateNoteHTML(txt, "x-x");
        }
        return divWidth("<div class='tmp'>" + divHTIL + "</div>");
    }
    
    function generateNoteHTML(txt, id) {
        var notehtml = "";
        if (txt === "button") {
            notehtml = "<div class='note' id='note_" + id + "'><div class='note_text'><a class='button' href='#'>open</a></div></div>"
        } else {
            notehtml = "<div class='note' id='note_" + id + "'><div class='note_text'>" + txt + "</div></div>"
        }
        return notehtml;
    }

    function divWidth(txt) {
        $('#notifications_container').append(txt);
        var widthVal = $('.tmp').width();
        $(".tmp").remove();
        return widthVal;
    }
    
});