var pad = 6;
var controlsW = 717;
var handleW = 3;
var googleLoaded = false;
var showedMarks = 0;

google.load("jquery", "1.6.1");
google.setOnLoadCallback(setup);

// Add and setup start/stop bars and times
function setup() {
    var params = { allowScriptAccess: "always" };
    var atts = { id: "ytPlayer" };
    if (chromeless)
        swfobject.embedSWF("http://www.youtube.com/apiplayer?enablejsapi=1&version=3",
                "videoDiv", "720", "405", "8", null, null, params, atts);
    else 
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
    }
}

function onYouTubePlayerReady(playerId) {
    ytplayer = $("#ytPlayer")[0];
    ytplayer.addEventListener('onStateChange', 'onYtStateChange');
    
    if (chromeless)
        ytplayer.loadVideoById(vId, start);

    play();
    setInterval(checkFinished, 250);
}

function onYtStateChange(newState) {
    if (newState >= 1)
        if (!showedMarks)
            showMarks();
}

function showMarks() {
    setupMark('startMark', timeToXCoord(start));
    setupMark('endMark', timeToXCoord(end));

    $('#controls').css('visibility', 'visible');
    $('.hint').css('visibility', 'hidden');
    showedMarks = 1;
}

function play() {
    if (mute)
        ytplayer.setVolume(0);

    if (!chromeless)
        ytplayer.seekTo(start);

    ytplayer.playVideo();
}

function timeToXCoord(secs) {
    return secs/ytplayer.getDuration()*(controlsW-handleW-pad) + handleW + pad;
}

function checkFinished() {
    if (ytplayer.getPlayerState() >= 1 && ytplayer.getPlayerState() != 2)
        if (ytplayer.getCurrentTime() >= end)
            if (loop)
                ytplayer.seekTo(start);
            else
                ytplayer.pauseVideo();
}
