/**
 * Mock audio service
 */

declare interface AudioService {
	play(file: string): Promise<void>;
}

export declare const audioService: AudioService;
