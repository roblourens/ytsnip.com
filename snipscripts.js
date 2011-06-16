var noFlashErr = 'You need Flash player 8+ and JavaScript enabled to view this video.';
var origStartZero = 0;
var controlsW = 711;
var handleW = 9;
var vId = '';
var intervalCode = 0;
var volume = 100;

google.load("jquery", "1.6.1");
google.load("jqueryui", "1.8.13");

function onYouTubePlayerReady(playerId) {
    ytplayer = $("#ytPlayer")[0];
    ytplayer.playVideo();
    ytplayer.pauseVideo();
    setInterval(checkFinished, 200);
    updateTimes();
    updateResultURL();

    // Make the area visible
    $('#controls').css('visibility', 'visible');
}

function validateAndGetId(input) {
    if (input.length == 11) {
        var matchId = /\S{11}/;
        var matches = matchId.exec(input);
        if (matches.length==1)
            return matches[0];
        else
            return '';
    }
    else {
        var matchId = /v=(\S{11})/;
        var matches = matchId.exec(input);
        if (matches != null && matches.length == 2) 
            return matches[1];
        else
            return '';
    }
}

// Jquery UI 'draggable'- an object can have a containment only in absolute coords
function makeAbs(bounds) {
    bounds[0] += origStartZero;
    bounds[2] += origStartZero;

    return bounds
}

function initControls() {
    var opts = {axis: 'x',  
                    stop: function(event, ui) {
                        updateContainments(event, ui);
                        //updateVideoPosition(event.target.id, true);
                    },

                    drag: function(event, ui) {
                        updateTimes();
                        updateMarkBar(event.target.id, ui.position.left);
                        updateVideoPosition(event.target.id, ui.position.left, false);
                        updateResultURL();
                    }
                };

    opts['containment'] = makeAbs([0, 0, controlsW-handleW, 0]);
    $("#startMark").draggable(opts);

    opts['containment'] = makeAbs([handleW, 0, controlsW, 0]);
    $("#endMark").draggable(opts);
}

function loadVid() {
    var input = $("#vidUrl").attr('value');
    vId = validateAndGetId(input);
    var errFadeDuration = 2000;
    if (vId != '') {
        $('#inputErr').fadeOut(200);
        var params = { allowScriptAccess: "always" };
        var atts = { id: "ytPlayer" };
        swfobject.embedSWF("http://www.youtube.com/e/"+vId+"?enablejsapi=1&version=3",
                "videoDiv", "720", "405", "8", null, null, params, atts);
        $('#videoDiv').html(noFlashErr);
        $('#controls').show();
    }
    else
        $('#inputErr').fadeIn(errFadeDuration);

    origStartZero = $('#startMark').offset().left;
    initControls();
}

function startTime() {
    return secsFromTimeStr($('#startTime').val());
}

function endTime() {
    return secsFromTimeStr($('#endTime').val());
}

function secsToTimeStr(totalSecs) {
    var mins = Math.floor(totalSecs/60);
    var secs = Math.floor(totalSecs-mins*60);
    if ((''+secs).length == 1)
        secs = '0'+secs;
    //var qSecs = Math.floor(4*(totalSecs-mins*60-secs))/4*1000;
    return mins+':'+secs;
}

function xCoordToTime(pos) {
    pos-=handleW;
    var vidDuration = ytplayer.getDuration();
    // subtract the right handleW from controlsW (which already accounts for left handleW, oops)
    var posSecs = pos/(controlsW-handleW)*vidDuration;
    return posSecs;
}

function secsFromTimeStr(time) {
    var matches = /(\d+):(\d+)/.exec(time);
    if (matches != null) {
        var mins = parseInt(matches[1]);
        var secs = parseInt(matches[2]);
        secs += mins*60;
        return secs;
    }
    else
        return -1;
}

function timeToXCoord(id) {
        var secs = secsFromTimeStr($('#'+id).val());
        if (secs==-1)
            return -1;

        return secs/ytplayer.getDuration()*(controlsW-handleW) + handleW;
}

function startXCoord() {
    return $('#startMark').position().left+handleW;
}

function endXCoord() {
    return $('#endMark').position().left;
}

function updateTimes() {
    // update start and end time fields
    var startT = xCoordToTime(startXCoord());
    var endT = xCoordToTime(endXCoord());
    $('#startTime').val(secsToTimeStr(startT));
    $('#endTime').val(secsToTimeStr(endT));
}

function updateContainments(event, ui) {
    var draggedId = event.target.id;
    var otherId = draggedId == 'startMark' ? 'endMark' : 'startMark';
    var newLeft = ui.position.left;
    var newContains;
    if (otherId == 'startMark')
        newContains = makeAbs([0, 0, newLeft-handleW, 0]);
    else 
        newContains = makeAbs([newLeft+handleW, 0, controlsW, 0]);
    $('#'+otherId).draggable('option', 'containment', newContains);
}

function updateMarkBar(id, newLeft) {
    if (id == 'startMark')
        $('#startMarkBar').width(newLeft);
    else
        $('#endMarkBar').width(controlsW-newLeft);
}

function updateVideoPosition(id, done) {
    if (id == 'startMark' && ytplayer.getCurrentTime() < xCoordToTime(startXCoord()))
        ytplayer.seekTo(startTime(), done);
    else if (id == 'endMark' && ytplayer.getCurrentTime() > xCoordToTime(endXCoord()))
        ytplayer.seekTo(endTime(), done);
}

function updateMarks() {
    var startPos = timeToXCoord('startTime');
    var endPos = timeToXCoord('endTime');

    // make sure these are within their containments
    if (startPos != -1 && startPos > $('#startMark').draggable('option', 'containment')[2])
        return;
    if (endPos != -1 && endPos < $('#endMark').draggable('option', 'containment')[0])
        return;

    $('#startMark').css('left', startPos);
    updateMarkBar('startMark', startPos);
    $('#endMark').css('left', endPos);
    updateMarkBar('endMark', endPos);
}

function play() {
    // Hide and mute the player, save the previously set volume
    /*$('#ytPlayer').css('visibility', 'hidden');
    volume = ytplayer.getVolume();
    ytplayer.setVolume(0);*/

    //intervalCode = setInterval(checkStart, 100);
    ytplayer.seekTo(startTime());
    ytplayer.playVideo();
}

// Constantly runs to pause when finished
function checkFinished() {
    if (ytplayer.getPlayerState() >= 1 && ytplayer.getPlayerState() != 2)
        if (ytplayer.getCurrentTime() >= endTime())
            ytplayer.pauseVideo();
}

// Runs when the HTML play button is pressed
function checkStart() {
    console.log(ytplayer.getPlayerState());
    if (ytplayer.getPlayerState() >= 1 && ytplayer.getPlayerState() != 2)
        if (ytplayer.getCurrentTime() >= startTime()) {
            // Display the player and resume the volume
            $('#ytPlayer').css('visibility', 'visible');
            ytplayer.setVolume(volume);
            clearInterval(intervalCode);
        }
}
    

function timeURLstr(secs) {
    var m = Math.floor(secs/60);
    var s = secs - m*60;

    var URLstr = '';
    if (m>0)
        URLstr = m+'m';
    if (s>0)
        URLstr += s+'s';

    if (URLstr == '')
        URLstr = '0s';

    return URLstr;
}

function updateResultURL() {
    $('#resultURL').val('http://localhost/~rob/ytsnip/?v='+vId+'&t='+timeURLstr(startTime())+'&e='+timeURLstr(endTime()));
}
