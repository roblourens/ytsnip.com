<?php

    function timeParmToSecs($time) {
        preg_match('/^((\d*)(m))?((\d*)(s))?$/', $time, $matches);
        $timeInt = -1;
        if (sizeof($matches) == 7) {
            if ($matches[1] != "")
                $timeInt = intval($matches[2]*60 + $matches[5]);
            else
                $timeInt = intval($matches[5]);
        }
        else if (sizeof($matches) == 4)
            $timeInt = intval($matches[2]*60);

        return $timeInt;
    }

    $start = $end = $vId = -1;
    if (in_array('t', array_keys($_GET)))
        $start = timeParmToSecs($_GET['t']);
    if (in_array('e', array_keys($_GET)))
        $end = timeParmToSecs($_GET['e']);
    if (in_array('v', array_keys($_GET)))
        $vId = $_GET['v'];

    $play = false;
    // If everything was set up properly, show the video, otherwise, show video creation
    if ($end!=-1 && $vId!=-1) {
        $urlBase = 'http://www.youtube.com/e/';
        $urlParams = '?enablejsapi=1&playerapiidplayer1';
        $url = $urlBase.$vId;
        if ($start != -1)
            $url .= '&start='.$start;

        $play = true;
    }
?>


<html>
  <title>YT Snip</title>
  <link rel="stylesheet" href="snip.css" type="text/css" />
  <script type="text/javascript" src="swfobject.js"></script>    
  <script src="https://www.google.com/jsapi?key=ABQIAAAAtkZTR2eMxx0GL_VK6Y_oCBT2yXp_ZAY8_ufC3CFXhHIE1NvwkxRCuoGQ8F5lQGWvLPTFj1K0i4mVmA" type="text/javascript"></script>
  <script type="text/javascript">
    var start = <?php echo $start ?>;
    var end = <?php echo $end ?>;
    var vId = '<?php echo $vId ?>';
  </script>
<?php if ($play) echo "
  <script type='text/javascript' src='playscripts.js'></script>";
      else echo "
  <script type='text/javascript' src='snipscripts.js'></script>"; ?>

  <body>
    <div id="title">YT Snip</div>
    <div id="vidArea">
<?php if (!$play) echo "
        <form id='inputForm' action='javascript: loadVid()'>Video URL or ID: <input id='vidUrl' /><input type='submit' value=\"Load for snippin'\" /></form><div id='inputErr'>There's something wrong with that input... try again</div>"; ?>
        <div id='videoDiv'></div>
        <div id='controls'>
            <div id='startMarkBar'><div id='startMark'></div></div>
            <div id='endMarkBar'><div id='endMark'></div></div>
<?php if (!$play) echo "
            <form id='startForm' action='javascript: updateMarks()'><input id='startTime' /></form>
            <button id='playButton' onMouseUp='javascript: play()'>Play clip</button>
            <form id='endForm' action='javascript: updateMarks()'><input id='endTime' /></form>
            <form id='result'>Link to this clip: <input id='resultURL' /></form>
        </div>"; ?>
    </div>
  </body>
</html>
