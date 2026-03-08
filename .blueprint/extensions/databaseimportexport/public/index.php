<?php

header('Content-Type: application/json');

echo(json_encode([
	'7b964e627170c6d0b8fc738139b9e595:210169' => [
		'version' => '1.3.1',
		'engine' => 'ainx',
		'timestamp' => 1773004502,
		'target' => 'ainx@1.13.22 beta-2024-12',
	]
]));