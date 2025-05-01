# Media Integration for First Aid Instructions

This guide explains how to integrate audio and video files for first aid instructions in the Medexia Saver application.

## Overview

The Medexia Saver app supports multimedia instructions for first aid, including:
- Audio narration of first aid steps
- Video demonstrations of first aid procedures

These features enhance the user experience by providing clear, visual and auditory guidance for emergency situations.

## File Structure

Media files should be placed in the following directories:

- **Audio files**: `public/audio/`
- **Video files**: `public/video/`

## Required Audio Files

The application is configured to look for the following audio files:

### General Audio Files
- `general-first-aid.mp3` - General first aid instructions
- `burn-treatment.mp3` - Instructions for treating burns
- `cut-treatment.mp3` - Instructions for treating cuts
- `fracture-treatment.mp3` - Instructions for treating fractures

### Specific Step Audio Files
- `stop-bleeding.mp3` - Instructions for stopping bleeding
- `treat-burns.mp3` - Instructions for treating burns
- `apply-bandage.mp3` - Instructions for applying bandages
- `perform-cpr.mp3` - Instructions for performing CPR
- `immobilize-injury.mp3` - Instructions for immobilizing injuries
- `choking-treatment.mp3` - Instructions for choking treatment
- `stroke-assessment.mp3` - Instructions for stroke assessment

## Required Video Files

The application is configured to look for the following video files:

### Step-Specific Video Files
- `stop-bleeding.mp4` - Video demonstration of how to stop bleeding
- `treat-burns.mp4` - Video demonstration of how to treat burns
- `apply-bandage.mp4` - Video demonstration of how to apply bandages
- `perform-cpr.mp4` - Video demonstration of how to perform CPR
- `apply-splint.mp4` - Video demonstration of how to apply a splint
- `choking-treatment.mp4` - Video demonstration of choking treatment
- `stroke-assessment.mp4` - Video demonstration of stroke assessment

### General Video Files
- `general-firstaid.mp4` - General first aid instructions video

## Recommended Format and Specifications

### Audio Files
- **Format**: MP3
- **Bit rate**: 128 kbps or higher
- **Sample rate**: 44.1 kHz
- **Duration**: 30-90 seconds per instruction

### Video Files
- **Format**: MP4 (H.264 codec)
- **Resolution**: 720p (1280x720) or higher
- **Frame rate**: 30fps
- **Duration**: 30-120 seconds per demonstration
- **File size**: Keep under 10MB per video for optimal loading

## Adding Custom Media Files

You can add custom media files by:

1. Creating audio/video files matching the required specifications
2. Naming them according to the conventions listed above
3. Placing them in the appropriate directories

## Fallback Mechanism

If a specific media file is not found, the application will:

1. For audio: Use a generic audio file if available, or show a toast notification
2. For video: Use a generic video file if available, or show a toast notification

## Testing Media Integration

To test your media integration:

1. Add the media files to the appropriate directories
2. Run the application locally (`npm run dev`)
3. Navigate to the first aid instructions for a specific injury
4. Click the "Play Audio Instructions" or video buttons for specific steps
5. Verify that the media plays correctly

## Troubleshooting

If media files don't play:

1. Check that the files exist in the correct directories with the correct names
2. Verify the file formats are compatible with web browsers (MP3 for audio, MP4 with H.264 codec for video)
3. Check browser console for any errors related to media loading
4. Ensure the browser has permission to play audio/video (some browsers block autoplay)

## Adding New Media Types

To add support for new media types or additional files:

1. Update the mapping objects in `src/hooks/use-media-playback.ts` and `src/hooks/use-audio-instructions.ts`
2. Add the new media files to the appropriate directories
3. Update the documentation to reflect the new media types 