<?php
  header('Content-Type: application/json');

$sheet = '';
if(isset($_GET["sheet"])) {
  $sheet = htmlspecialchars($_GET["sheet"]);
}

$tab = '0';
if(isset($_GET["tab"])) {
  $tab = htmlspecialchars($_GET["tab"]);
}

$url = 'https://spreadsheets.google.com/feeds/list/' . $sheet . '/' . $tab . '/public/values?alt=json';


//Use file_get_contents to GET the URL in question.
$contents = file_get_contents($url);

//If $contents is not a boolean FALSE value.
if($contents !== false){
    // Print out the contents.
    // echo $contents;
    // echo $contents;

    $obj = json_decode($contents);
    $feed = $obj->{'feed'};
    $entries = $feed->{'entry'};

    $arrlength = count($entries);

    $result = '{ ';

    $result = $result . '"' . $entries[0]->{'gsx$name'}->{'$t'} . '":';
    $result = $result . '"' . $entries[0]->{'gsx$location'}->{'$t'} . '"';
    for($x = 1; $x < $arrlength; $x++) {
        $result = $result . ', "' . $entries[$x]->{'gsx$name'}->{'$t'} . '":';
        $result = $result . '"' . $entries[$x]->{'gsx$location'}->{'$t'} . '"';
    }
    $result = $result . ' }';
    echo $result;
}

?>