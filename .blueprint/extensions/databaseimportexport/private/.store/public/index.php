<?php

header('Content-Type: application/json');

echo(json_encode([
	'7b964e627170c6d0b8fc738139b9e595:210169' => [
		'version' => '{version}',
		'engine' => '{engine}',
		'timestamp' => {timestamp},
		'target' => '{target}',
	]
]));