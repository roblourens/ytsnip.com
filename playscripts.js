var pad = 6;
var controlsW = 717;
var handleW = 3;
var googleLoaded = false;
var checkStartIntervalId;

google.load("jquery", "1.6.1");
google.setOnLoadCallback(setup);

// Add and setup start/stop bars and times
function setup() {
    var params = { allowScriptAccess: "always" };
    var atts = { id: "ytPlayer" };
    swfobject.embedSWF("http://www.youtube.com/e/"+vId+"?enablejsapi=1&version=3",
            "videoDiv", "720", "405", "8", null, null, params, atts);
}

function setupMark(id, left) {
    $('#'+id).css('width', '3px');
    $('#'+id).css('left', left);
    $('#'+id).css('cursor', 'auto');
}

function checkStart() {
    if (ytplayer.getPlayerState() >= 1 && ytplayer.getCurrentTime() >= start) {
        clearInterval(checkStartIntervalId);

        console.log('started');
        ytplayer.setVolume(100);
        $('#controls').show();

        setInterval(checkFinished, 250);
    }
}

function onYouTubePlayerReady(playerId) {
    ytplayer = $("#ytPlayer")[0];
    //ytplayer.setVolume(0);

    console.log('ready');
    checkStartIntervalId = setInterval(checkStart, 250);
    play();
    setupMark('startMark', timeToXCoord(start));
    setupMark('endMark', timeToXCoord(end));
}

function play() {
    ytplayer.seekTo(start);
    ytplayer.playVideo();
}

function timeToXCoord(secs) {
    return secs/ytplayer.getDuration()*(controlsW-handleW-pad) + handleW + pad;
}

function checkFinished() {
    if (ytplayer.getPlayerState() >= 1 && ytplayer.getPlayerState() != 2)
        if (ytplayer.getCurrentTime() >= end)
            ytplayer.pauseVideo();
}
