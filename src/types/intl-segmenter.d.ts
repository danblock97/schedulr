declare namespace Intl {
	interface SegmenterOptions {
		granularity?: "grapheme" | "word" | "sentence";
		localeMatcher?: "lookup" | "best fit";
	}

	interface Segment {
		segment: string;
		index: number;
		input: string;
		isWordLike?: boolean;
	}

	interface Segments {
		containing(codeUnitIndex: number): Segment | undefined;
		[Symbol.iterator](): IterableIterator<Segment>;
	}

	class Segmenter {
		constructor(locales?: string | string[], options?: SegmenterOptions);
		segment(input: string): Segments;
	}
}
