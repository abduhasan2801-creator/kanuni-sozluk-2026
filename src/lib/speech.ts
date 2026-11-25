export type SpeechStatus = 'idle' | 'speaking' | 'paused' | 'unsupported';

class LegalSpeechController {
  private currentText = '';
  private currentLang: 'tr' | 'ar' = 'tr';
  private listeners = new Set<(status: SpeechStatus, key: string) => void>();
  private activeKey = '';

  public subscribe(fn: (status: SpeechStatus, key: string) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(status: SpeechStatus, key: string) {
    this.activeKey = status === 'idle' ? '' : key;
    this.listeners.forEach((fn) => fn(status, key));
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public toggle(text: string, lang: 'tr' | 'ar', key: string): void {
    if (!this.isSupported()) {
      this.emit('unsupported', key);
      return;
    }

    const synth = window.speechSynthesis;

    if (this.activeKey === key && synth.speaking) {
      if (synth.paused) {
        synth.resume();
        this.emit('speaking', key);
      } else {
        synth.pause();
        this.emit('paused', key);
      }
      return;
    }

    synth.cancel();
    this.currentText = text;
    this.currentLang = lang;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const targetPrefix = lang === 'tr' ? 'tr' : 'ar';

    // Prefer exact Turkish (tr-TR) or Arabic (ar-EG / ar-SA / ar) voice without modifying spelling
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === (lang === 'tr' ? 'tr-tr' : 'ar-eg')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.lang = lang === 'tr' ? 'tr-TR' : 'ar-SA';
    utterance.rate = 0.92;

    utterance.onstart = () => this.emit('speaking', key);
    utterance.onpause = () => this.emit('paused', key);
    utterance.onresume = () => this.emit('speaking', key);
    utterance.onend = () => this.emit('idle', key);
    utterance.onerror = () => this.emit('idle', key);

    this.emit('speaking', key);
    synth.speak(utterance);
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    this.emit('idle', '');
  }

  public getActiveInfo() {
    return { text: this.currentText, lang: this.currentLang, key: this.activeKey };
  }
}

export const speechController = new LegalSpeechController();
