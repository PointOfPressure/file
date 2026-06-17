import {Config} from '@remotion/cli/config';

// Vertical short-form output, high quality.
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);

// CRF: lower = better quality / bigger file. 18 is visually near-lossless.
Config.setCodec('h264');
Config.setCrf(18);

// Headless rendering on a Linux server/container works best with swangle (software GL).
// On Mac/Windows desktops you can usually remove this line (or use 'angle').
Config.setChromiumOpenGlRenderer('swangle');
