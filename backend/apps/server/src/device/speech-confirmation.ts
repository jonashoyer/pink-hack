export const CONFIRMATION_PHRASES = ["save this journal", "confirm this journal"] as const;
export const TRANSCRIPT_SETTLE_MS = 750;
export type ArmedReview = { checkinId: string; revision: number; generation: number; operationId: string };
type Capture = { arm: ArmedReview; text: string; ended: boolean };
export function normalizedConfirmation(text: string) {
  return text.normalize("NFKC").toLowerCase().replace(/\p{P}/gu, " ").replace(/\s+/g, " ").trim();
}

// Live ASR fragments have no complete-turn event. This debounce is a conservative
// capture boundary heuristic, not proof of a lossless transcript. It requires
// real device capture after arming, explicit PTT end and the whole exact phrase.
export class SpeechConfirmation {
  private review?: ArmedReview;
  private capture?: Capture;
  private timer?: ReturnType<typeof setTimeout>;
  constructor(private readonly confirm: (review: ArmedReview) => void) {}
  arm(review: ArmedReview) {
    if (this.review?.checkinId === review.checkinId && this.review.revision === review.revision
      && this.review.generation === review.generation && this.review.operationId === review.operationId) return;
    this.clear(); this.review = { ...review };
  }
  clear() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined; this.review = undefined; this.capture = undefined;
  }
  captureChunk() {
    if (!this.review) return;
    if (!this.capture || this.capture.ended) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = undefined;
      this.capture = { arm: { ...this.review }, text: "", ended: false };
    }
  }
  inputTranscript(text: string) {
    if (!this.capture) return;
    this.capture.text += text;
    if (this.capture.text.length > 256) { this.capture = undefined; if (this.timer) clearTimeout(this.timer); this.timer = undefined; return; }
    if (this.capture.ended) this.settle();
  }
  turnEnd() {
    if (!this.capture) return;
    this.capture.ended = true; this.settle();
  }
  private settle() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = undefined;
      const capture = this.capture; this.capture = undefined;
      if (!capture?.ended || !this.review || capture.arm.checkinId !== this.review.checkinId
        || capture.arm.revision !== this.review.revision || capture.arm.generation !== this.review.generation) return;
      const phrase = normalizedConfirmation(capture.text);
      if (CONFIRMATION_PHRASES.some((allowed) => phrase === allowed)) this.confirm({ ...capture.arm });
    }, TRANSCRIPT_SETTLE_MS);
    this.timer.unref();
  }
}
