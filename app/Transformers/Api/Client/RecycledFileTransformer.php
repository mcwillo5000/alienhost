<?php

namespace Pterodactyl\Transformers\Api\Client;

use Pterodactyl\Models\RecycledFile;

class RecycledFileTransformer extends BaseClientTransformer
{
    public function getResourceName(): string
    {
        return 'recycled_file_object';
    }

    public function transform(RecycledFile $item): array
    {
        return [
            'name' => $item->path,
            'mode' => '0644',
            'mode_bits' => 0644,
            'size' => 0,
            'is_file' => false,
            'is_symlink' => false,
            'is_trash' => true,
            'trash_id' => $item->id,
            'mimetype' => 'application/octet-stream',
            'created_at' => $item->created_at->toAtomString(),
            'modified_at' => $item->updated_at->toAtomString(),
        ];
    }
}
