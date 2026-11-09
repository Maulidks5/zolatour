<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class WebImageStorage
{
    public function store(UploadedFile $file, string $directory, int $maxWidth = 1600): string
    {
        $source = imagecreatefromstring($file->get());

        if ($source === false) {
            throw new RuntimeException('The uploaded image could not be processed.');
        }

        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        $targetWidth = min($sourceWidth, $maxWidth);
        $targetHeight = (int) round($sourceHeight * ($targetWidth / $sourceWidth));
        $target = imagecreatetruecolor($targetWidth, $targetHeight);

        imagealphablending($target, false);
        imagesavealpha($target, true);
        imagecopyresampled(
            $target,
            $source,
            0,
            0,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $sourceWidth,
            $sourceHeight,
        );

        ob_start();
        imagewebp($target, null, 78);
        $contents = ob_get_clean();

        imagedestroy($source);
        imagedestroy($target);

        if (! is_string($contents)) {
            throw new RuntimeException('The uploaded image could not be encoded.');
        }

        $path = trim($directory, '/').'/'.Str::uuid().'.webp';
        Storage::disk('public')->put($path, $contents);

        return $path;
    }
}
